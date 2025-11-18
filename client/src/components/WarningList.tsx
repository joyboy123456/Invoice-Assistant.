import { useState } from 'react';
import type { Warning, DocumentData } from '../types';

interface WarningListProps {
  warnings: Warning[];
  documents: DocumentData[];
  onDismiss: (index: number) => void;
  onViewDocument: (documentId: string) => void;
}

export default function WarningList({
  warnings,
  documents,
  onDismiss,
  onViewDocument,
}: WarningListProps) {
  const [expandedWarnings, setExpandedWarnings] = useState<Set<number>>(new Set());

  if (warnings.length === 0) {
    return null;
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedWarnings);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedWarnings(newExpanded);
  };

  const getWarningIcon = (type: Warning['type']) => {
    switch (type) {
      case 'duplicate':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'amount_anomaly':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'date_gap':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'missing_pair':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const getWarningTypeLabel = (type: Warning['type']) => {
    const labels: Record<Warning['type'], string> = {
      duplicate: '重复发票',
      amount_anomaly: '金额异常',
      date_gap: '日期间隔',
      missing_pair: '缺失配对',
    };
    return labels[type];
  };

  const getSeverityColor = (severity?: Warning['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const getDocumentName = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    return doc?.fileName || documentId;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          异常警告
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
            {warnings.length}
          </span>
        </h3>
      </div>

      <div className="space-y-2">
        {warnings.map((warning, index) => {
          const colors = getSeverityColor(warning.severity);
          const isExpanded = expandedWarnings.has(index);

          return (
            <div
              key={index}
              className={`${colors.bg} border ${colors.border} rounded-lg overflow-hidden transition-all`}
            >
              {/* Warning Header */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
                      {getWarningIcon(warning.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>
                          {getWarningTypeLabel(warning.type)}
                        </span>
                        {warning.severity && (
                          <span className={`text-xs font-medium ${colors.text}`}>
                            {warning.severity === 'high' && '高'}
                            {warning.severity === 'medium' && '中'}
                            {warning.severity === 'low' && '低'}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${colors.text} font-medium`}>
                        {warning.message}
                      </p>
                      {warning.documentIds.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          涉及 {warning.documentIds.length} 个文档
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 ml-2">
                    {warning.documentIds.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(index)}
                        className={`p-1.5 rounded hover:bg-white/50 transition-colors ${colors.text}`}
                        title={isExpanded ? '收起详情' : '查看详情'}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(index)}
                      className={`p-1.5 rounded hover:bg-white/50 transition-colors ${colors.text}`}
                      title="忽略此警告"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && warning.documentIds.length > 0 && (
                <div className="px-3 pb-3 pt-0 border-t border-gray-200/50">
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700 mb-2">相关文档:</p>
                    {warning.documentIds.map((docId) => {
                      const doc = documents.find((d) => d.id === docId);
                      return (
                        <div
                          key={docId}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className={doc?.documentType === 'invoice' ? 'text-blue-600' : 'text-green-600'}>
                              {doc?.documentType === 'invoice' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate" title={getDocumentName(docId)}>
                                {getDocumentName(docId)}
                              </p>
                              {doc && (
                                <p className="text-xs text-gray-500">
                                  {doc.date} · ¥{doc.amount.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => onViewDocument(docId)}
                            className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors whitespace-nowrap"
                          >
                            查看
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
