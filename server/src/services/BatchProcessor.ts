import { DocumentData, APIConfig, PairingResult, SortingResult, Warning, FileError, AIError } from '../types';
import { fileService } from './FileService';
import { aiService } from './AIService';
import { PairingService } from './PairingService';
import { SortingService } from './SortingService';
import { AnomalyDetector } from './AnomalyDetector';
import { memoryManager } from '../utils/MemoryManager';

/**
 * 批量处理进度回调函数类型
 */
export type ProgressCallback = (progress: BatchProgress) => void;

/**
 * 批量处理进度信息
 */
export interface BatchProgress {
  stage: 'uploading' | 'recognizing' | 'pairing' | 'sorting' | 'detecting' | 'completed' | 'error';
  currentStep: number;
  totalSteps: number;
  currentFile?: string;
  message: string;
  documents?: DocumentData[];
  pairs?: PairingResult;
  sorting?: SortingResult;
  warnings?: Warning[];
}

/**
 * 批量处理结果
 */
export interface BatchProcessResult {
  documents: DocumentData[];
  pairs: PairingResult;
  sorting: SortingResult;
  warnings: Warning[];
  errors: Array<{ fileName: string; error: string }>;
}

/**
 * 批量处理服务
 * 协调所有服务，按顺序执行：文件处理 → AI识别 → 配对 → 排序 → 异常检测
 */
export class BatchProcessor {
  private pairingService: PairingService;
  private sortingService: SortingService;
  private anomalyDetector: AnomalyDetector;

  constructor() {
    this.pairingService = new PairingService();
    this.sortingService = new SortingService();
    this.anomalyDetector = new AnomalyDetector();
  }

  /**
   * 批量处理文档
   * @param files 上传的文件列表
   * @param apiConfig AI API配置
   * @param progressCallback 进度回调函数（可选）
   * @returns 批量处理结果
   */
  async processBatch(
    files: Express.Multer.File[],
    apiConfig: APIConfig,
    progressCallback?: ProgressCallback
  ): Promise<BatchProcessResult> {
    const documents: DocumentData[] = [];
    const errors: Array<{ fileName: string; error: string }> = [];
    const totalSteps = files.length;

    try {
      // 阶段1: 文件处理和AI识别
      this.notifyProgress(progressCallback, {
        stage: 'recognizing',
        currentStep: 0,
        totalSteps,
        message: '开始处理文件...'
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // 更新进度
          this.notifyProgress(progressCallback, {
            stage: 'recognizing',
            currentStep: i + 1,
            totalSteps,
            currentFile: file.originalname,
            message: `正在识别文件 ${i + 1}/${totalSteps}: ${file.originalname}`,
            documents: [...documents]
          });

          // 处理单个文件
          const processedDocuments = await this.processFile(file, apiConfig);
          documents.push(...processedDocuments);

          // 监控内存使用
          await memoryManager.monitorAndClean();

        } catch (error) {
          // 记录错误但继续处理其他文件
          const errorMessage = this.getErrorMessage(error);
          console.error(`处理文件失败 ${file.originalname}:`, errorMessage);
          
          errors.push({
            fileName: file.originalname,
            error: errorMessage
          });

          // 创建错误状态的文档记录
          documents.push(this.createErrorDocument(file, errorMessage));
        }
      }

      // 如果所有文件都失败了，抛出错误
      if (documents.length === 0) {
        throw new Error('所有文件处理失败，请检查文件格式和API配置');
      }

      // 阶段2: 智能配对
      this.notifyProgress(progressCallback, {
        stage: 'pairing',
        currentStep: totalSteps,
        totalSteps,
        message: '正在进行智能配对...',
        documents: [...documents]
      });

      const pairs = this.pairingService.pairDocuments(documents);

      // 阶段3: 智能排序
      this.notifyProgress(progressCallback, {
        stage: 'sorting',
        currentStep: totalSteps,
        totalSteps,
        message: '正在进行智能排序...',
        documents: [...documents],
        pairs
      });

      const sorting = this.sortingService.sortDocuments(documents, pairs);

      // 阶段4: 异常检测
      this.notifyProgress(progressCallback, {
        stage: 'detecting',
        currentStep: totalSteps,
        totalSteps,
        message: '正在检测异常...',
        documents: [...documents],
        pairs,
        sorting
      });

      const warnings = this.anomalyDetector.detectAnomalies(documents, pairs);

      // 完成
      const result: BatchProcessResult = {
        documents,
        pairs,
        sorting,
        warnings,
        errors
      };

      this.notifyProgress(progressCallback, {
        stage: 'completed',
        currentStep: totalSteps,
        totalSteps,
        message: `处理完成！成功处理 ${documents.filter(d => d.status === 'completed').length}/${totalSteps} 个文件`,
        documents,
        pairs,
        sorting,
        warnings
      });

      return result;

    } catch (error) {
      // 处理致命错误
      const errorMessage = this.getErrorMessage(error);
      console.error('批量处理失败:', errorMessage);

      this.notifyProgress(progressCallback, {
        stage: 'error',
        currentStep: 0,
        totalSteps,
        message: `处理失败: ${errorMessage}`,
        documents: [...documents]
      });

      throw error;
    }
  }

  /**
   * 处理单个文件
   * @param file 文件
   * @param apiConfig API配置
   * @returns 识别后的文档数据数组（PDF可能有多页）
   */
  private async processFile(
    file: Express.Multer.File,
    apiConfig: APIConfig
  ): Promise<DocumentData[]> {
    // 1. 文件处理：转换为Base64图片
    const base64Images = await fileService.processFileToBase64(file);

    // 2. AI识别：对每一页进行识别
    const documents: DocumentData[] = [];
    
    for (let i = 0; i < base64Images.length; i++) {
      const base64Image = base64Images[i];
      
      // 生成文件名（如果是多页PDF，添加页码）
      const fileName = base64Images.length > 1
        ? `${file.originalname} (第${i + 1}页)`
        : file.originalname;

      // 调用AI识别
      const document = await aiService.recognizeDocument(
        base64Image,
        apiConfig,
        fileName
      );

      documents.push(document);
    }

    return documents;
  }

  /**
   * 创建错误状态的文档记录
   * @param file 文件
   * @param errorMessage 错误消息
   * @returns 错误文档数据
   */
  private createErrorDocument(file: Express.Multer.File, errorMessage: string): DocumentData {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fileName: file.originalname,
      fileType: file.mimetype === 'application/pdf' ? 'pdf' : 'image',
      documentType: 'invoice',
      date: '',
      amount: 0,
      description: '',
      confidence: 0,
      status: 'error',
      errorMessage
    };
  }

  /**
   * 获取错误消息
   * @param error 错误对象
   * @returns 错误消息字符串
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof FileError) {
      return `文件错误: ${error.message}`;
    }
    
    if (error instanceof AIError) {
      return `AI识别错误: ${error.message}`;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return '未知错误';
  }

  /**
   * 通知进度更新
   * @param callback 进度回调函数
   * @param progress 进度信息
   */
  private notifyProgress(callback: ProgressCallback | undefined, progress: BatchProgress): void {
    if (callback) {
      try {
        callback(progress);
      } catch (error) {
        console.error('进度回调执行失败:', error);
      }
    }
  }
}

// 导出单例
export const batchProcessor = new BatchProcessor();
