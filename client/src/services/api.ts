import type {
  APIConfig,
  DocumentData,
  ProjectInfo,
  SortingResult,
  TestConnectionResponse,
  RecognizeResponse,
  BatchProcessResponse,
} from '../types';

// API base URL - defaults to same origin in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API错误类
 */
export class APIError extends Error {
  statusCode: number;
  code: string;

  constructor(
    statusCode: number,
    code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * 处理API响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new APIError(
        response.status,
        'UNKNOWN_ERROR',
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    throw new APIError(
      response.status,
      errorData.error?.code || 'UNKNOWN_ERROR',
      errorData.error?.message || response.statusText
    );
  }

  // 对于文件下载，返回blob
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/pdf') || contentType?.includes('application/zip')) {
    return response.blob() as Promise<T>;
  }

  return response.json();
}

/**
 * 测试AI API连接
 */
export async function testConnection(apiConfig: APIConfig): Promise<TestConnectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiConfig }),
  });

  return handleResponse<TestConnectionResponse>(response);
}

/**
 * 上传单个文件
 */
export async function uploadFile(file: File): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

/**
 * 识别单个文档
 */
export async function recognizeDocument(
  file: File,
  apiConfig: APIConfig
): Promise<RecognizeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('apiConfig', JSON.stringify(apiConfig));

  const response = await fetch(`${API_BASE_URL}/api/recognize`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<RecognizeResponse>(response);
}

/**
 * 批量处理文档
 */
export async function batchProcess(
  files: File[],
  apiConfig: APIConfig
): Promise<BatchProcessResponse> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  formData.append('apiConfig', JSON.stringify(apiConfig));

  const response = await fetch(`${API_BASE_URL}/api/batch-process`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<BatchProcessResponse>(response);
}

/**
 * 生成PDF汇总表
 */
export async function generatePDF(
  documents: DocumentData[],
  projectInfo: ProjectInfo,
  sorting: SortingResult
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      documents,
      projectInfo,
      sorting,
    }),
  });

  return handleResponse<Blob>(response);
}

/**
 * 生成完整文件包（ZIP）
 */
export async function generatePackage(
  files: File[],
  documents: DocumentData[],
  projectInfo: ProjectInfo,
  sorting: SortingResult
): Promise<Blob> {
  const formData = new FormData();
  
  // 添加文件
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  // 添加元数据
  formData.append('documents', JSON.stringify(documents));
  formData.append('projectInfo', JSON.stringify(projectInfo));
  formData.append('sorting', JSON.stringify(sorting));

  const response = await fetch(`${API_BASE_URL}/api/generate-package`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<Blob>(response);
}

/**
 * 下载文件辅助函数
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
