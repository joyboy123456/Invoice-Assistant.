# 端到端集成测试

## 概述

本目录包含AI发票整理助手的端到端集成测试，验证完整的业务流程。

## 测试内容

### 核心功能测试

1. **文件上传和验证**
   - 有效文件格式验证
   - 无效文件类型拒绝
   - 文件大小限制检查

2. **AI连接测试**
   - API配置验证
   - 连接状态检查

3. **文档识别**
   - 发票识别
   - 行程单识别
   - 字段提取准确性

4. **智能配对**
   - 发票与行程单匹配
   - 置信度评分
   - 匹配原因说明

5. **智能排序**
   - 按费用类型分组
   - 日期排序
   - 配对文档相邻放置

6. **异常检测**
   - 重复发票检测
   - 金额异常标记
   - 日期间隔检测
   - 缺失配对警告

7. **手动编辑功能**
   - 字段修改
   - 拖拽排序

8. **PDF生成**
   - 汇总表生成
   - 内容完整性验证

9. **ZIP打包**
   - 文件重命名
   - 打包完整性验证

10. **错误处理**
    - 无效配置处理
    - 空数据处理
    - 重试机制

11. **批量处理**
    - 多文件处理流程

## 运行测试

### 前置条件

确保已安装所有依赖：

```bash
cd server
npm install
```

### 运行测试

```bash
# 运行端到端测试
npx ts-node src/__test__/e2e.test.ts
```

### 使用真实AI API测试

如果要测试真实的AI识别功能，需要设置环境变量：

```bash
export TEST_API_ENDPOINT="https://api.openai.com/v1"
export TEST_API_KEY="your-api-key"
export TEST_MODEL="gpt-4o"

npx ts-node src/__test__/e2e.test.ts
```

## 测试结果

测试会输出彩色的结果摘要：

- ✓ 绿色：测试通过
- ✗ 红色：测试失败
- ℹ 蓝色：信息提示

## 测试覆盖的需求

- Requirement 1.1: 文档识别和类型判断
- Requirement 2.1: 智能配对
- Requirement 3.1: 智能排序
- Requirement 4.1: 异常检测
- Requirement 5.1: 手动编辑
- Requirement 6.1: 文档导出

## 注意事项

1. 某些测试（如AI识别）需要真实的API密钥才能完全验证
2. 测试使用模拟数据来验证业务逻辑
3. 文件处理测试使用内存缓冲区，不会创建实际文件
4. 测试会自动清理内存，避免资源泄漏

## 扩展测试

如需添加新的测试用例，请遵循以下模式：

```typescript
async function testNewFeature() {
  logInfo('\n测试X: 新功能');
  
  try {
    // 测试逻辑
    logSuccess('测试通过');
    return true;
  } catch (error) {
    logError(`测试失败: ${error}`);
    return false;
  }
}
```

然后在 `runE2ETests()` 函数中添加：

```typescript
results['新功能'] = await testNewFeature();
```
