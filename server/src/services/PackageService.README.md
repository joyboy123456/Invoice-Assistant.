# PackageService 文件打包服务

## 概述

PackageService 负责将处理后的文档按照排序顺序重命名并打包成 ZIP 文件，方便用户下载和提交报销。

## 主要功能

### 1. 文件重命名

按照排序顺序为文件添加编号前缀（01_、02_、03_等），确保文件按正确顺序排列。

```typescript
const fileNames = packageService.generateFileNames(documents, sorting);
// 返回 Map<documentId, newFileName>
// 例如: "doc1" -> "01_invoice_taxi.pdf"
```

### 2. ZIP 打包

将所有文档文件打包成一个 ZIP 文件，包含：
- 重命名后的文档文件
- 项目信息文本文件（project_info.txt）

```typescript
const zipBuffer = await packageService.generatePackage(
  documents,
  sorting,
  projectInfo,
  fileBuffers
);
```

### 3. 项目信息文件

自动生成包含以下内容的文本文件：
- 项目基本信息（名称、部门、期间）
- 文件清单（按顺序列出所有文件）
- 统计信息（发票数量、总金额、分类汇总）

## API 端点

### POST /api/generate-pdf

生成 PDF 汇总表

**请求体:**
```json
{
  "documents": [...],
  "projectInfo": {
    "projectName": "项目名称",
    "department": "部门",
    "reimbursementPeriod": "2024-11"
  },
  "sorting": {
    "suggestedOrder": ["doc1", "doc2", "doc3"],
    "grouping": {...}
  }
}
```

**响应:**
- Content-Type: application/pdf
- 直接返回 PDF 文件流

### POST /api/generate-package

生成完整文件包（ZIP）

**请求体:**
- Content-Type: multipart/form-data
- files: 文件数组
- documents: JSON 字符串（文档数据）
- sorting: JSON 字符串（排序信息）
- projectInfo: JSON 字符串（项目信息）

**响应:**
- Content-Type: application/zip
- 直接返回 ZIP 文件流

## 使用示例

### 前端调用示例

```typescript
// 生成 PDF
async function downloadPDF() {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      documents,
      projectInfo,
      sorting
    })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expense_summary.pdf';
  a.click();
}

// 生成 ZIP 包
async function downloadPackage() {
  const formData = new FormData();
  
  // 添加文件
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // 添加元数据
  formData.append('documents', JSON.stringify(documents));
  formData.append('sorting', JSON.stringify(sorting));
  formData.append('projectInfo', JSON.stringify(projectInfo));
  
  const response = await fetch('/api/generate-package', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expense_package.zip';
  a.click();
}
```

## 文件命名规则

1. **编号格式**: 两位数字，不足补零（01、02、...、99）
2. **命名格式**: `{编号}_{原文件名}`
3. **排序依据**: 按照 SortingResult.suggestedOrder 的顺序

示例：
```
01_hotel_invoice.pdf
02_taxi_invoice.pdf
03_taxi_trip_sheet.jpg
04_train_invoice.pdf
```

## 项目信息文件格式

生成的 `project_info.txt` 包含：

```
============================================================
项目信息 / Project Information
============================================================

项目名称 / Project Name: 测试项目
部门 / Department: 技术部
报销期间 / Period: 2024-11
生成日期 / Generated: 2024-11-17 10:30:00

============================================================
文件清单 / File List
============================================================

01. hotel_invoice.pdf
    类型 / Type: 发票/Invoice (酒店/Hotel)
    日期 / Date: 2024-11-02
    金额 / Amount: 450.00
    说明 / Description: 酒店住宿

02. taxi_invoice.pdf
    类型 / Type: 发票/Invoice (出租车/Taxi)
    日期 / Date: 2024-11-01
    金额 / Amount: 219.67

============================================================
统计信息 / Statistics
============================================================

发票数量 / Invoice Count: 2
行程单数量 / Trip Sheet Count: 1
总金额 / Total Amount: 669.67

分类汇总 / Category Summary:
  酒店/Hotel: 450.00
  出租车/Taxi: 219.67
```

## 错误处理

服务会抛出以下错误：

1. **ValidationError**: 参数验证失败
   - 文档数据为空
   - 排序信息缺失
   - 项目信息不完整

2. **FileError**: 文件处理失败
   - 文件 Buffer 缺失
   - ZIP 打包失败

## 性能考虑

1. **内存使用**: ZIP 打包在内存中完成，大文件可能占用较多内存
2. **压缩级别**: 使用最高压缩级别（level 9）以减小文件大小
3. **流式处理**: 使用 archiver 的流式 API，支持大文件处理

## 依赖项

- `archiver`: ZIP 文件创建
- `jspdf`: PDF 生成（通过 PDFGenerator）
- `jspdf-autotable`: PDF 表格生成

## 测试

运行测试：
```bash
npx ts-node src/services/__test__/PackageService.test.ts
```

测试覆盖：
- 文件名生成
- ZIP 包创建
- 项目信息文本生成
