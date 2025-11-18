# Implementation Plan

- [x] 1. 项目初始化和基础架构搭建
  - 创建项目根目录结构，包含client和server子目录
  - 初始化前端React + TypeScript项目，配置Tailwind CSS和Zustand
  - 初始化后端Express + TypeScript项目，配置Multer和PDF处理库
  - 创建并发启动脚本和环境配置文件
  - _Requirements: 10.1, 10.2_

- [x] 1.1 前端项目初始化
  - 使用Vite创建React + TypeScript项目在client目录
  - 安装并配置Tailwind CSS、Headless UI组件库
  - 安装Zustand状态管理和React DnD拖拽库
  - 配置开发服务器端口为3001
  - _Requirements: 10.1_

- [x] 1.2 后端项目初始化
  - 创建server目录，初始化Node.js + TypeScript项目
  - 安装Express.js、Multer、pdf-poppler、sharp等依赖
  - 配置TypeScript编译选项和tsconfig.json
  - 设置CORS中间件允许前端访问
  - _Requirements: 10.2_

- [x] 1.3 开发环境配置
  - 在根目录创建package.json，配置并发启动脚本
  - 安装concurrently用于同时启动前后端
  - 配置nodemon实现后端热重载
  - 创建.env.example文件模板
  - _Requirements: 10.1, 10.2_

- [x] 2. 核心数据模型和类型定义
  - 在server/src/types目录创建共享类型定义
  - 实现DocumentData接口，包含发票和行程单字段
  - 定义PairingResult、Warning、ProjectInfo、APIConfig等接口
  - 创建API请求和响应的类型定义
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 7.1_

- [x] 3. 后端文件处理服务
  - 创建server/src/services/FileService.ts类
  - 配置Multer中间件使用内存存储模式
  - 实现PDF转图片功能，使用pdf-poppler
  - 实现图片压缩和Base64编码，使用sharp
  - 添加文件格式和大小验证（最大10MB）
  - 实现MemoryManager类，监控内存使用和自动清理（限制500MB）
  - _Requirements: 1.1, 9.2, 10.2_

- [x] 4. AI服务集成
  - 创建server/src/services/AIService.ts类
  - 实现recognizeDocument方法，调用OpenAI兼容Vision API
  - 编写发票和行程单识别Prompt，提取所有必需字段
  - 实现结构化JSON响应解析和置信度评分
  - 添加请求重试机制（最多3次，指数退避）
  - 实现API错误分类和处理
  - 添加testConnection方法验证API配置
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2_

- [x] 5. 智能配对算法
  - 创建server/src/services/PairingService.ts类
  - 实现pairDocuments方法，基于金额、日期、平台匹配
  - 计算配对置信度评分（金额匹配+50分，日期接近+30分，平台匹配+20分）
  - 生成匹配原因说明文本
  - 识别并返回未匹配的发票和行程单
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. 智能排序服务
  - 创建server/src/services/SortingService.ts类
  - 实现sortDocuments方法，按费用类型分组
  - 定义排序优先级：consumables > hotel > taxi > shipping > other
  - 在每个分组内按日期升序排序
  - 确保配对的发票和行程单相邻放置
  - 返回排序后的文档ID数组和分组信息
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. 异常检测服务
  - 创建server/src/services/AnomalyDetector.ts类
  - 实现detectDuplicates方法，检测重复发票
  - 实现detectAmountAnomalies方法，标记异常金额
  - 实现detectDateGaps方法，检测日期不连续
  - 实现detectMissingPairs方法，标记缺失配对
  - 返回Warning数组，包含类型、消息、相关文档ID
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. 批量处理工作流
  - 创建server/src/services/BatchProcessor.ts类
  - 实现processBatch方法，协调所有服务
  - 按顺序执行：文件处理 → AI识别 → 配对 → 排序 → 异常检测
  - 实现进度回调机制，支持实时更新
  - 处理部分失败情况，继续处理其他文档
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9. API路由和中间件
  - 创建server/src/routes/api.ts
  - 实现POST /api/upload - 文件上传
  - 实现POST /api/recognize - 单个文档识别
  - 实现POST /api/batch-process - 批量处理
  - 实现POST /api/test-connection - 测试AI API连接
  - 配置CORS中间件，允许前端访问
  - 添加请求体大小限制（50MB）
  - 实现全局错误处理中间件
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.5, 8.5_

- [x] 10. 前端状态管理
  - 创建client/src/store/useAppStore.ts
  - 定义状态：documents、pairs、warnings、projectInfo、apiConfig
  - 实现actions：addDocument、updateDocument、setPairs、setWarnings等
  - 添加computed values：sortedDocuments、documentsByType
  - 实现LocalStorage持久化API配置和项目信息
  - _Requirements: 5.1, 5.2, 7.3, 10.2, 10.5_

- [x] 11. 前端文件上传组件
  - 创建client/src/components/UploadZone.tsx组件
  - 实现拖拽上传功能
  - 添加文件类型验证（PDF、PNG、JPG、JPEG）
  - 实现FileList组件显示已上传文件和状态
  - 添加上传进度显示和错误提示
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 12. 前端API配置组件
  - 创建client/src/components/APIConfigPanel.tsx组件
  - 添加API端点、密钥、模型名称输入框
  - 实现配置保存到LocalStorage（加密存储）
  - 添加"测试连接"按钮，调用后端验证API
  - 显示连接状态和错误信息
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 13. 前端主界面和布局
  - 创建client/src/App.tsx主组件，设置响应式布局
  - 创建Header组件，显示应用标题和状态
  - 创建ProjectInfoPanel组件，输入项目名称、部门、报销期间
  - 集成UploadZone和APIConfigPanel组件
  - 添加"开始处理"按钮，触发批量识别
  - _Requirements: 10.1, 10.4_

- [x] 14. 前端处理进度组件
  - 创建client/src/components/ProgressBar.tsx组件
  - 显示已处理/总文档数量
  - 实时更新当前处理阶段（识别中、配对中、排序中）
  - 显示处理失败的文档列表
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 15. 前端文档结果展示
  - 创建client/src/components/DocumentCard.tsx组件，显示单个文档信息
  - 显示文档类型图标、文件名、识别字段、置信度
  - 实现React DnD拖拽排序功能
  - 创建EditModal.tsx，允许修改任意字段
  - 添加手动配对/取消配对按钮
  - 实现配对关系的视觉指示（连线或颜色标记）
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 16. 前端警告和异常显示
  - 创建client/src/components/WarningList.tsx组件
  - 显示异常类型图标（重复、金额异常、日期间隔、缺失配对）
  - 显示详细警告消息和相关文档
  - 添加"查看详情"和"忽略"操作
  - 高亮显示有警告的文档卡片
  - _Requirements: 4.5, 8.5_

- [x] 17. PDF汇总表生成服务
  - 创建server/src/services/PDFGenerator.ts类
  - 使用jsPDF库生成PDF文档
  - 添加中文字体支持（使用思源黑体或其他开源字体）
  - 创建表格布局，包含项目信息、费用明细、分类汇总
  - 计算并显示各类型费用小计和总计
  - _Requirements: 6.1, 6.4, 10.3_

- [x] 18. 文件打包服务
  - 创建server/src/services/PackageService.ts类
  - 实现文件重命名，按排序顺序添加编号前缀（01_、02_等）
  - 使用archiver库创建ZIP文件
  - 实现POST /api/generate-pdf和POST /api/generate-package路由
  - _Requirements: 6.3, 6.5_

- [x] 19. 前端导出功能
  - 创建client/src/components/ExportPanel.tsx组件
  - 添加"下载PDF汇总"、"下载完整包"按钮
  - 实现前端API调用服务client/src/services/api.ts
  - 连接所有前端组件到后端API
  - 实现文件下载功能
  - _Requirements: 6.1, 6.3, 8.1, 8.2, 9.1_

- [x] 20. 错误处理和工具类
  - 创建server/src/utils/ErrorHandler.ts类
  - 定义错误类型：FileError、AIError、ValidationError
  - 创建用户友好的错误消息映射
  - 添加错误降级处理（AI失败时返回空数据供手动编辑）
  - 创建server/src/utils/Logger.ts类，实现日志记录
  - _Requirements: 7.5, 8.5, 9.5_

- [x] 21. 前端用户体验优化
  - 创建client/src/components/Toast.tsx通知组件
  - 添加Spinner和加载状态组件
  - 在文件上传、AI处理时显示加载状态
  - 添加操作确认对话框（删除、清空数据等）
  - 优化响应式布局，适配移动端
  - _Requirements: 8.3, 9.1, 9.2_

- [x] 22. 端到端集成测试
  - 测试完整流程：上传 → 识别 → 配对 → 排序 → 导出
  - 验证错误处理和重试机制
  - 测试手动编辑和拖拽排序功能
  - 验证配对关系显示和警告提示
  - 测试导出的PDF和ZIP文件
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 23. 部署配置和文档
  - 创建Dockerfile，使用多阶段构建
  - 创建docker-compose.yml配置文件
  - 配置环境变量和端口映射
  - 创建README.md，包含项目介绍和功能说明
  - 编写部署指南（本地开发、Docker部署）
  - 添加API配置说明和使用教程
  - _Requirements: 10.1, 10.2_