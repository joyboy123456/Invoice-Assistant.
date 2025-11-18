import React from 'react';
import type { ProcessingProgress, DocumentData } from '../types';

interface ProgressBarProps {
  progress: ProcessingProgress;
  failedDocuments?: DocumentData[];
  onRetry?: (documentId: string) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  failedDocuments = [],
  onRetry 
}) => {
  const percentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  const getStageText = (stage: ProcessingProgress['stage']): string => {
    const stageMap: Record<ProcessingProgress['stage'], string> = {
      uploading: '上传中',
      recognizing: '识别中',
      pairing: '配对中',
      sorting: '排序中',
      detecting: '检测异常中',
      completed: '已完成'
    };
    return stageMap[stage];
  };

  const getStageColor = (stage: ProcessingProgress['stage']): string => {
    if (stage === 'completed') return 'bg-green-500';
    if (failedDocuments.length > 0) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="w-full space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {getStageText(progress.stage)}
        </span>
        <span className="text-gray-600">
          {progress.completed} / {progress.total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${getStageColor(progress.stage)}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>

      {/* Current Processing Item */}
      {progress.current && progress.stage !== 'completed' && (
        <div className="text-xs text-gray-500 truncate">
          正在处理: {progress.current}
        </div>
      )}

      {/* Failed Documents List */}
      {failedDocuments.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-red-800">
              处理失败 ({failedDocuments.length})
            </h4>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {failedDocuments.map((doc) => (
              <li 
                key={doc.id} 
                className="flex items-start justify-between text-xs bg-white p-2 rounded border border-red-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {doc.fileName}
                  </p>
                  {doc.errorMessage && (
                    <p className="text-red-600 mt-1">
                      {doc.errorMessage}
                    </p>
                  )}
                </div>
                {onRetry && (
                  <button
                    onClick={() => onRetry(doc.id)}
                    className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    重试
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion Message */}
      {progress.stage === 'completed' && failedDocuments.length === 0 && (
        <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <svg 
            className="w-5 h-5 text-green-600 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <span className="text-sm font-medium text-green-800">
            所有文档处理完成
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
