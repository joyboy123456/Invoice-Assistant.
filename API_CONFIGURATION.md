# API配置指南 (API Configuration Guide)

本文档详细说明如何配置不同AI服务提供商的API。

## 目录

1. [OpenAI官方API](#openai官方api)
2. [Azure OpenAI](#azure-openai)
3. [本地部署模型](#本地部署模型)
4. [其他兼容服务](#其他兼容服务)
5. [故障排除](#故障排除)

## OpenAI官方API

### 获取API密钥

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册或登录账户
3. 进入 [API Keys](https://platform.openai.com/api-keys) 页面
4. 点击 "Create new secret key"
5. 复制并保存密钥（只显示一次）

### 配置步骤

在应用中填写以下信息：

```
API端点: https://api.openai.com/v1/chat/completions
API密钥: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
模型名称: gpt-4o
```

### 推荐模型

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| gpt-4o | 最新多模态模型，速度快 | 推荐使用 |
| gpt-4-vision-preview | 视觉能力强 | 复杂文档识别 |
| gpt-4-turbo | 平衡性能和成本 | 一般使用 |

### 定价参考

- gpt-4o: $5.00 / 1M input tokens, $15.00 / 1M output tokens
- gpt-4-vision: $10.00 / 1M input tokens, $30.00 / 1M output tokens

### 使用限制

- 免费试用: $5 额度
- 付费账户: 根据使用量计费
- 速率限制: 根据账户等级不同

### 测试配置

```bash
curl -X POST http://localhost:3000/api/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "apiKey": "sk-proj-your-key-here",
    "model": "gpt-4o"
  }'
```


## Azure OpenAI

### 前置要求

1. Azure订阅账户
2. 创建Azure OpenAI资源
3. 部署GPT-4 Vision模型

### 创建Azure OpenAI资源

1. 登录 [Azure Portal](https://portal.azure.com/)
2. 搜索 "Azure OpenAI"
3. 点击 "Create"
4. 填写资源信息：
   - 订阅
   - 资源组
   - 区域（建议选择East US或West Europe）
   - 名称
   - 定价层
5. 创建资源

### 部署模型

1. 进入创建的Azure OpenAI资源
2. 点击 "Model deployments"
3. 点击 "Create new deployment"
4. 选择模型：gpt-4 或 gpt-4-vision
5. 输入部署名称（例如：gpt-4-vision-deployment）
6. 点击 "Create"

### 获取配置信息

1. 在Azure OpenAI资源页面，点击 "Keys and Endpoint"
2. 复制以下信息：
   - Endpoint（端点URL）
   - Key 1 或 Key 2（API密钥）
3. 记录您的部署名称

### 配置步骤

在应用中填写以下信息：

```
API端点: https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name/chat/completions?api-version=2024-02-15-preview
API密钥: your-azure-api-key-here
模型名称: your-deployment-name
```

### 端点URL格式

```
https://{resource-name}.openai.azure.com/openai/deployments/{deployment-name}/chat/completions?api-version={api-version}
```

参数说明：
- `resource-name`: Azure OpenAI资源名称
- `deployment-name`: 模型部署名称
- `api-version`: API版本（推荐使用 2024-02-15-preview）

### 配置示例

```
API端点: https://my-openai-resource.openai.azure.com/openai/deployments/gpt-4-vision/chat/completions?api-version=2024-02-15-preview
API密钥: 1234567890abcdef1234567890abcdef
模型名称: gpt-4-vision
```

### 定价参考

Azure OpenAI定价与OpenAI官方类似，但可能因区域而异。查看 [Azure定价页面](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)。

### 优势

- 企业级安全和合规
- 数据隐私保护
- 与Azure服务集成
- 专用容量选项


## 本地部署模型

### LM Studio

LM Studio是一个桌面应用，可以在本地运行大语言模型。

#### 安装LM Studio

1. 访问 [LM Studio官网](https://lmstudio.ai/)
2. 下载适合您操作系统的版本
3. 安装并启动应用

#### 下载模型

1. 在LM Studio中搜索支持视觉的模型：
   - llava-v1.5-7b
   - llava-v1.6-34b
   - bakllava
2. 点击下载模型
3. 等待下载完成

#### 启动本地服务器

1. 在LM Studio中选择已下载的模型
2. 点击 "Start Server"
3. 默认端口为 1234
4. 记录服务器地址：http://localhost:1234

#### 配置步骤

在应用中填写以下信息：

```
API端点: http://localhost:1234/v1/chat/completions
API密钥: not-needed
模型名称: llava-v1.5-7b
```

#### 优势

- 完全离线使用
- 数据隐私保护
- 无使用成本
- 无速率限制

#### 劣势

- 需要较高硬件配置（推荐16GB+ RAM）
- 识别准确度可能低于GPT-4
- 处理速度较慢

### Ollama

Ollama是另一个本地运行大模型的工具。

#### 安装Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 从 https://ollama.com/download 下载安装程序
```

#### 下载并运行模型

```bash
# 下载llava模型
ollama pull llava

# 启动服务
ollama serve
```

#### 配置步骤

```
API端点: http://localhost:11434/v1/chat/completions
API密钥: not-needed
模型名称: llava
```

### LocalAI

LocalAI是一个自托管的OpenAI兼容API。

#### 使用Docker运行

```bash
docker run -p 8080:8080 \
  -v $PWD/models:/models \
  localai/localai:latest
```

#### 配置步骤

```
API端点: http://localhost:8080/v1/chat/completions
API密钥: not-needed
模型名称: your-model-name
```


## 其他兼容服务

### Anthropic Claude (通过代理)

虽然Claude不直接支持OpenAI格式，但可以通过代理服务使用。

#### 使用LiteLLM代理

```bash
# 安装LiteLLM
pip install litellm

# 启动代理服务器
litellm --model claude-3-opus-20240229 --api_key your-anthropic-key
```

#### 配置步骤

```
API端点: http://localhost:8000/chat/completions
API密钥: your-anthropic-key
模型名称: claude-3-opus-20240229
```

### Google Gemini (通过代理)

类似地，可以通过代理使用Gemini。

```bash
litellm --model gemini/gemini-pro-vision --api_key your-google-key
```

### 国内AI服务

#### 智谱AI (GLM-4V)

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并获取API密钥
3. 查看API文档获取端点信息

```
API端点: https://open.bigmodel.cn/api/paas/v4/chat/completions
API密钥: your-zhipu-api-key
模型名称: glm-4v
```

#### 百度文心一言

1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 开通文心一言服务
3. 获取API Key和Secret Key

需要通过代理转换为OpenAI格式。

#### 阿里通义千问

1. 访问 [阿里云模型服务](https://www.aliyun.com/product/dashscope)
2. 开通服务并获取API密钥

需要通过代理转换为OpenAI格式。

### 自建代理服务

如果您的AI服务不兼容OpenAI格式，可以创建一个简单的代理：

```javascript
// proxy-server.js
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/v1/chat/completions', async (req, res) => {
  try {
    // 转换请求格式
    const customRequest = convertToCustomFormat(req.body);
    
    // 调用您的AI服务
    const response = await axios.post('your-ai-service-url', customRequest);
    
    // 转换响应格式为OpenAI格式
    const openaiResponse = convertToOpenAIFormat(response.data);
    
    res.json(openaiResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8080, () => {
  console.log('Proxy server running on port 8080');
});
```


## 故障排除

### 常见错误

#### 1. 连接失败

**错误信息**: "Failed to connect to API"

**可能原因**:
- API端点URL错误
- 网络连接问题
- 防火墙阻止

**解决方案**:
```bash
# 测试网络连接
curl -I https://api.openai.com

# 检查端点URL格式
# 确保包含完整路径，如 /v1/chat/completions

# 检查防火墙设置
sudo ufw status
```

#### 2. 认证失败

**错误信息**: "Invalid API key" 或 "401 Unauthorized"

**可能原因**:
- API密钥错误
- API密钥已过期
- API密钥权限不足

**解决方案**:
- 重新复制API密钥，确保没有多余空格
- 检查API密钥是否有效
- 确认API密钥有访问所需模型的权限

#### 3. 模型不存在

**错误信息**: "Model not found" 或 "404 Not Found"

**可能原因**:
- 模型名称错误
- 模型未部署（Azure）
- 模型不支持视觉功能

**解决方案**:
- 检查模型名称拼写
- 确认模型支持图像输入
- 对于Azure，确认部署名称正确

#### 4. 速率限制

**错误信息**: "Rate limit exceeded" 或 "429 Too Many Requests"

**可能原因**:
- 超过API调用频率限制
- 超过账户配额

**解决方案**:
- 等待一段时间后重试
- 升级API账户等级
- 减少并发处理数：
```env
MAX_CONCURRENT=1
```

#### 5. 超时错误

**错误信息**: "Request timeout"

**可能原因**:
- 网络延迟高
- AI服务响应慢
- 图片过大

**解决方案**:
- 增加超时时间
- 压缩图片大小
- 使用更快的网络连接

### 调试技巧

#### 启用详细日志

```env
LOG_LEVEL=debug
```

#### 使用curl测试API

```bash
# OpenAI
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Azure OpenAI
curl https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

#### 检查应用日志

```bash
# Docker部署
docker-compose logs -f | grep API

# 本地开发
# 查看浏览器控制台
# 查看终端输出
```

### 性能优化

#### 减少API调用成本

1. **批量处理**: 一次处理多个文档
2. **缓存结果**: 避免重复识别相同文档
3. **压缩图片**: 减少传输数据量
4. **选择合适模型**: 根据需求选择性价比高的模型

#### 提高识别准确度

1. **使用高质量图片**: 清晰、高分辨率
2. **优化Prompt**: 提供更详细的指令
3. **选择更强大的模型**: 如GPT-4o
4. **多次验证**: 对关键信息进行二次确认

### 安全建议

1. **保护API密钥**:
   - 不要在代码中硬编码
   - 不要提交到版本控制
   - 定期轮换密钥

2. **限制访问**:
   - 使用环境变量
   - 设置IP白名单（如果支持）
   - 监控异常使用

3. **数据安全**:
   - 使用HTTPS
   - 不要记录敏感信息
   - 及时清理临时数据

## 推荐配置

### 个人使用

```
服务: OpenAI官方API
模型: gpt-4o
预算: $10-20/月
```

### 企业使用

```
服务: Azure OpenAI
模型: gpt-4-vision
优势: 企业级安全、合规性
```

### 隐私敏感

```
服务: 本地部署（LM Studio/Ollama）
模型: llava-v1.6-34b
优势: 完全离线、数据不出本地
```

### 高性能需求

```
服务: OpenAI官方API
模型: gpt-4o
配置: 增加并发数和内存限制
```

---

**提示**: 建议先使用测试连接功能验证配置，确保一切正常后再开始批量处理文档。
