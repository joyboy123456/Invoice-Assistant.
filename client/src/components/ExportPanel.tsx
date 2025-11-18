import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generatePDF, generatePackage, downloadBlob, APIError } from '../services/api';
import { Spinner } from './Spinner';

interface ExportPanelProps {
  files: File[]; // Original uploaded files
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: string) => void;
}

export function ExportPanel({
  files,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportPanelProps) {
  const { documents, projectInfo, pairs } = useAppStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);

  // 构建排序结果
  const getSortingResult = () => {
    if (!pairs) {
      return {
        suggestedOrder: documents.map(doc => doc.id),
        grouping: {},
      };
    }

    // 使用store中的sortedDocuments来获取排序后的文档
    const sortedDocs = useAppStore.getState().sortedDocuments();
    const suggestedOrder = sortedDocs.map(doc => doc.id);

    // 按发票类型分组
    const grouping: Record<string, string[]> = {};
    documents.forEach(doc => {
      if (doc.documentType === 'invoice' && doc.invoiceType) {
        if (!grouping[doc.invoiceType]) {
          grouping[doc.invoiceType] = [];
        }
        grouping[doc.invoiceType].push(doc.id);
      }
    });

    return { suggestedOrder, grouping };
  };

  // 验证是否可以导出
  const canExport = () => {
    if (documents.length === 0) {
      return { valid: false, message: '没有可导出的文档' };
    }

    if (!projectInfo.projectName || !projectInfo.department || !projectInfo.reimbursementPeriod) {
      return { valid: false, message: '请先填写项目信息' };
    }

    return { valid: true, message: '' };
  };

  // 下载PDF汇总表
  const handleDownloadPDF = async () => {
    const validation = canExport();
    if (!validation.valid) {
      onExportError?.(validation.message);
      return;
    }

    setIsGeneratingPDF(true);
    onExportStart?.();

    try {
      const sorting = getSortingResult();
      const blob = await generatePDF(documents, projectInfo, sorting);
      
      const filename = `${projectInfo.projectName}_费用汇总_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadBlob(blob, filename);
      
      onExportComplete?.();
    } catch (error) {
      console.error('生成PDF失败:', error);
      const message = error instanceof APIError 
        ? error.message 
        : '生成PDF失败，请重试';
      onExportError?.(message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 下载完整文件包
  const handleDownloadPackage = async () => {
    const validation = canExport();
    if (!validation.valid) {
      onExportError?.(validation.message);
      return;
    }

    if (files.length === 0) {
      onExportError?.('没有可打包的原始文件');
      return;
    }

    setIsGeneratingPackage(true);
    onExportStart?.();

    try {
      const sorting = getSortingResult();
      const blob = await generatePackage(files, documents, projectInfo, sorting);
      
      const filename = `${projectInfo.projectName}_完整报销包_${new Date().toISOString().split('T')[0]}.zip`;
      downloadBlob(blob, filename);
      
      onExportComplete?.();
    } catch (error) {
      console.error('生成文件包失败:', error);
      const message = error instanceof APIError 
        ? error.message 
        : '生成文件包失败，请重试';
      onExportError?.(message);
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  const validation = canExport();
  const isDisabled = !validation.valid;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">导出文档</h2>
      
      {/* 状态提示 */}
      {isDisabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ {validation.message}
          </p>
        </div>
      )}

      {/* 文档统计 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">文档总数：</span>
            <span className="font-semibold text-gray-900">{documents.length}</span>
          </div>
          <div>
            <span className="text-gray-600">配对数量：</span>
            <span className="font-semibold text-gray-900">
              {pairs?.pairs.length || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600">发票数量：</span>
            <span className="font-semibold text-gray-900">
              {documents.filter(d => d.documentType === 'invoice').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">行程单数量：</span>
            <span className="font-semibold text-gray-900">
              {documents.filter(d => d.documentType === 'trip_sheet').length}
            </span>
          </div>
        </div>
      </div>

      {/* 导出按钮 */}
      <div className="space-y-3">
        {/* 下载PDF汇总 */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDisabled || isGeneratingPDF}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-all duration-200
            flex items-center justify-center gap-2
            ${
              isDisabled || isGeneratingPDF
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {isGeneratingPDF ? (
            <>
              <Spinner size="sm" className="border-white border-t-white/50" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span>下载PDF汇总表</span>
            </>
          )}
        </button>

        {/* 下载完整包 */}
        <button
          onClick={handleDownloadPackage}
          disabled={isDisabled || isGeneratingPackage}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-all duration-200
            flex items-center justify-center gap-2
            ${
              isDisabled || isGeneratingPackage
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            }
          `}
        >
          {isGeneratingPackage ? (
            <>
              <Spinner size="sm" className="border-white border-t-white/50" />
              <span>打包中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>下载完整报销包（ZIP）</span>
            </>
          )}
        </button>
      </div>

      {/* 说明文字 */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• PDF汇总表：包含所有费用明细和分类汇总</p>
        <p>• 完整报销包：包含PDF汇总表和所有原始文件（按顺序重命名）</p>
      </div>
    </div>
  );
}
