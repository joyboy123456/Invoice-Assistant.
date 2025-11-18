import APIConfigPanel from './APIConfigPanel';

/**
 * APIConfigPanel 组件使用示例
 * 
 * 这个组件提供了AI API配置界面，包括：
 * - API端点URL输入
 * - API密钥输入（带显示/隐藏切换）
 * - 模型名称输入
 * - 测试连接功能
 * - 配置保存到LocalStorage（加密存储）
 * - 连接状态显示
 */

export default function APIConfigPanelExample() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          API配置面板示例
        </h1>

        {/* 基本使用 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            基本使用
          </h2>
          <APIConfigPanel />
        </div>

        {/* 使用说明 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            使用说明
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">功能特性：</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>支持OpenAI兼容的API端点配置</li>
                <li>API密钥加密存储（Base64编码）</li>
                <li>密钥显示/隐藏切换功能</li>
                <li>实时测试API连接</li>
                <li>配置自动保存到LocalStorage</li>
                <li>连接状态可视化反馈</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">配置示例：</h3>
              <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                <div>API端点: https://api.openai.com/v1</div>
                <div>API密钥: sk-proj-xxxxxxxxxxxxx</div>
                <div>模型名称: gpt-4-vision-preview</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">使用流程：</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>填写API端点URL</li>
                <li>输入API密钥</li>
                <li>选择或输入模型名称</li>
                <li>点击"测试连接"验证配置</li>
                <li>连接成功后自动保存配置</li>
                <li>也可以手动点击"保存配置"</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">状态说明：</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="text-blue-600">蓝色旋转图标</span>：正在测试连接</li>
                <li><span className="text-green-600">绿色对勾</span>：连接成功</li>
                <li><span className="text-red-600">红色叉号</span>：连接失败</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">安全性：</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>API密钥使用Base64编码存储在LocalStorage</li>
                <li>所有数据仅保存在本地浏览器</li>
                <li>不会上传到任何外部服务器</li>
                <li>支持密码显示/隐藏切换</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">集成到应用：</h3>
              <div className="bg-gray-50 rounded p-3">
                <pre className="text-xs overflow-x-auto">
{`import APIConfigPanel from './components/APIConfigPanel';

function App() {
  return (
    <div>
      <APIConfigPanel />
    </div>
  );
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">访问配置：</h3>
              <div className="bg-gray-50 rounded p-3">
                <pre className="text-xs overflow-x-auto">
{`import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const { apiConfig } = useAppStore();
  
  // 使用配置
  console.log(apiConfig.endpoint);
  console.log(apiConfig.apiKey);
  console.log(apiConfig.model);
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
