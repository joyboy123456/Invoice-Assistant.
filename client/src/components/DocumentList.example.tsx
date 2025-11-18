import { useState } from 'react';
import DocumentList from './DocumentList';
import type { DocumentData, PairingResult, Warning } from '../types';

/**
 * Example usage of DocumentList component
 * 
 * This demonstrates how to integrate the document display components
 * with drag-and-drop, editing, and pairing functionality.
 */
export default function DocumentListExample() {
  // Sample data
  const [documents, setDocuments] = useState<DocumentData[]>([
    {
      id: 'doc-1',
      fileName: 'taxi_invoice_001.jpg',
      fileType: 'image',
      documentType: 'invoice',
      invoiceType: 'taxi',
      date: '11/03',
      amount: 219.67,
      description: '嘉兴电子商务产业园 → 菜鸟智谷产业园',
      confidence: 98,
      invoiceNumber: 'INV-2024-001',
      vendor: '如祺出行',
      status: 'completed',
    },
    {
      id: 'doc-2',
      fileName: 'trip_sheet_001.jpg',
      fileType: 'image',
      documentType: 'trip_sheet',
      date: '11/03',
      amount: 219.67,
      description: '打车行程单',
      confidence: 95,
      tripDetails: {
        platform: '如祺出行',
        departure: '嘉兴电子商务产业园',
        destination: '菜鸟智谷产业园',
        time: '14:30',
        distanceKm: 25.5,
      },
      status: 'completed',
    },
    {
      id: 'doc-3',
      fileName: 'hotel_invoice_001.jpg',
      fileType: 'image',
      documentType: 'invoice',
      invoiceType: 'hotel',
      date: '11/04',
      amount: 588.00,
      description: '酒店住宿费',
      confidence: 92,
      invoiceNumber: 'INV-2024-002',
      vendor: '如家酒店',
      status: 'completed',
    },
  ]);

  const [pairs, setPairs] = useState<PairingResult>({
    pairs: [
      {
        invoiceId: 'doc-1',
        tripSheetId: 'doc-2',
        confidence: 98,
        matchReason: '金额完全匹配(219.67)，日期相同(11/3)，平台一致(如祺出行)',
      },
    ],
    unmatchedInvoices: ['doc-3'],
    unmatchedTripSheets: [],
  });

  const [warnings] = useState<Warning[]>([
    {
      type: 'amount_anomaly',
      message: '酒店费用异常高',
      documentIds: ['doc-3'],
      severity: 'medium',
    },
  ]);

  const handleUpdateDocument = (updatedDoc: DocumentData) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
    );
    console.log('Document updated:', updatedDoc);
  };

  const handleReorderDocuments = (reorderedDocs: DocumentData[]) => {
    setDocuments(reorderedDocs);
    console.log('Documents reordered:', reorderedDocs.map((d) => d.id));
  };

  const handlePairDocuments = (doc1Id: string, doc2Id: string) => {
    // Find the documents
    const doc1 = documents.find((d) => d.id === doc1Id);
    const doc2 = documents.find((d) => d.id === doc2Id);

    if (!doc1 || !doc2) return;

    // Determine which is invoice and which is trip sheet
    let invoiceId = doc1.documentType === 'invoice' ? doc1Id : doc2Id;
    let tripSheetId = doc1.documentType === 'trip_sheet' ? doc1Id : doc2Id;

    // If both are same type, just pair them anyway
    if (doc1.documentType === doc2.documentType) {
      invoiceId = doc1Id;
      tripSheetId = doc2Id;
    }

    // Add new pair
    setPairs((prev) => ({
      ...prev,
      pairs: [
        ...prev.pairs,
        {
          invoiceId,
          tripSheetId,
          confidence: 100,
          matchReason: '手动配对',
        },
      ],
      unmatchedInvoices: prev.unmatchedInvoices.filter(
        (id) => id !== invoiceId && id !== tripSheetId
      ),
      unmatchedTripSheets: prev.unmatchedTripSheets.filter(
        (id) => id !== invoiceId && id !== tripSheetId
      ),
    }));

    console.log('Documents paired:', doc1Id, doc2Id);
  };

  const handleUnpairDocuments = (documentId: string) => {
    setPairs((prev) => {
      const pairToRemove = prev.pairs.find(
        (p) => p.invoiceId === documentId || p.tripSheetId === documentId
      );

      if (!pairToRemove) return prev;

      return {
        pairs: prev.pairs.filter((p) => p !== pairToRemove),
        unmatchedInvoices: [...prev.unmatchedInvoices, pairToRemove.invoiceId],
        unmatchedTripSheets: [...prev.unmatchedTripSheets, pairToRemove.tripSheetId],
      };
    });

    console.log('Document unpaired:', documentId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            文档列表示例
          </h1>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">功能说明：</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 拖拽文档卡片可以重新排序</li>
              <li>• 点击"编辑"按钮可以修改文档信息</li>
              <li>• 点击"配对"按钮选择第一个文档，再点击另一个文档完成配对</li>
              <li>• 点击"取消配对"按钮可以解除配对关系</li>
              <li>• 已配对的文档会显示蓝色边框和配对标识</li>
              <li>• 有警告的文档会显示红色边框和警告图标</li>
            </ul>
          </div>

          <DocumentList
            documents={documents}
            pairs={pairs}
            warnings={warnings}
            onUpdateDocument={handleUpdateDocument}
            onReorderDocuments={handleReorderDocuments}
            onPairDocuments={handlePairDocuments}
            onUnpairDocuments={handleUnpairDocuments}
          />
        </div>
      </div>
    </div>
  );
}
