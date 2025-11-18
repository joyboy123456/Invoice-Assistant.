import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import type { DocumentData } from '../types';

interface DocumentCardProps {
  document: DocumentData;
  index: number;
  isPaired: boolean;
  pairId?: string;
  onEdit: (document: DocumentData) => void;
  onPair: (documentId: string) => void;
  onUnpair: (documentId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  hasWarning?: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ITEM_TYPE = 'DOCUMENT_CARD';

export default function DocumentCard({
  document,
  index,
  isPaired,
  pairId,
  onEdit,
  onPair,
  onUnpair,
  onMove,
  hasWarning = false,
}: DocumentCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { id: document.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getDocumentTypeIcon = () => {
    if (document.documentType === 'invoice') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    }
  };

  const getInvoiceTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      taxi: '出租车',
      hotel: '酒店',
      train: '火车',
      shipping: '快递',
      toll: '过路费',
      consumables: '消耗品',
      other: '其他',
    };
    return type ? labels[type] || type : '';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const opacity = isDragging ? 0.4 : 1;
  const borderColor = isPaired ? 'border-blue-400' : hasWarning ? 'border-red-400' : 'border-gray-200';
  const bgColor = isPaired ? 'bg-gradient-to-br from-blue-50 to-purple-50' : hasWarning ? 'bg-red-50' : 'bg-white';

  return (
    <div
      ref={ref}
      id={`document-${document.id}`}
      data-handler-id={handlerId}
      style={{ opacity }}
      className={`${bgColor} border-2 ${borderColor} rounded-xl p-4 shadow-soft hover:shadow-xl transition-all duration-300 cursor-move hover:scale-[1.01] ${isDragging ? 'rotate-2' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={document.documentType === 'invoice' ? 'text-blue-600' : 'text-green-600'}>
            {getDocumentTypeIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm truncate max-w-xs" title={document.fileName}>
              {document.fileName}
            </h3>
            <p className="text-xs text-gray-500">
              {document.documentType === 'invoice' ? '发票' : '行程单'}
              {document.invoiceType && ` - ${getInvoiceTypeLabel(document.invoiceType)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold ${getConfidenceColor(document.confidence)}`}>
            {document.confidence}%
          </span>
        </div>
      </div>

      {/* Pairing Indicator */}
      {isPaired && pairId && (
        <div className="mb-3 px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg text-xs text-blue-800 flex items-center shadow-sm animate-scale-in">
          <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="font-semibold">已配对</span>
          <span className="ml-1 opacity-75">(ID: {pairId.slice(0, 8)})</span>
        </div>
      )}

      {/* Document Details */}
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">日期:</span>
            <span className="ml-2 font-medium">{document.date}</span>
          </div>
          <div>
            <span className="text-gray-500">金额:</span>
            <span className="ml-2 font-medium text-green-600">¥{document.amount.toFixed(2)}</span>
          </div>
        </div>

        {document.description && (
          <div className="text-sm">
            <span className="text-gray-500">描述:</span>
            <span className="ml-2">{document.description}</span>
          </div>
        )}

        {document.invoiceNumber && (
          <div className="text-sm">
            <span className="text-gray-500">发票号:</span>
            <span className="ml-2 font-mono text-xs">{document.invoiceNumber}</span>
          </div>
        )}

        {document.vendor && (
          <div className="text-sm">
            <span className="text-gray-500">商家:</span>
            <span className="ml-2">{document.vendor}</span>
          </div>
        )}

        {document.tripDetails && (
          <div className="text-sm space-y-1 mt-2 p-2 bg-gray-50 rounded">
            <div>
              <span className="text-gray-500">平台:</span>
              <span className="ml-2">{document.tripDetails.platform}</span>
            </div>
            <div>
              <span className="text-gray-500">出发:</span>
              <span className="ml-2">{document.tripDetails.departure}</span>
            </div>
            <div>
              <span className="text-gray-500">到达:</span>
              <span className="ml-2">{document.tripDetails.destination}</span>
            </div>
            <div className="flex justify-between">
              <div>
                <span className="text-gray-500">时间:</span>
                <span className="ml-2">{document.tripDetails.time}</span>
              </div>
              <div>
                <span className="text-gray-500">距离:</span>
                <span className="ml-2">{document.tripDetails.distanceKm}km</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onEdit(document)}
          className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </button>
        {isPaired ? (
          <button
            onClick={() => onUnpair(document.id)}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 text-red-700 rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消配对
          </button>
        ) : (
          <button
            onClick={() => onPair(document.id)}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            配对
          </button>
        )}
      </div>

      {/* Warning Indicator */}
      {hasWarning && (
        <div className="mt-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          此文档存在异常
        </div>
      )}
    </div>
  );
}
