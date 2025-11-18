import { Spinner, InlineLoading } from './Spinner';

/**
 * Spinner Component Example
 * 
 * 展示如何使用加载状态组件
 */
export default function SpinnerExample() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Spinner 加载组件示例</h2>

      {/* Spinner Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">不同尺寸的Spinner</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <Spinner size="sm" />
            <p className="text-sm text-gray-600 mt-2">Small</p>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <p className="text-sm text-gray-600 mt-2">Medium</p>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 mt-2">Large</p>
          </div>
        </div>
      </div>

      {/* Inline Loading */}
      <div>
        <h3 className="text-lg font-semibold mb-4">内联加载状态</h3>
        <div className="space-y-4">
          <InlineLoading message="加载中..." size="sm" />
          <InlineLoading message="正在处理文档..." size="md" />
          <InlineLoading message="正在生成报告..." size="lg" />
        </div>
      </div>

      {/* Loading in Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">按钮中的加载状态</h3>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            <Spinner size="sm" className="border-white border-t-white/50" />
            <span>处理中...</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
            <Spinner size="sm" className="border-white border-t-white/50" />
            <span>上传中...</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay Example (commented out to avoid blocking the page) */}
      <div>
        <h3 className="text-lg font-semibold mb-4">全屏加载遮罩</h3>
        <p className="text-sm text-gray-600 mb-2">
          取消注释下面的代码以查看全屏加载效果
        </p>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {`<LoadingOverlay message="正在处理..." transparent />`}
        </pre>
        {/* Uncomment to see the overlay:
        <LoadingOverlay message="正在处理..." transparent />
        */}
      </div>
    </div>
  );
}
