# ExportPanel Component

导出面板组件，提供PDF汇总表和完整文件包的下载功能。

## 功能特性

- ✅ 下载PDF汇总表（包含所有费用明细和分类汇总）
- ✅ 下载完整报销包（ZIP格式，包含PDF和所有原始文件）
- ✅ 实时显示文档统计信息
- ✅ 智能验证（检查项目信息和文档数据）
- ✅ 加载状态显示
- ✅ 错误处理和用户提示

## 使用方法

### 基础用法

```typescript
import { ExportPanel } from './components/ExportPanel';

function App() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <ExportPanel
      files={files}
      onExportStart={() => console.log('开始导出')}
      onExportComplete={() => console.log('导出完成')}
      onExportError={(error) => console.error('导出失败:', error)}
    />
  );
}
```

### 完整示例

```typescript
import { useState } from 'react';
import { ExportPanel } from './components/ExportPanel';
import { useAppStore } from './store/useAppStore';

function MyApp() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {/* Toast通知 */}
      {toast && <div className="toast">{toast}</div>}

      {/* 导出面板 */}
      <ExportPanel
        files={uploadedFiles}
        onExportStart={() => showToast('正在生成文件...')}
        onExportComplete={() => showToast('文件已下载')}
        onExportError={(error) => showToast(`错误: ${error}`)}
      />
    </div>
  );
}
```

## Props

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `files` | `File[]` | 是 | 原始上传的文件列表，用于生成ZIP包 |
| `onExportStart` | `() => void` | 否 | 导出开始时的回调函数 |
| `onExportComplete` | `() => void` | 否 | 导出成功完成时的回调函数 |
| `onExportError` | `(error: string) => void` | 否 | 导出失败时的回调函数，接收错误消息 |

## 数据依赖

组件从Zustand store中读取以下数据：

- `documents`: 已识别的文档列表
- `projectInfo`: 项目信息（项目名称、部门、报销期间）
- `pairs`: 文档配对结果

确保在使用组件前，这些数据已正确填充到store中。

## 验证规则

导出按钮在以下情况下会被禁用：

1. 没有可导出的文档（`documents.length === 0`）
2. 项目信息不完整（缺少项目名称、部门或报销期间）
3. 对于ZIP包导出，还需要有原始文件（`files.length > 0`）

## 文件命名规则

生成的文件会自动命名：

- **PDF汇总表**: `{项目名称}_费用汇总_{日期}.pdf`
- **完整报销包**: `{项目名称}_完整报销包_{日期}.zip`

例如：
- `2024年Q1差旅报销_费用汇总_2024-03-15.pdf`
- `2024年Q1差旅报销_完整报销包_2024-03-15.zip`

## 显示内容

### 文档统计

组件会显示以下统计信息：

- 文档总数
- 配对数量
- 发票数量
- 行程单数量

### 按钮状态

- **正常状态**: 蓝色（PDF）和绿色（ZIP）按钮
- **禁用状态**: 灰色按钮，显示禁用原因
- **加载状态**: 显示旋转图标和"生成中..."/"打包中..."文字

## 错误处理

组件会处理以下错误情况：

1. **验证错误**: 数据不完整时显示提示信息
2. **API错误**: 网络请求失败时通过`onExportError`回调通知
3. **文件生成错误**: 后端处理失败时显示错误消息

## 样式定制

组件使用Tailwind CSS类，可以通过以下方式定制样式：

```typescript
// 修改按钮颜色
<button className="bg-purple-600 hover:bg-purple-700">
  自定义按钮
</button>
```

## 与后端API的交互

组件调用以下API接口：

### 生成PDF汇总表

```
POST /api/generate-pdf
Content-Type: application/json

{
  "documents": [...],
  "projectInfo": {...},
  "sorting": {...}
}

Response: PDF文件（application/pdf）
```

### 生成完整文件包

```
POST /api/generate-package
Content-Type: multipart/form-data

files: [File, File, ...]
documents: JSON string
projectInfo: JSON string
sorting: JSON string

Response: ZIP文件（application/zip）
```

## 性能优化

1. **防抖处理**: 按钮点击后立即禁用，防止重复提交
2. **内存管理**: 使用Blob URL并在下载后及时释放
3. **错误恢复**: 失败后自动恢复按钮状态，允许重试

## 注意事项

1. **文件顺序**: 确保`files`数组的顺序与`documents`数组一致
2. **大文件处理**: 生成ZIP包时可能需要较长时间，建议显示加载提示
3. **浏览器兼容性**: 使用了现代浏览器API（Blob、URL.createObjectURL），需要现代浏览器支持
4. **移动端**: 在移动设备上下载大文件可能受限，建议提示用户

## 测试

查看`ExportPanel.example.tsx`文件了解完整的使用示例和测试方法。

## 相关组件

- `APIConfigPanel`: API配置面板
- `UploadZone`: 文件上传组件
- `DocumentList`: 文档列表组件
- `ProgressBar`: 进度条组件

## 相关服务

- `api.ts`: API调用服务
- `useAppStore.ts`: 状态管理store
