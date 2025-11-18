import { ExportPanel } from './ExportPanel';
import { useAppStore } from '../store/useAppStore';

/**
 * ExportPanel 组件示例
 * 
 * 展示如何使用导出面板组件
 */
export function ExportPanelExample() {
  const { setProjectInfo, addDocuments } = useAppStore();

  // 模拟设置项目信息
  const setupMockData = () => {
    setProjectInfo({
      projectName: '2024年Q1差旅报销',
      department: '技术部',
      reimbursementPeriod: '2024-01 至 2024-03',
    });

    // 添加一些模拟文档
    addDocuments([
      {
        id: 'doc1',
        fileName: 'taxi_invoice.jpg',
        fileType: 'image',
        documentType: 'invoice',
        date: '2024-03-15',
        amount: 219.67,
        description: '打车费用',
        confidence: 95,
        invoiceType: 'taxi',
        invoiceNumber: 'INV-001',
        vendor: '如祺出行',
        status: 'completed',
      },
      {
        id: 'doc2',
        fileName: 'trip_sheet.jpg',
        fileType: 'image',
        documentType: 'trip_sheet',
        date: '2024-03-15',
        amount: 219.67,
        description: '行程单',
        confidence: 98,
        tripDetails: {
          platform: '如祺出行',
          departure: '嘉兴电子商务产业园',
          destination: '菜鸟智谷产业园',
          time: '14:30',
          distanceKm: 25.5,
        },
        status: 'completed',
      },
    ]);
  };

  // 模拟文件列表
  const mockFiles: File[] = [];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">ExportPanel 组件示例</h1>
          <button
            onClick={setupMockData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            加载模拟数据
          </button>
        </div>

        <ExportPanel
          files={mockFiles}
          onExportStart={() => console.log('开始导出...')}
          onExportComplete={() => console.log('导出完成！')}
          onExportError={(error) => console.error('导出失败:', error)}
        />

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">使用说明</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>点击"加载模拟数据"按钮填充项目信息和文档</li>
            <li>确保项目信息完整后，导出按钮才会启用</li>
            <li>"下载PDF汇总表"生成包含所有费用的PDF文档</li>
            <li>"下载完整报销包"生成包含PDF和所有原始文件的ZIP包</li>
            <li>文件会按照排序顺序重命名（01_、02_等）</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Props</h2>
          <div className="text-sm space-y-2">
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">files: File[]</code>
              <p className="text-gray-600 mt-1">原始上传的文件列表，用于生成ZIP包</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">onExportStart?: () =&gt; void</code>
              <p className="text-gray-600 mt-1">导出开始时的回调函数</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">onExportComplete?: () =&gt; void</code>
              <p className="text-gray-600 mt-1">导出成功完成时的回调函数</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded">onExportError?: (error: string) =&gt; void</code>
              <p className="text-gray-600 mt-1">导出失败时的回调函数，接收错误消息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportPanelExample;
