import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DocumentCard from './DocumentCard';
import EditModal from './EditModal';
import type { DocumentData, PairingResult, Warning } from '../types';

interface DocumentListProps {
  documents: DocumentData[];
  pairs: PairingResult;
  warnings: Warning[];
  onUpdateDocument: (document: DocumentData) => void;
  onReorderDocuments: (documents: DocumentData[]) => void;
  onPairDocuments: (doc1Id: string, doc2Id: string) => void;
  onUnpairDocuments: (documentId: string) => void;
}

export default function DocumentList({
  documents,
  pairs,
  warnings,
  onUpdateDocument,
  onReorderDocuments,
  onPairDocuments,
  onUnpairDocuments,
}: DocumentListProps) {
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [selectedForPairing, setSelectedForPairing] = useState<string | null>(null);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newDocuments = [...documents];
      const draggedItem = newDocuments[dragIndex];
      newDocuments.splice(dragIndex, 1);
      newDocuments.splice(hoverIndex, 0, draggedItem);
      onReorderDocuments(newDocuments);
    },
    [documents, onReorderDocuments]
  );

  const handleEdit = (document: DocumentData) => {
    setEditingDocument(document);
  };

  const handleSave = (document: DocumentData) => {
    onUpdateDocument(document);
    setEditingDocument(null);
  };

  const handlePair = (documentId: string) => {
    if (selectedForPairing) {
      // Complete the pairing
      onPairDocuments(selectedForPairing, documentId);
      setSelectedForPairing(null);
    } else {
      // Select first document for pairing
      setSelectedForPairing(documentId);
    }
  };

  const handleUnpair = (documentId: string) => {
    onUnpairDocuments(documentId);
  };

  const getPairId = (documentId: string): string | undefined => {
    const pair = pairs.pairs.find(
      (p) => p.invoiceId === documentId || p.tripSheetId === documentId
    );
    if (pair) {
      return pair.invoiceId === documentId ? pair.tripSheetId : pair.invoiceId;
    }
    return undefined;
  };

  const isPaired = (documentId: string): boolean => {
    return pairs.pairs.some(
      (p) => p.invoiceId === documentId || p.tripSheetId === documentId
    );
  };

  const hasWarning = (documentId: string): boolean => {
    return warnings.some((w) => w.documentIds.includes(documentId));
  };

  const renderPairingConnections = () => {
    return pairs.pairs.map((pair, index) => {
      const invoiceIndex = documents.findIndex((d) => d.id === pair.invoiceId);
      const tripSheetIndex = documents.findIndex((d) => d.id === pair.tripSheetId);

      if (invoiceIndex === -1 || tripSheetIndex === -1) return null;

      // Visual connection line between paired documents
      const isAdjacent = Math.abs(invoiceIndex - tripSheetIndex) === 1;
      
      return (
        <div
          key={`pair-${index}`}
          className={`absolute left-0 w-1 bg-blue-400 ${isAdjacent ? 'opacity-50' : 'opacity-30'}`}
          style={{
            top: `${Math.min(invoiceIndex, tripSheetIndex) * 100}px`,
            height: `${Math.abs(invoiceIndex - tripSheetIndex) * 100}px`,
          }}
        />
      );
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2">暂无文档</p>
        <p className="text-sm">上传文件后将在此显示</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Pairing Mode Indicator */}
        {selectedForPairing && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800">
                配对模式：已选择文档，请点击另一个文档完成配对
              </span>
            </div>
            <button
              onClick={() => setSelectedForPairing(null)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              取消
            </button>
          </div>
        )}

        {/* Document Cards */}
        <div className="relative">
          {renderPairingConnections()}
          <div className="space-y-3">
            {documents.map((document, index) => (
              <div
                key={document.id}
                className={`relative ${
                  selectedForPairing === document.id ? 'ring-2 ring-blue-500 rounded-lg' : ''
                }`}
              >
                <DocumentCard
                  document={document}
                  index={index}
                  isPaired={isPaired(document.id)}
                  pairId={getPairId(document.id)}
                  onEdit={handleEdit}
                  onPair={handlePair}
                  onUnpair={handleUnpair}
                  onMove={moveCard}
                  hasWarning={hasWarning(document.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
              <div className="text-sm text-gray-600">总文档数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{pairs.pairs.length}</div>
              <div className="text-sm text-gray-600">已配对</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {warnings.filter((w) => w.severity === 'high' || w.severity === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">警告</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editingDocument !== null}
        document={editingDocument}
        onClose={() => setEditingDocument(null)}
        onSave={handleSave}
      />
    </DndProvider>
  );
}
