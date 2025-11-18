import { useState } from 'react';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

/**
 * Toast Component Example
 * 
 * 展示如何使用Toast通知组件
 */
export default function ToastExample() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Toast 通知组件示例</h2>

      <div className="space-y-3">
        <button
          onClick={() => showToast('操作成功！', 'success')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          显示成功消息
        </button>

        <button
          onClick={() => showToast('发生错误，请重试', 'error')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          显示错误消息
        </button>

        <button
          onClick={() => showToast('这是一条提示信息', 'info')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          显示信息消息
        </button>

        <button
          onClick={() => showToast('请注意这个警告', 'warning')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          显示警告消息
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
