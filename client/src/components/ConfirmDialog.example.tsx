import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * ConfirmDialog Component Example
 * 
 * 展示如何使用确认对话框组件
 */
export default function ConfirmDialogExample() {
  const [showDangerDialog, setShowDangerDialog] = useState(false);
  const [showPrimaryDialog, setShowPrimaryDialog] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleDangerConfirm = () => {
    setResult('危险操作已确认');
    setShowDangerDialog(false);
  };

  const handlePrimaryConfirm = () => {
    setResult('主要操作已确认');
    setShowPrimaryDialog(false);
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-6">ConfirmDialog 确认对话框示例</h2>

      {/* Result Display */}
      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{result}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowDangerDialog(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          显示危险操作对话框
        </button>

        <button
          onClick={() => setShowPrimaryDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          显示主要操作对话框
        </button>
      </div>

      {/* Danger Dialog */}
      <ConfirmDialog
        isOpen={showDangerDialog}
        title="删除所有数据"
        message="确定要删除所有数据吗？此操作不可恢复。"
        confirmText="删除"
        cancelText="取消"
        confirmVariant="danger"
        onConfirm={handleDangerConfirm}
        onCancel={() => setShowDangerDialog(false)}
      />

      {/* Primary Dialog */}
      <ConfirmDialog
        isOpen={showPrimaryDialog}
        title="保存更改"
        message="确定要保存当前的更改吗？"
        confirmText="保存"
        cancelText="取消"
        confirmVariant="primary"
        onConfirm={handlePrimaryConfirm}
        onCancel={() => setShowPrimaryDialog(false)}
      />

      {/* Usage Example */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">使用示例：</h3>
        <pre className="text-sm overflow-x-auto">
{`const [showDialog, setShowDialog] = useState(false);

<ConfirmDialog
  isOpen={showDialog}
  title="确认操作"
  message="确定要执行此操作吗？"
  confirmText="确认"
  cancelText="取消"
  confirmVariant="danger" // or "primary"
  onConfirm={() => {
    // 执行操作
    setShowDialog(false);
  }}
  onCancel={() => setShowDialog(false)}
/>`}
        </pre>
      </div>
    </div>
  );
}
