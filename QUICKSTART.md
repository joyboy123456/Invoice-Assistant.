# 快速开始指南 (Quick Start Guide)

5分钟快速部署和使用AI发票整理助手。

## 方式一: Docker部署（推荐）

### 前置要求
- 安装Docker和Docker Compose

### 步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd ai-invoice-organizer

# 2. 启动服务
docker-compose up -d

# 3. 访问应用
# 打开浏览器访问 http://localhost:3000
```

就这么简单！

## 方式二: 本地开发

### 前置要求
- Node.js 18+
- npm

### 步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd ai-invoice-organizer

# 2. 安装依赖
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 打开浏览器访问 http://localhost:5173
```

## 首次使用

### 1. 配置AI API

打开应用后，点击"API配置"按钮：

**使用OpenAI**:
```
API端点: https://api.openai.com/v1/chat/completions
API密钥: sk-proj-your-key-here
模型名称: gpt-4o
```

**使用本地模型（LM Studio）**:
```
API端点: http://localhost:1234/v1/chat/completions
API密钥: not-needed
模型名称: llava-v1.5-7b
```

点击"测试连接"确保配置正确。

### 2. 填写项目信息

输入：
- 项目名称
- 部门
- 报销期间

### 3. 上传文件

拖拽或选择发票和行程单文件（支持PDF、PNG、JPG）。

### 4. 开始处理

点击"开始处理"按钮，等待AI自动识别和整理。

### 5. 查看和编辑

- 查看识别结果
- 修改任何不准确的信息
- 调整文档顺序

### 6. 导出

点击"下载PDF汇总"或"下载完整包"。

## 常见问题

### Q: Docker容器启动失败？
```bash
# 查看日志
docker-compose logs

# 检查端口占用
sudo lsof -i :3000

# 修改端口（编辑 .env）
PORT=8080
```

### Q: AI识别失败？
- 检查API配置是否正确
- 点击"测试连接"验证
- 查看浏览器控制台错误信息

### Q: 如何使用本地模型？
1. 下载并安装 [LM Studio](https://lmstudio.ai/)
2. 下载llava模型
3. 启动本地服务器
4. 配置API端点为 `http://localhost:1234/v1/chat/completions`

## 下一步

- 查看 [README.md](README.md) 了解完整功能
- 查看 [API_CONFIGURATION.md](API_CONFIGURATION.md) 了解更多API配置选项
- 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 了解生产环境部署

## 获取帮助

- 查看文档
- 提交Issue到GitHub
- 查看常见问题解答

---

**提示**: 首次使用建议先用1-2个文件测试，确保配置正确后再批量处理。
