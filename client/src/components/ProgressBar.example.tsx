/**
 * ProgressBar Component Usage Example
 * 
 * This file demonstrates how to use the ProgressBar component
 * in your application.
 */

import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import type { ProcessingProgress, DocumentData } from '../types';

const ProgressBarExample: React.FC = () => {
  // Example 1: Basic progress tracking
  const [progress] = useState<ProcessingProgress>({
    total: 10,
    completed: 7,
    current: 'invoice_2024_03.pdf',
    stage: 'recognizing'
  });

  // Example 2: With failed documents
  const [failedDocs] = useState<DocumentData[]>([
    {
      id: 'doc-1',
      fileName: 'corrupted_invoice.pdf',
      fileType: 'pdf',
      documentType: 'invoice',
      date: '',
      amount: 0,
      description: '',
      confidence: 0,
      status: 'error',
      errorMessage: '文件损坏，无法读取'
    },
    {
      id: 'doc-2',
      fileName: 'invalid_format.jpg',
      fileType: 'image',
      documentType: 'invoice',
      date: '',
      amount: 0,
      description: '',
      confidence: 0,
      status: 'error',
      errorMessage: 'AI识别失败，请检查图片质量'
    }
  ]);

  const handleRetry = (documentId: string) => {
    console.log('Retrying document:', documentId);
    // Implement retry logic here
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">基础进度显示</h2>
        <ProgressBar progress={progress} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">包含失败文档</h2>
        <ProgressBar 
          progress={progress} 
          failedDocuments={failedDocs}
          onRetry={handleRetry}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">完成状态</h2>
        <ProgressBar 
          progress={{
            total: 10,
            completed: 10,
            current: '',
            stage: 'completed'
          }} 
        />
      </div>
    </div>
  );
};

export default ProgressBarExample;
