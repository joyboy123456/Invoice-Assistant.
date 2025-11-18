import sharp from 'sharp';
import { FileError, FileErrorType } from '../types';
import { memoryManager } from '../utils/MemoryManager';

const pdf = require('pdf-poppler');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

interface ProcessedFile {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export class FileService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];
  private readonly IMAGE_MAX_WIDTH = 2048;
  private readonly IMAGE_QUALITY = 85;

  // 验证文件
  validateFile(file: Express.Multer.File): void {
    // 检查文件大小
    if (file.size > this.MAX_FILE_SIZE) {
      throw new FileError(
        FileErrorType.FILE_TOO_LARGE,
        file.originalname,
        `文件大小超过限制（最大10MB）`
      );
    }

    // 检查文件类型
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new FileError(
        FileErrorType.UNSUPPORTED_FORMAT,
        file.originalname,
        `不支持的文件格式，仅支持 PDF、PNG、JPG`
      );
    }
  }

  // 处理上传的文件
  async processUpload(file: Express.Multer.File): Promise<ProcessedFile> {
    this.validateFile(file);

    // 监控内存
    await memoryManager.monitorAndClean();

    return {
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  // PDF转图片
  async pdfToImages(pdfBuffer: Buffer, fileName: string): Promise<Buffer[]> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-'));
    const pdfPath = path.join(tempDir, 'input.pdf');
    const outputPrefix = path.join(tempDir, 'page');

    try {
      // 写入临时PDF文件
      await fs.writeFile(pdfPath, pdfBuffer);

      // 转换PDF为图片
      const options = {
        format: 'png',
        out_dir: tempDir,
        out_prefix: 'page',
        page: null, // 转换所有页面
      };

      await pdf.convert(pdfPath, options);

      // 读取生成的图片
      const files = await fs.readdir(tempDir);
      const imageFiles = files.filter((f: string) => f.startsWith('page') && f.endsWith('.png'));
      
      if (imageFiles.length === 0) {
        throw new FileError(
          FileErrorType.PROCESSING_FAILED,
          fileName,
          'PDF转换失败，未生成图片'
        );
      }

      // 读取所有图片buffer
      const imageBuffers: Buffer[] = [];
      for (const imageFile of imageFiles.sort()) {
        const imagePath = path.join(tempDir, imageFile);
        const buffer = await fs.readFile(imagePath);
        imageBuffers.push(buffer);
      }

      return imageBuffers;
    } catch (error: any) {
      throw new FileError(
        FileErrorType.PROCESSING_FAILED,
        fileName,
        `PDF处理失败: ${error.message}`
      );
    } finally {
      // 清理临时文件
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('清理临时文件失败:', cleanupError);
      }
    }
  }

  // 压缩和优化图片
  async compressImage(imageBuffer: Buffer, fileName: string): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // 如果图片宽度超过限制，进行缩放
      let processedImage = image;
      if (metadata.width && metadata.width > this.IMAGE_MAX_WIDTH) {
        processedImage = image.resize(this.IMAGE_MAX_WIDTH, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // 转换为JPEG并压缩
      const compressedBuffer = await processedImage
        .jpeg({ quality: this.IMAGE_QUALITY })
        .toBuffer();

      return compressedBuffer;
    } catch (error: any) {
      throw new FileError(
        FileErrorType.PROCESSING_FAILED,
        fileName,
        `图片压缩失败: ${error.message}`
      );
    }
  }

  // 转换为Base64
  async convertToBase64(imageBuffer: Buffer): Promise<string> {
    return imageBuffer.toString('base64');
  }

  // 处理文件并转换为Base64（主要方法）
  async processFileToBase64(file: Express.Multer.File): Promise<string[]> {
    const processed = await this.processUpload(file);
    const base64Images: string[] = [];

    try {
      if (processed.mimeType === 'application/pdf') {
        // PDF转图片
        const imageBuffers = await this.pdfToImages(processed.buffer, processed.originalName);
        
        // 压缩每一页并转换为Base64
        for (const imageBuffer of imageBuffers) {
          const compressed = await this.compressImage(imageBuffer, processed.originalName);
          const base64 = await this.convertToBase64(compressed);
          base64Images.push(base64);
        }
      } else {
        // 图片直接压缩并转换
        const compressed = await this.compressImage(processed.buffer, processed.originalName);
        const base64 = await this.convertToBase64(compressed);
        base64Images.push(base64);
      }

      return base64Images;
    } catch (error: any) {
      if (error instanceof FileError) {
        throw error;
      }
      throw new FileError(
        FileErrorType.PROCESSING_FAILED,
        processed.originalName,
        `文件处理失败: ${error.message}`
      );
    }
  }

  // 获取文件类型
  getFileType(mimeType: string): 'pdf' | 'image' {
    return mimeType === 'application/pdf' ? 'pdf' : 'image';
  }
}

// 导出单例
export const fileService = new FileService();
