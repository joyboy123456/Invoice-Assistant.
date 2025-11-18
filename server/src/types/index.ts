// 文档类型
export type DocumentType = 'invoice' | 'trip_sheet';
export type FileType = 'pdf' | 'image';
export type InvoiceType = 'taxi' | 'hotel' | 'train' | 'shipping' | 'toll' | 'consumables' | 'other';
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'error';

// 行程单详情
export interface TripDetails {
  platform: string;
  departure: string;
  destination: string;
  time: string;
  distanceKm: number;
}

// 文档数据模型
export interface DocumentData {
  id: string;
  fileName: string;
  fileType: FileType;
  documentType: DocumentType;
  
  // 基础信息
  date: string;
  amount: number;
  description: string;
  confidence: number;
  
  // 发票专属字段
  invoiceNumber?: string;
  vendor?: string;
  taxAmount?: number;
  invoiceType?: InvoiceType;
  
  // 行程单专属字段
  tripDetails?: TripDetails;
  
  // 处理状态
  status: DocumentStatus;
  errorMessage?: string;
}

// 配对结果
export interface PairingPair {
  invoiceId: string;
  tripSheetId: string;
  confidence: number;
  matchReason: string;
}

export interface PairingResult {
  pairs: PairingPair[];
  unmatchedInvoices: string[];
  unmatchedTripSheets: string[];
}

// 警告类型
export type WarningType = 'duplicate' | 'amount_anomaly' | 'date_gap' | 'missing_pair';

export interface Warning {
  type: WarningType;
  message: string;
  documentIds: string[];
  severity?: 'low' | 'medium' | 'high';
}

// 排序结果
export interface SortingResult {
  suggestedOrder: string[];
  grouping: Record<string, string[]>;
}

// 项目信息
export interface ProjectInfo {
  projectName: string;
  department: string;
  reimbursementPeriod: string;
}

// AI API配置
export interface APIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

// API请求和响应类型
export interface RecognizeRequest {
  file: Express.Multer.File;
  apiConfig: APIConfig;
}

export interface RecognizeResponse {
  document: DocumentData;
}

export interface PairRequest {
  documents: DocumentData[];
}

export interface PairResponse {
  result: PairingResult;
}

export interface SortRequest {
  documents: DocumentData[];
  pairs: PairingResult;
}

export interface SortResponse {
  result: SortingResult;
}

export interface DetectAnomaliesRequest {
  documents: DocumentData[];
}

export interface DetectAnomaliesResponse {
  warnings: Warning[];
}

export interface BatchProcessRequest {
  files: Express.Multer.File[];
  apiConfig: APIConfig;
  projectInfo?: ProjectInfo;
}

export interface BatchProcessResponse {
  documents: DocumentData[];
  pairs: PairingResult;
  sorting: SortingResult;
  warnings: Warning[];
}

export interface GeneratePDFRequest {
  documents: DocumentData[];
  projectInfo: ProjectInfo;
  sorting: SortingResult;
}

export interface GeneratePackageRequest {
  documents: DocumentData[];
  sorting: SortingResult;
  projectInfo: ProjectInfo;
}

export interface TestConnectionRequest {
  apiConfig: APIConfig;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

// 错误类型
export enum FileErrorType {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  PROCESSING_FAILED = 'PROCESSING_FAILED'
}

export enum AIErrorType {
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  TIMEOUT = 'TIMEOUT'
}

export class FileError extends Error {
  constructor(
    public type: FileErrorType,
    public fileName: string,
    message: string
  ) {
    super(message);
    this.name = 'FileError';
  }
}

export class AIError extends Error {
  constructor(
    public type: AIErrorType,
    public retryable: boolean,
    message: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
