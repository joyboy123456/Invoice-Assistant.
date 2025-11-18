import ProjectInfoPanel from './ProjectInfoPanel';
import { useAppStore } from '../store/useAppStore';

/**
 * ProjectInfoPanel Component Example
 * 
 * 项目信息输入面板组件
 * 包含项目名称、部门、报销期间三个输入框
 * 数据自动保存到LocalStorage
 */

// Example 1: 基本使用
export function ProjectInfoPanelBasic() {
  return <ProjectInfoPanel />;
}

// Example 2: 在应用中使用（带状态显示）
export function ProjectInfoPanelWithStatus() {
  const { projectInfo } = useAppStore();
  
  return (
    <div className="space-y-4">
      <ProjectInfoPanel />
      
      {/* 显示当前项目信息 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">当前项目信息：</h3>
        <pre className="text-xs text-gray-600">
          {JSON.stringify(projectInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Example 3: 完整的表单验证示例
export function ProjectInfoPanelWithValidation() {
  const { projectInfo } = useAppStore();
  
  const isValid = () => {
    return (
      projectInfo.projectName.trim() !== '' &&
      projectInfo.department.trim() !== '' &&
      projectInfo.reimbursementPeriod.trim() !== ''
    );
  };
  
  return (
    <div className="space-y-4">
      <ProjectInfoPanel />
      
      {/* 验证状态提示 */}
      {!isValid() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            请填写完整的项目信息以便生成报销文档
          </p>
        </div>
      )}
      
      {isValid() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ 项目信息已完整填写
          </p>
        </div>
      )}
    </div>
  );
}
