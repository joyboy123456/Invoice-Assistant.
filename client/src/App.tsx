import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import Header from './components/Header';
import ProjectInfoPanel from './components/ProjectInfoPanel';
import UploadZone from './components/UploadZone';
import APIConfigPanel from './components/APIConfigPanel';
import ProgressBar from './components/ProgressBar';
import DocumentList from './components/DocumentList';
import WarningList from './components/WarningList';
import { ExportPanel } from './components/ExportPanel';
import { Toast } from './components/Toast';
import type { ToastType } from './components/Toast';
import { LoadingOverlay } from './components/Spinner';
import { ConfirmDialog } from './components/ConfirmDialog';
import { batchProcess, APIError } from './services/api';
import type { ProcessingProgress, DocumentData } from './types';

function App() {
  const {
    documents,
    pairs,
    warnings,
    apiConfig,
    addDocuments,
    updateDocument,
    setPairs,
    setWarnings,
    removeWarning,
    clearDocuments,
  } = useAppStore();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    total: 0,
    completed: 0,
    current: '',
    stage: 'completed',
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // 显示提示消息
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  // 处理文件上传
  const handleFilesAdded = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    showToast(`已添加 ${files.length} 个文件`, 'success');
  };

  // 开始批量处理
  const handleStartProcessing = async () => {
    if (uploadedFiles.length === 0) {
      showToast('请先上传文件', 'error');
      return;
    }

    if (!apiConfig.endpoint || !apiConfig.apiKey || !apiConfig.model) {
      showToast('请先配置API信息', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress({
      total: uploadedFiles.length,
      completed: 0,
      current: uploadedFiles[0]?.name || '',
      stage: 'recognizing',
    });

    try {
      const result = await batchProcess(uploadedFiles, apiConfig);

      // 更新store
      addDocuments(result.documents);
      setPairs(result.pairs);
      setWarnings(result.warnings);

      setProgress({
        total: uploadedFiles.length,
        completed: uploadedFiles.length,
        current: '',
        stage: 'completed',
      });

      showToast('文档处理完成！', 'success');
    } catch (error) {
      console.error('批量处理失败:', error);
      const message = error instanceof APIError ? error.message : '处理失败，请重试';
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 清空所有数据
  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: '清空所有数据',
      message: '确定要清空所有数据吗？此操作不可恢复。',
      onConfirm: () => {
        clearDocuments();
        setUploadedFiles([]);
        setProgress({
          total: 0,
          completed: 0,
          current: '',
          stage: 'completed',
        });
        showToast('已清空所有数据', 'info');
        setConfirmDialog(null);
      },
    });
  };

  // 更新文档
  const handleUpdateDocument = (doc: DocumentData) => {
    updateDocument(doc.id, doc);
    showToast('文档已更新', 'success');
  };

  // 重新排序文档
  const handleReorderDocuments = (reorderedDocs: DocumentData[]) => {
    // 这里简化处理，实际应该更新store中的文档顺序
    reorderedDocs.forEach((doc) => {
      updateDocument(doc.id, { ...doc });
    });
  };

  // 配对文档
  const handlePairDocuments = (doc1Id: string, doc2Id: string) => {
    // 简化实现：添加新的配对关系
    if (pairs) {
      const newPair = {
        invoiceId: doc1Id,
        tripSheetId: doc2Id,
        confidence: 100,
        matchReason: '手动配对',
      };
      setPairs({
        ...pairs,
        pairs: [...pairs.pairs, newPair],
      });
      showToast('配对成功', 'success');
    }
  };

  // 取消配对
  const handleUnpairDocuments = (documentId: string) => {
    if (pairs) {
      const newPairs = pairs.pairs.filter(
        (p) => p.invoiceId !== documentId && p.tripSheetId !== documentId
      );
      setPairs({
        ...pairs,
        pairs: newPairs,
      });
      showToast('已取消配对', 'info');
    }
  };

  const failedDocuments = documents.filter((doc) => doc.status === 'error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <Header documentCount={documents.length} onClearAll={handleClearAll} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="确认"
          cancelText="取消"
          confirmVariant="danger"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <LoadingOverlay message="正在处理文档，请稍候..." transparent />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Upload & Config */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 animate-fade-in">
            {/* Project Info */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <ProjectInfoPanel />
            </div>

            {/* API Config */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <APIConfigPanel />
            </div>

            {/* Upload Zone */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">上传文件</h2>
              <UploadZone onFilesAdded={handleFilesAdded} />
              
              {uploadedFiles.length > 0 && !isProcessing && documents.length === 0 && (
                <button
                  onClick={handleStartProcessing}
                  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  开始处理 ({uploadedFiles.length} 个文件)
                </button>
              )}
            </div>

            {/* Export Panel */}
            {documents.length > 0 && (
              <ExportPanel
                files={uploadedFiles}
                onExportStart={() => showToast('正在生成文件...', 'info')}
                onExportComplete={() => showToast('文件已下载', 'success')}
                onExportError={(error) => showToast(error, 'error')}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Progress */}
            {isProcessing && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 sm:p-6 border border-gray-100 animate-scale-in">
                <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">处理进度</h2>
                <ProgressBar progress={progress} failedDocuments={failedDocuments} />
              </div>
            )}

            {/* Document List */}
            {documents.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 animate-scale-in">
                <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">文档列表</h2>
                <DocumentList
                  documents={documents}
                  pairs={pairs || { pairs: [], unmatchedInvoices: [], unmatchedTripSheets: [] }}
                  warnings={warnings}
                  onUpdateDocument={handleUpdateDocument}
                  onReorderDocuments={handleReorderDocuments}
                  onPairDocuments={handlePairDocuments}
                  onUnpairDocuments={handleUnpairDocuments}
                />
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 sm:p-6 border border-gray-100 animate-scale-in">
                <WarningList
                  warnings={warnings}
                  documents={documents}
                  onDismiss={(index) => {
                    removeWarning(index);
                    showToast('已忽略警告', 'info');
                  }}
                  onViewDocument={(documentId) => {
                    // Scroll to the document in the list
                    const element = document.getElementById(`document-${documentId}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Briefly highlight the document
                      element.classList.add('ring-4', 'ring-yellow-400');
                      setTimeout(() => {
                        element.classList.remove('ring-4', 'ring-yellow-400');
                      }, 2000);
                    }
                  }}
                />
              </div>
            )}

            {/* Empty State */}
            {documents.length === 0 && !isProcessing && (
              <div className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm rounded-2xl shadow-soft p-6 sm:p-12 text-center border border-gray-100 animate-fade-in">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
                  <svg
                    className="relative mx-auto h-20 w-20 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">开始使用</h3>
                <p className="mt-3 text-base text-gray-600 max-w-md mx-auto">
                  上传发票和行程单文件，系统将自动识别、配对和整理
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { step: '1', text: '填写项目信息和API配置', icon: '⚙️' },
                    { step: '2', text: '上传PDF或图片文件', icon: '📄' },
                    { step: '3', text: '点击"开始处理"进行AI识别', icon: '🤖' },
                    { step: '4', text: '查看结果并导出文档', icon: '📦' },
                  ].map((item) => (
                    <div key={item.step} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {item.step}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-700">{item.text}</p>
                        </div>
                        <span className="text-xl">{item.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
