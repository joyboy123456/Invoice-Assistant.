import { useAppStore } from '../store/useAppStore';

export default function ProjectInfoPanel() {
  const { projectInfo, setProjectInfo } = useAppStore();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100">
      <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">项目信息</h2>
      <div className="space-y-3">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1.5">
            项目名称
          </label>
          <input
            type="text"
            id="projectName"
            value={projectInfo.projectName}
            onChange={(e) => setProjectInfo({ projectName: e.target.value })}
            placeholder="例：2024年Q1差旅报销"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 bg-white/50"
          />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1.5">
            部门
          </label>
          <input
            type="text"
            id="department"
            value={projectInfo.department}
            onChange={(e) => setProjectInfo({ department: e.target.value })}
            placeholder="例：技术部"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 bg-white/50"
          />
        </div>
        <div>
          <label htmlFor="reimbursementPeriod" className="block text-sm font-medium text-gray-700 mb-1.5">
            报销期间
          </label>
          <input
            type="text"
            id="reimbursementPeriod"
            value={projectInfo.reimbursementPeriod}
            onChange={(e) => setProjectInfo({ reimbursementPeriod: e.target.value })}
            placeholder="例：2024-01 至 2024-03"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 bg-white/50"
          />
        </div>
      </div>
    </div>
  );
}
