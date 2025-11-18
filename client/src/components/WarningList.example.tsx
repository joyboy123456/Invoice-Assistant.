import { useState } from 'react';
import WarningList from './WarningList';
import type { Warning, DocumentData } from '../types';

/**
 * Example usage of the WarningList component
 * 
 * This component displays warnings and anomalies detected in the document processing workflow.
 * It supports different warning types (duplicate, amount_anomaly, date_gap, missing_pair)
 * and severity levels (low, medium, high).
 */

export default function WarningListExample() {
  // Sample documents
  const sampleDocuments: DocumentData[] = [
    {
      id: 'doc-1',
      fileName: 'taxi_invoice_001.jpg',
      fileType: 'image',
      documentType: 'invoice',
      date: '2024-11-15',
      amount: 219.67,
      description: '出租车费用',
      confidence: 95,
      invoiceNumber: 'INV-2024-001',
      vendor: '如祺出行',
      invoiceType: 'taxi',
      status: 'completed',
    },
    {
      id: 'doc-2',
      fileName: 'taxi_invoice_002.jpg',
      fileType: 'image',
      documentType: 'invoice',
      date: '2024-11-15',
      amount: 219.67,
      description: '出租车费用',
      confidence: 93,
      invoiceNumber: 'INV-2024-001', // Duplicate invoice number
      vendor: '如祺出行',
      invoiceType: 'taxi',
      status: 'completed',
    },
    {
      id: 'doc-3',
      fileName: 'trip_sheet_001.jpg',
      fileType: 'image',
      documentType: 'trip_sheet',
      date: '2024-11-15',
      amount: 219.67,
      description: '行程单',
      confidence: 92,
      tripDetails: {
        platform: '如祺出行',
        departure: '嘉兴电子商务产业园',
        destination: '菜鸟智谷产业园',
        time: '14:30',
        distanceKm: 15.2,
      },
      status: 'completed',
    },
    {
      id: 'doc-4',
      fileName: 'hotel_invoice_001.jpg',
      fileType: 'image',
      documentType: 'invoice',
      date: '2024-11-20',
      amount: 5800.00,
      description: '酒店住宿',
      confidence: 88,
      invoiceNumber: 'HTL-2024-001',
      vendor: '希尔顿酒店',
      invoiceType: 'hotel',
      status: 'completed',
    },
    {
      id: 'doc-5',
      fileName: 'taxi_invoice_003.jpg',
      fileType: 'image',
      documentType: 'invoice',
      date: '2024-12-01',
      amount: 180.50,
      description: '出租车费用',
      confidence: 90,
      invoiceNumber: 'INV-2024-003',
      vendor: '滴滴出行',
      invoiceType: 'taxi',
      status: 'completed',
    },
  ];

  // Sample warnings
  const initialWarnings: Warning[] = [
    {
      type: 'duplicate',
      message: '检测到重复发票号: INV-2024-001',
      documentIds: ['doc-1', 'doc-2'],
      severity: 'high',
    },
    {
      type: 'amount_anomaly',
      message: '酒店金额偏高: ¥5800.00 (该类型中位数: ¥800.00)',
      documentIds: ['doc-4'],
      severity: 'medium',
    },
    {
      type: 'date_gap',
      message: '检测到日期间隔: 2024-11-20 到 2024-12-01 相隔11天',
      documentIds: ['doc-4', 'doc-5'],
      severity: 'low',
    },
    {
      type: 'missing_pair',
      message: '出租车发票缺少对应的行程单: taxi_invoice_003.jpg',
      documentIds: ['doc-5'],
      severity: 'medium',
    },
  ];

  const [warnings, setWarnings] = useState<Warning[]>(initialWarnings);

  const handleDismiss = (index: number) => {
    setWarnings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewDocument = (documentId: string) => {
    const doc = sampleDocuments.find((d) => d.id === documentId);
    if (doc) {
      alert(`查看文档: ${doc.fileName}\n类型: ${doc.documentType}\n金额: ¥${doc.amount.toFixed(2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            WarningList Component Example
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">功能说明:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 显示不同类型的警告（重复、金额异常、日期间隔、缺失配对）</li>
              <li>• 根据严重程度使用不同颜色（高/中/低）</li>
              <li>• 点击展开查看相关文档详情</li>
              <li>• 支持忽略警告功能</li>
              <li>• 点击"查看"按钮跳转到对应文档</li>
            </ul>
          </div>

          {warnings.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900">没有警告</p>
              <p className="text-sm text-gray-500 mt-1">所有文档都已正常处理</p>
            </div>
          ) : (
            <WarningList
              warnings={warnings}
              documents={sampleDocuments}
              onDismiss={handleDismiss}
              onViewDocument={handleViewDocument}
            />
          )}

          {warnings.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setWarnings(initialWarnings)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                重置警告
              </button>
            </div>
          )}
        </div>

        {/* Document List for Reference */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">文档列表（参考）</h2>
          <div className="space-y-2">
            {sampleDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{doc.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {doc.documentType === 'invoice' ? '发票' : '行程单'} · {doc.date} · ¥{doc.amount.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{doc.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
