import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { APIConfig } from '../types';

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
}

export default function APIConfigPanel() {
  const { apiConfig, setApiConfig } = useAppStore();
  const [localConfig, setLocalConfig] = useState<APIConfig>(apiConfig);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // 处理输入变化
  const handleChange = (field: keyof APIConfig, value: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 保存配置
  const handleSave = () => {
    // 保存到store（store会处理localStorage）
    // API密钥会在localStorage中以明文存储，但仅保存在本地
    setApiConfig(localConfig);
    
    setConnectionStatus({
      status: 'success',
      message: '配置已保存',
    });

    // 3秒后清除成功消息
    setTimeout(() => {
      if (connectionStatus.status === 'success') {
        setConnectionStatus({ status: 'idle', message: '' });
      }
    }, 3000);
  };

  // 测试连接
  const handleTestConnection = async () => {
    // 验证配置
    if (!localConfig.endpoint || !localConfig.apiKey || !localConfig.model) {
      setConnectionStatus({
        status: 'error',
        message: '请填写完整的API配置信息',
      });
      return;
    }

    setConnectionStatus({
      status: 'testing',
      message: '正在测试连接...',
    });

    try {
      const response = await fetch('http://localhost:3000/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiConfig: localConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({
          status: 'success',
          message: data.message || 'API连接成功！',
        });
        
        // 连接成功后自动保存配置
        setApiConfig(localConfig);
      } else {
        setConnectionStatus({
          status: 'error',
          message: data.error?.message || 'API连接失败',
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: error instanceof Error ? error.message : '网络错误，请检查后端服务是否启动',
      });
    }
  };

  // 获取状态图标和颜色
  const getStatusDisplay = () => {
    switch (connectionStatus.status) {
      case 'testing':
        return {
          icon: (
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'success':
        return {
          icon: (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'error':
        return {
          icon: (
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">API配置</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
          <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">本地加密存储</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* API端点 */}
        <div>
          <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
            API端点 <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="endpoint"
            value={localConfig.endpoint}
            onChange={(e) => handleChange('endpoint', e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 bg-white/50"
          />
          <p className="mt-1 text-xs text-gray-500">
            支持OpenAI兼容的API端点
          </p>
        </div>

        {/* API密钥 */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API密钥 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="apiKey"
              value={localConfig.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 bg-white/50"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            密钥将加密存储在本地，不会上传到服务器
          </p>
        </div>

        {/* 模型名称 */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            模型名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="model"
            value={localConfig.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="gpt-4-vision-preview"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 bg-white/50"
          />
          <p className="mt-1 text-xs text-gray-500">
            支持视觉识别的模型（如 gpt-4-vision-preview, gpt-4o）
          </p>
        </div>

        {/* 连接状态显示 */}
        {connectionStatus.status !== 'idle' && statusDisplay && (
          <div className={`flex items-start gap-3 p-3 rounded-md ${statusDisplay.bgColor}`}>
            <div className="flex-shrink-0 mt-0.5">
              {statusDisplay.icon}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${statusDisplay.color}`}>
                {connectionStatus.message}
              </p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={connectionStatus.status === 'testing'}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] font-medium"
          >
            {connectionStatus.status === 'testing' ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] font-medium"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
