# API Service

前端API调用服务，提供与后端通信的所有接口。

## 功能概述

- 测试AI API连接
- 上传和识别文档
- 批量处理文档
- 生成PDF汇总表
- 生成完整文件包（ZIP）
- 文件下载辅助功能

## API接口

### testConnection

测试AI API连接是否正常。

```typescript
import { testConnection } from '../services/api';

const result = await testConnection({
  endpoint: 'https://api.openai.com/v1',
  apiKey: 'sk-...',
  model: 'gpt-4-vision-preview'
});

console.log(result.success); // true/false
console.log(result.message); // 连接状态消息
```

### uploadFile

上传单个文件到服务器。

```typescript
import { uploadFile } from '../services/api';

const file = new File(['content'], 'invoice.pdf', { type: 'application/pdf' });
const result = await uploadFile(file);

console.log(result.success); // true
console.log(result.message); // '文件上传成功'
```

### recognizeDocument

识别单个文档内容。

```typescript
import { recognizeDocument } from '../services/api';

const file = new File(['content'], 'invoice.pdf', { type: 'application/pdf' });
const apiConfig = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: 'sk-...',
  model: 'gpt-4-vision-preview'
};

const result = await recognizeDocument(file, apiConfig);
console.log(result.document); // DocumentData对象
```

### batchProcess

批量处理多个文档，包括识别、配对、排序和异常检测。

```typescript
import { batchProcess } from '../services/api';

const files = [file1, file2, file3];
const apiConfig = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: 'sk-...',
  model: 'gpt-4-vision-preview'
};

const result = await batchProcess(files, apiConfig);

console.log(result.documents);  // 识别后的文档数组
console.log(result.pairs);      // 配对结果
console.log(result.sorting);    // 排序建议
console.log(result.warnings);   // 警告信息
```

### generatePDF

生成PDF汇总表。

```typescript
import { generatePDF, downloadBlob } from '../services/api';

const blob = await generatePDF(documents, projectInfo, sorting);
downloadBlob(blob, 'expense_summary.pdf');
```

### generatePackage

生成包含所有文件的ZIP包。

```typescript
import { generatePackage, downloadBlob } from '../services/api';

const blob = await generatePackage(files, documents, projectInfo, sorting);
downloadBlob(blob, 'expense_package.zip');
```

### downloadBlob

辅助函数，用于下载Blob对象为文件。

```typescript
import { downloadBlob } from '../services/api';

const blob = new Blob(['content'], { type: 'text/plain' });
downloadBlob(blob, 'filename.txt');
```

## 错误处理

所有API调用都可能抛出`APIError`异常：

```typescript
import { batchProcess, APIError } from '../services/api';

try {
  const result = await batchProcess(files, apiConfig);
  // 处理成功结果
} catch (error) {
  if (error instanceof APIError) {
    console.error('API错误:', error.message);
    console.error('状态码:', error.statusCode);
    console.error('错误代码:', error.code);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 环境配置

API基础URL可以通过环境变量配置：

```bash
# .env
VITE_API_URL=http://localhost:3000
```

如果未设置，默认使用`http://localhost:3000`。

## 完整示例

```typescript
import { useState } from 'react';
import { batchProcess, generatePDF, downloadBlob, APIError } from '../services/api';
import { useAppStore } from '../store/useAppStore';

function MyComponent() {
  const { apiConfig, projectInfo } = useAppStore();
  const [files, setFiles] = useState<File[]>([]);

  const handleProcess = async () => {
    try {
      // 批量处理文档
      const result = await batchProcess(files, apiConfig);
      
      // 生成PDF
      const pdfBlob = await generatePDF(
        result.documents,
        projectInfo,
        result.sorting
      );
      
      // 下载PDF
      downloadBlob(pdfBlob, 'summary.pdf');
      
    } catch (error) {
      if (error instanceof APIError) {
        alert(`处理失败: ${error.message}`);
      }
    }
  };

  return (
    <button onClick={handleProcess}>
      处理并下载
    </button>
  );
}
```

## 注意事项

1. **API配置**: 确保在调用API前已正确配置API端点和密钥
2. **文件大小**: 单个文件最大10MB，批量上传时注意总大小
3. **超时处理**: 大文件处理可能需要较长时间，建议显示进度提示
4. **错误重试**: 网络错误时可以实现自动重试机制
5. **安全性**: API密钥仅存储在本地，不会发送到除AI服务外的其他服务器
