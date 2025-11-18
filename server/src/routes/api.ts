import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { fileService } from '../services/FileService';
import { aiService } from '../services/AIService';
import { batchProcessor } from '../services/BatchProcessor';
import { PDFGenerator } from '../services/PDFGenerator';
import { packageService } from '../services/PackageService';
import {
  APIConfig,
  FileError,
  AIError,
  ValidationError,
  TestConnectionResponse,
  RecognizeResponse,
  BatchProcessResponse,
  GeneratePDFRequest,
  GeneratePackageRequest
} from '../types';

const router = Router();

/**
 * 验证API配置
 */
function validateAPIConfig(config: any): APIConfig {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('API配置不能为空');
  }

  const { endpoint, apiKey, model } = config;

  if (!endpoint || typeof endpoint !== 'string') {
    throw new ValidationError('API端点URL无效');
  }

  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    throw new ValidationError('API密钥格式无效');
  }

  if (!model || typeof model !== 'string') {
    throw new ValidationError('模型名称不能为空');
  }

  // 验证URL格式
  try {
    new URL(endpoint);
  } catch {
    throw new ValidationError('API端点URL格式无效');
  }

  return { endpoint, apiKey, model };
}

/**
 * POST /api/test-connection
 * 测试AI API连接
 */
router.post('/test-connection', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiConfig = validateAPIConfig(req.body.apiConfig);
    
    const result = await aiService.testConnection(apiConfig);
    
    const response: TestConnectionResponse = {
      success: result.success,
      message: result.message
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload
 * 文件上传（单个文件）
 */
router.post('/upload', uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ValidationError('未上传文件');
    }

    // 验证文件
    fileService.validateFile(req.file);

    res.json({
      success: true,
      message: '文件上传成功',
      file: {
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/recognize
 * 单个文档识别
 */
router.post('/recognize', uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ValidationError('未上传文件');
    }

    // 验证API配置
    const apiConfig = validateAPIConfig(req.body.apiConfig);

    // 处理文件并转换为Base64
    const base64Images = await fileService.processFileToBase64(req.file);

    // 识别第一页（如果是PDF多页，只识别第一页）
    const document = await aiService.recognizeDocument(
      base64Images[0],
      apiConfig,
      req.file.originalname
    );

    const response: RecognizeResponse = {
      document
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/batch-process
 * 批量处理文档
 */
router.post('/batch-process', uploadMultiple, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ValidationError('未上传文件');
    }

    // 验证API配置
    const apiConfig = validateAPIConfig(req.body.apiConfig);

    // 批量处理
    const result = await batchProcessor.processBatch(
      req.files,
      apiConfig
    );

    const response: BatchProcessResponse = {
      documents: result.documents,
      pairs: result.pairs,
      sorting: result.sorting,
      warnings: result.warnings
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/generate-pdf
 * 生成PDF汇总表
 */
router.post('/generate-pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documents, projectInfo, sorting }: GeneratePDFRequest = req.body;

    // 验证必需字段
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new ValidationError('文档数据不能为空');
    }

    if (!projectInfo || !projectInfo.projectName || !projectInfo.department || !projectInfo.reimbursementPeriod) {
      throw new ValidationError('项目信息不完整');
    }

    if (!sorting || !sorting.suggestedOrder || !Array.isArray(sorting.suggestedOrder)) {
      throw new ValidationError('排序信息不能为空');
    }

    // 生成PDF
    const pdfGenerator = new PDFGenerator();
    const pdfBuffer = await pdfGenerator.generatePDFSummary(documents, projectInfo, sorting);

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="expense_summary_${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // 发送PDF文件
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/generate-package
 * 生成完整文件包（ZIP）
 */
router.post('/generate-package', uploadMultiple, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ValidationError('未上传文件');
    }

    // 解析请求体中的JSON数据
    const documentsJson = req.body.documents;
    const sortingJson = req.body.sorting;
    const projectInfoJson = req.body.projectInfo;

    if (!documentsJson || !sortingJson || !projectInfoJson) {
      throw new ValidationError('缺少必需的参数');
    }

    // 解析JSON字符串
    const documents = typeof documentsJson === 'string' ? JSON.parse(documentsJson) : documentsJson;
    const sorting = typeof sortingJson === 'string' ? JSON.parse(sortingJson) : sortingJson;
    const projectInfo = typeof projectInfoJson === 'string' ? JSON.parse(projectInfoJson) : projectInfoJson;

    // 验证数据
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new ValidationError('文档数据不能为空');
    }

    if (!sorting.suggestedOrder || !Array.isArray(sorting.suggestedOrder)) {
      throw new ValidationError('排序信息不能为空');
    }

    // 创建文件Buffer映射
    const fileBuffers = new Map<string, Buffer>();
    req.files.forEach((file, index) => {
      // 假设文件顺序与documents数组顺序一致
      if (documents[index]) {
        fileBuffers.set(documents[index].id, file.buffer);
      }
    });

    // 生成ZIP包
    const zipBuffer = await packageService.generatePackage(
      documents,
      sorting,
      projectInfo,
      fileBuffers
    );

    // 设置响应头
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="expense_package_${Date.now()}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    // 发送ZIP文件
    res.send(zipBuffer);
  } catch (error) {
    next(error);
  }
});

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('API错误:', error);

  // 文件错误
  if (error instanceof FileError) {
    res.status(400).json({
      success: false,
      error: {
        type: 'FileError',
        code: error.type,
        message: error.message,
        fileName: error.fileName
      }
    });
    return;
  }

  // AI错误
  if (error instanceof AIError) {
    const statusCode = error.type === 'API_KEY_INVALID' ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        type: 'AIError',
        code: error.type,
        message: error.message,
        retryable: error.retryable
      }
    });
    return;
  }

  // 验证错误
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        type: 'ValidationError',
        message: error.message
      }
    });
    return;
  }

  // Multer错误
  if (error.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: {
        type: 'UploadError',
        message: error.message
      }
    });
    return;
  }

  // 默认错误
  res.status(500).json({
    success: false,
    error: {
      type: 'InternalError',
      message: process.env.NODE_ENV === 'production' 
        ? '服务器内部错误' 
        : error.message
    }
  });
}

export default router;
