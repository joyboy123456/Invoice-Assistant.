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

// API响应类型
export interface RecognizeResponse {
  document: DocumentData;
}

export interface PairResponse {
  result: PairingResult;
}

export interface SortResponse {
  result: SortingResult;
}

export interface DetectAnomaliesResponse {
  warnings: Warning[];
}

export interface BatchProcessResponse {
  documents: DocumentData[];
  pairs: PairingResult;
  sorting: SortingResult;
  warnings: Warning[];
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

// 上传文件状态
export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
}

// 处理进度
export interface ProcessingProgress {
  total: number;
  completed: number;
  current: string;
  stage: 'uploading' | 'recognizing' | 'pairing' | 'sorting' | 'detecting' | 'completed';
}
