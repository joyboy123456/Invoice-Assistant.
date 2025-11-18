# 贡献指南 (Contributing Guide)

感谢您对AI发票整理助手项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告Bug

如果您发现了bug，请：

1. 检查 [Issues](https://github.com/your-repo/issues) 确认问题未被报告
2. 创建新Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 预期行为和实际行为
   - 环境信息（操作系统、Node版本等）
   - 截图或日志（如果适用）

### 提出新功能

如果您有新功能建议：

1. 创建Feature Request Issue
2. 描述功能的用途和价值
3. 提供使用场景示例
4. 讨论实现方案

### 提交代码

#### 开发流程

1. **Fork项目**
   ```bash
   # 在GitHub上Fork项目
   # 克隆您的Fork
   git clone https://github.com/your-username/ai-invoice-organizer.git
   cd ai-invoice-organizer
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

4. **开发和测试**
   ```bash
   # 启动开发服务器
   npm run dev
   
   # 运行测试
   cd server && npm test
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # 或
   git commit -m "fix: resolve bug"
   ```

6. **推送到GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建Pull Request**
   - 在GitHub上创建PR
   - 填写PR模板
   - 等待代码审查

#### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(api): add batch processing endpoint

Implement new endpoint for processing multiple documents
in a single request to improve performance.

Closes #123
```

### 代码规范

#### TypeScript/JavaScript

- 使用TypeScript
- 遵循ESLint规则
- 使用有意义的变量名
- 添加必要的注释
- 保持函数简洁（单一职责）

```typescript
// 好的示例
async function processDocument(file: File): Promise<DocumentData> {
  // 验证文件
  validateFile(file);
  
  // 处理文件
  const processed = await fileService.process(file);
  
  // 返回结果
  return processed;
}

// 避免
async function doStuff(f: any) {
  // 复杂的逻辑...
}
```

#### React组件

- 使用函数组件和Hooks
- 提取可复用逻辑到自定义Hooks
- 使用TypeScript类型
- 保持组件简洁

```typescript
// 好的示例
interface DocumentCardProps {
  document: DocumentData;
  onEdit: (id: string) => void;
}

export function DocumentCard({ document, onEdit }: DocumentCardProps) {
  return (
    <div className="card">
      {/* 组件内容 */}
    </div>
  );
}
```

#### CSS/Tailwind

- 优先使用Tailwind类
- 保持类名有序（布局 → 外观 → 交互）
- 提取重复样式到组件

```tsx
// 好的示例
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  点击
</button>
```

### 测试

- 为新功能添加测试
- 确保所有测试通过
- 测试覆盖核心逻辑

```typescript
describe('DocumentService', () => {
  it('should process valid document', async () => {
    const result = await documentService.process(validFile);
    expect(result.status).toBe('completed');
  });
  
  it('should reject invalid file format', async () => {
    await expect(
      documentService.process(invalidFile)
    ).rejects.toThrow('Unsupported format');
  });
});
```

### 文档

- 更新相关文档
- 添加JSDoc注释
- 更新README（如果需要）

```typescript
/**
 * 处理上传的文档文件
 * @param file - 要处理的文件
 * @returns 处理后的文档数据
 * @throws {FileError} 如果文件格式不支持
 */
async function processDocument(file: File): Promise<DocumentData> {
  // 实现...
}
```

## 开发环境设置

### 推荐工具

- **IDE**: VS Code
- **扩展**:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

### VS Code配置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 项目结构

```
ai-invoice-organizer/
├── client/              # 前端应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── services/    # API服务
│   │   ├── store/       # 状态管理
│   │   └── types/       # 类型定义
│   └── package.json
├── server/              # 后端应用
│   ├── src/
│   │   ├── routes/      # API路由
│   │   ├── services/    # 业务逻辑
│   │   ├── middleware/  # 中间件
│   │   └── utils/       # 工具函数
│   └── package.json
└── docs/                # 文档
```

## 发布流程

1. 更新版本号（package.json）
2. 更新CHANGELOG.md
3. 创建Git标签
4. 推送到GitHub
5. 创建Release

## 行为准则

- 尊重所有贡献者
- 保持友好和专业
- 接受建设性批评
- 关注项目目标

## 许可证

通过贡献代码，您同意您的贡献将在MIT许可证下发布。

## 问题？

如有任何问题，请：
- 创建Issue讨论
- 查看现有文档
- 联系维护者

---

感谢您的贡献！🎉
