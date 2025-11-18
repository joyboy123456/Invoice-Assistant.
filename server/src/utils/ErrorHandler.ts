/**
 * Custom Error Types for the AI Invoice Organizer System
 */

// File processing errors
export enum FileErrorType {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

export class FileError extends Error {
  constructor(
    public type: FileErrorType,
    public fileName: string,
    message: string
  ) {
    super(message);
    this.name = 'FileError';
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

// AI API errors
export enum AIErrorType {
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_ENDPOINT_INVALID = 'API_ENDPOINT_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  TIMEOUT = 'TIMEOUT',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS'
}

export class AIError extends Error {
  constructor(
    public type: AIErrorType,
    public retryable: boolean,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
    Object.setPrototypeOf(this, AIError.prototype);
  }
}

// Validation errors
export enum ValidationErrorType {
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  OUT_OF_RANGE = 'OUT_OF_RANGE'
}

export class ValidationError extends Error {
  constructor(
    public type: ValidationErrorType,
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * User-friendly error message mappings
 */
export const ErrorMessages = {
  // File errors
  [FileErrorType.UNSUPPORTED_FORMAT]: '不支持的文件格式，请上传PDF、PNG、JPG或JPEG文件',
  [FileErrorType.FILE_TOO_LARGE]: '文件大小超过限制（最大10MB），请压缩后重试',
  [FileErrorType.CORRUPTED_FILE]: '文件已损坏或无法读取，请检查文件完整性',
  [FileErrorType.PROCESSING_FAILED]: '文件处理失败，请稍后重试',
  [FileErrorType.UPLOAD_FAILED]: '文件上传失败，请检查网络连接',

  // AI errors
  [AIErrorType.API_KEY_INVALID]: 'API密钥无效，请检查配置',
  [AIErrorType.API_ENDPOINT_INVALID]: 'API端点地址无效，请检查配置',
  [AIErrorType.RATE_LIMIT_EXCEEDED]: 'API调用频率超限，请稍后重试',
  [AIErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [AIErrorType.PARSING_ERROR]: 'AI响应解析失败，请重试',
  [AIErrorType.TIMEOUT]: 'AI请求超时，请重试',
  [AIErrorType.INSUFFICIENT_CREDITS]: 'API额度不足，请充值后继续',

  // Validation errors
  [ValidationErrorType.INVALID_INPUT]: '输入数据无效',
  [ValidationErrorType.MISSING_REQUIRED_FIELD]: '缺少必填字段',
  [ValidationErrorType.INVALID_FORMAT]: '数据格式不正确',
  [ValidationErrorType.OUT_OF_RANGE]: '数值超出允许范围'
};

/**
 * Error Handler with fallback and recovery mechanisms
 */
export class ErrorHandler {
  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: Error): string {
    if (error instanceof FileError) {
      return ErrorMessages[error.type] || error.message;
    }
    
    if (error instanceof AIError) {
      return ErrorMessages[error.type] || error.message;
    }
    
    if (error instanceof ValidationError) {
      return `${ErrorMessages[error.type] || error.message}: ${error.field}`;
    }
    
    return '发生未知错误，请稍后重试';
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof AIError) {
      return error.retryable;
    }
    
    if (error instanceof FileError) {
      // File processing errors are generally not retryable
      return error.type === FileErrorType.PROCESSING_FAILED;
    }
    
    return false;
  }

  /**
   * Fallback processing for AI recognition failures
   * Returns empty document data for manual editing
   */
  static createFallbackDocument(fileName: string, errorMessage: string): any {
    return {
      id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName,
      fileType: fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
      documentType: 'invoice', // Default to invoice
      
      // Empty fields for manual editing
      date: '',
      amount: 0,
      description: '',
      confidence: 0,
      
      // Status
      status: 'error',
      errorMessage: `自动识别失败: ${errorMessage}。请手动编辑文档信息。`
    };
  }

  /**
   * Handle API errors with appropriate response
   */
  static handleAPIError(error: Error): { statusCode: number; message: string; retryable: boolean } {
    if (error instanceof FileError) {
      return {
        statusCode: 400,
        message: this.getUserFriendlyMessage(error),
        retryable: this.isRetryable(error)
      };
    }
    
    if (error instanceof AIError) {
      const statusCode = error.statusCode || 500;
      return {
        statusCode,
        message: this.getUserFriendlyMessage(error),
        retryable: this.isRetryable(error)
      };
    }
    
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        message: this.getUserFriendlyMessage(error),
        retryable: false
      };
    }
    
    return {
      statusCode: 500,
      message: this.getUserFriendlyMessage(error),
      retryable: false
    };
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if error is not retryable
        if (!this.isRetryable(lastError)) {
          throw lastError;
        }
        
        // Don't wait after last attempt
        if (attempt < maxRetries - 1) {
          const delay = initialDelayMs * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Delay helper for retry mechanism
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitize error for logging (remove sensitive data)
   */
  static sanitizeError(error: Error): any {
    const sanitized: any = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
    
    if (error instanceof AIError) {
      sanitized.type = error.type;
      sanitized.retryable = error.retryable;
      sanitized.statusCode = error.statusCode;
    }
    
    if (error instanceof FileError) {
      sanitized.type = error.type;
      sanitized.fileName = error.fileName;
    }
    
    if (error instanceof ValidationError) {
      sanitized.type = error.type;
      sanitized.field = error.field;
    }
    
    return sanitized;
  }
}
