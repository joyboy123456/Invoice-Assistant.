# AI发票整理助手 (AI Invoice Organizer)

一个智能文档处理系统，自动化发票和行程单的识别、分类、配对和整理流程。

## 功能特性

### 核心功能

- **智能文档识别**: 使用AI自动识别发票和行程单，提取关键信息
- **自动配对**: 智能匹配发票与对应的行程单
- **智能排序**: 按照报销规范自动排序文档
- **异常检测**: 自动检测重复发票、金额异常、日期间隔等问题
- **批量处理**: 支持一次性上传和处理多个文档
- **手动编辑**: 可修改AI识别结果，手动调整配对和排序
- **一键导出**: 生成PDF汇总表和完整文档包

### 技术特点

- **隐私优先**: 所有数据仅在内存中处理，不持久化到磁盘
- **轻量级**: 内存使用限制在500MB以内，适配低配置VPS
- **跨平台**: 基于Web技术，支持所有主流浏览器
- **灵活配置**: 支持OpenAI兼容的多种AI API提供商

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS + Headless UI
- Zustand (状态管理)
- React DnD (拖拽功能)

### 后端
- Node.js 18+ + Express.js
- TypeScript
- Multer (文件上传)
- pdf-poppler + sharp (PDF处理)
- jsPDF (PDF生成)

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- npm 或 yarn
- (可选) Docker 和 Docker Compose


### 本地开发部署

#### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-invoice-organizer
```

#### 2. 安装依赖

```bash
# 安装根目录依赖（用于并发启动）
npm install

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install

# 返回根目录
cd ..
```

#### 3. 配置环境变量

复制环境变量模板文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量（可选）：

```env
# 服务器端口
PORT=3000

# 内存限制（MB）
MAX_MEMORY_MB=500

# 最大并发处理数
MAX_CONCURRENT=2

# 日志级别 (debug, info, warn, error)
LOG_LEVEL=info
```

#### 4. 启动开发服务器

```bash
# 从根目录启动（同时启动前后端）
npm run dev
```

这将启动：
- 前端开发服务器: http://localhost:5173
- 后端API服务器: http://localhost:3000


### Docker部署

#### 方法1: 使用Docker Compose（推荐）

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

应用将在 http://localhost:3000 上运行。

#### 方法2: 使用Docker Compose + Nginx

如果需要使用Nginx反向代理：

```bash
# 启动应用和Nginx
docker-compose --profile with-nginx up -d

# 查看日志
docker-compose --profile with-nginx logs -f

# 停止服务
docker-compose --profile with-nginx down
```

应用将在 http://localhost:80 上运行。

#### 方法3: 手动Docker构建

```bash
# 构建镜像
docker build -t ai-invoice-organizer .

# 运行容器
docker run -d \
  --name ai-invoice-organizer \
  -p 3000:3000 \
  -e MAX_MEMORY_MB=500 \
  -e MAX_CONCURRENT=2 \
  ai-invoice-organizer

# 查看日志
docker logs -f ai-invoice-organizer

# 停止容器
docker stop ai-invoice-organizer
docker rm ai-invoice-organizer
```


### 生产环境部署

#### VPS部署步骤

1. **准备服务器**
   - 最低配置: 1核CPU, 1GB内存, 10GB存储
   - 推荐配置: 2核CPU, 2GB内存, 20GB存储
   - 操作系统: Ubuntu 20.04+ / CentOS 7+ / Debian 10+

2. **安装Docker和Docker Compose**

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

3. **部署应用**

```bash
# 克隆项目
git clone <repository-url>
cd ai-invoice-organizer

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

4. **配置防火墙**

```bash
# 允许HTTP和HTTPS流量
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

5. **配置域名和SSL（可选）**

如果有域名，可以配置SSL证书：

```bash
# 安装Certbot
sudo apt-get update
sudo apt-get install certbot

# 获取SSL证书
sudo certbot certonly --standalone -d your-domain.com

# 证书将保存在 /etc/letsencrypt/live/your-domain.com/
```

然后修改 `nginx.conf` 中的HTTPS配置部分，取消注释并更新域名和证书路径。


## API配置说明

### 支持的AI服务提供商

系统支持任何OpenAI兼容的API，包括：

- **OpenAI**: 官方GPT-4 Vision API
- **Azure OpenAI**: 微软Azure托管的OpenAI服务
- **本地部署**: 使用LM Studio、Ollama等本地运行的模型
- **第三方服务**: 任何提供OpenAI兼容接口的服务

### 配置步骤

1. **打开应用**: 访问 http://localhost:3000

2. **进入API配置面板**: 点击页面上的"API配置"按钮

3. **填写配置信息**:

   - **API端点**: API的完整URL
     - OpenAI: `https://api.openai.com/v1/chat/completions`
     - Azure: `https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview`
     - 本地: `http://localhost:1234/v1/chat/completions`
   
   - **API密钥**: 您的API密钥
     - OpenAI: 从 https://platform.openai.com/api-keys 获取
     - Azure: 从Azure门户获取
     - 本地: 通常不需要或使用 `not-needed`
   
   - **模型名称**: 使用的模型
     - OpenAI: `gpt-4-vision-preview` 或 `gpt-4o`
     - Azure: 您的部署名称
     - 本地: 模型名称，如 `llava`

4. **测试连接**: 点击"测试连接"按钮验证配置

5. **保存配置**: 配置会自动保存到浏览器本地存储

### 配置示例

#### OpenAI官方API

```
API端点: https://api.openai.com/v1/chat/completions
API密钥: sk-proj-xxxxxxxxxxxxxxxxxxxxx
模型名称: gpt-4o
```

#### Azure OpenAI

```
API端点: https://your-resource.openai.azure.com/openai/deployments/gpt-4-vision/chat/completions?api-version=2024-02-15-preview
API密钥: your-azure-api-key
模型名称: gpt-4-vision
```

#### 本地LM Studio

```
API端点: http://localhost:1234/v1/chat/completions
API密钥: not-needed
模型名称: llava-v1.5-7b
```


## 使用教程

### 基本工作流程

1. **配置API**: 首次使用时配置AI服务API（参见上方API配置说明）

2. **填写项目信息**: 输入项目名称、部门、报销期间等信息

3. **上传文件**: 
   - 拖拽文件到上传区域，或点击选择文件
   - 支持PDF、PNG、JPG、JPEG格式
   - 可一次上传多个文件

4. **开始处理**: 点击"开始处理"按钮，系统将自动：
   - 识别文档类型和内容
   - 配对发票和行程单
   - 按规范排序文档
   - 检测异常情况

5. **查看和编辑结果**:
   - 查看识别的文档信息
   - 修改任何字段（点击编辑按钮）
   - 拖拽调整文档顺序
   - 手动配对或取消配对

6. **处理警告**: 查看并处理系统检测到的异常

7. **导出文档**:
   - 下载PDF汇总表
   - 下载完整文档包（ZIP格式）

### 高级功能

#### 手动编辑文档信息

1. 点击文档卡片上的"编辑"按钮
2. 修改任何字段（日期、金额、描述等）
3. 点击"保存"确认修改

#### 手动配对

1. 选择一个发票和一个行程单
2. 点击"手动配对"按钮
3. 系统会将它们关联在一起

#### 拖拽排序

1. 按住文档卡片
2. 拖动到目标位置
3. 释放鼠标完成排序

#### 处理异常警告

系统会自动检测以下异常：
- **重复发票**: 相同发票号或金额的发票
- **金额异常**: 异常高或低的金额
- **日期间隔**: 日期不连续的情况
- **缺失配对**: 没有对应行程单的打车发票

查看警告详情并根据需要进行处理。


## 项目结构

```
ai-invoice-organizer/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务
│   │   ├── store/         # 状态管理
│   │   ├── types/         # TypeScript类型
│   │   └── App.tsx        # 主应用组件
│   ├── public/            # 静态资源
│   └── package.json
├── server/                # 后端应用
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑服务
│   │   ├── middleware/    # 中间件
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # TypeScript类型
│   │   └── index.ts       # 服务器入口
│   └── package.json
├── .kiro/                 # Kiro规范文档
│   └── specs/
│       └── ai-invoice-organizer/
│           ├── requirements.md  # 需求文档
│           ├── design.md        # 设计文档
│           └── tasks.md         # 任务列表
├── Dockerfile             # Docker镜像构建文件
├── docker-compose.yml     # Docker Compose配置
├── nginx.conf             # Nginx配置（可选）
├── .env.example           # 环境变量模板
├── package.json           # 根目录依赖（并发启动）
└── README.md              # 项目文档
```

## 开发指南

### 运行测试

```bash
# 运行后端测试
cd server
npm test

# 运行前端测试（如果有）
cd client
npm test
```

### 构建生产版本

```bash
# 构建前端
cd client
npm run build

# 构建后端
cd server
npm run build
```

### 代码规范

项目使用ESLint和Prettier进行代码格式化：

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix
```


## 常见问题

### Q: 系统支持哪些文件格式？
A: 支持PDF、PNG、JPG、JPEG格式的文件。单个文件最大10MB。

### Q: 数据会被上传到云端吗？
A: 不会。所有数据仅在内存中处理，不会持久化到磁盘或上传到任何服务器（除了调用您配置的AI API）。

### Q: 可以使用哪些AI服务？
A: 支持任何OpenAI兼容的API，包括OpenAI官方、Azure OpenAI、本地部署的模型等。

### Q: 系统对服务器配置有什么要求？
A: 最低1核CPU、1GB内存即可运行。系统设计为轻量级，内存使用限制在500MB以内。

### Q: 如何处理AI识别错误？
A: 系统提供完整的手动编辑功能，您可以修改任何AI识别的字段。

### Q: 可以离线使用吗？
A: 如果使用本地部署的AI模型（如LM Studio），可以完全离线使用。

### Q: 支持哪些语言？
A: 目前主要支持中文发票和行程单的识别。

### Q: 如何备份数据？
A: 系统不持久化数据。建议及时导出处理结果。如需保存项目信息和API配置，它们存储在浏览器本地存储中。

## 性能优化建议

### 低配置环境

如果在低配置VPS上运行，建议：

1. 限制并发处理数：
```env
MAX_CONCURRENT=1
```

2. 减少内存限制：
```env
MAX_MEMORY_MB=300
```

3. 使用Docker资源限制：
```yaml
deploy:
  resources:
    limits:
      memory: 512M
```

### 高性能环境

如果有更好的硬件资源：

```env
MAX_CONCURRENT=4
MAX_MEMORY_MB=1000
```


## 故障排除

### 问题: Docker容器无法启动

**解决方案**:
```bash
# 查看日志
docker-compose logs

# 检查端口占用
sudo lsof -i :3000

# 重新构建镜像
docker-compose build --no-cache
docker-compose up -d
```

### 问题: AI识别失败

**可能原因**:
1. API配置错误
2. API密钥无效
3. 网络连接问题
4. API配额用尽

**解决方案**:
1. 点击"测试连接"验证API配置
2. 检查API密钥是否正确
3. 查看浏览器控制台的错误信息
4. 检查AI服务提供商的配额和账单

### 问题: 内存不足

**解决方案**:
```bash
# 减少并发处理数
# 编辑 .env 文件
MAX_CONCURRENT=1
MAX_MEMORY_MB=300

# 重启服务
docker-compose restart
```

### 问题: 文件上传失败

**可能原因**:
1. 文件过大（超过10MB）
2. 文件格式不支持
3. 网络超时

**解决方案**:
1. 压缩或分割大文件
2. 确保文件格式为PDF、PNG、JPG或JPEG
3. 检查网络连接

## 安全建议

1. **API密钥保护**: 
   - 不要在代码中硬编码API密钥
   - 使用环境变量或浏览器本地存储
   - 定期轮换API密钥

2. **网络安全**:
   - 生产环境使用HTTPS
   - 配置防火墙规则
   - 使用强密码保护服务器

3. **数据隐私**:
   - 系统不持久化敏感数据
   - 及时清理浏览器缓存
   - 使用私有网络或VPN

4. **访问控制**:
   - 考虑添加身份验证
   - 限制API访问频率
   - 监控异常访问


## 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose build
docker-compose up -d
```

### 查看日志

```bash
# 实时查看日志
docker-compose logs -f

# 查看最近100行日志
docker-compose logs --tail=100

# 查看特定服务日志
docker-compose logs ai-invoice-organizer
```

### 备份和恢复

由于系统不持久化数据，主要需要备份：
1. 配置文件（.env）
2. 自定义修改（如nginx.conf）

```bash
# 备份配置
cp .env .env.backup
cp nginx.conf nginx.conf.backup

# 恢复配置
cp .env.backup .env
cp nginx.conf.backup nginx.conf
```

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue: [GitHub Issues]
- 邮件: [your-email@example.com]

## 致谢

- OpenAI - 提供强大的AI能力
- React团队 - 优秀的前端框架
- Express.js - 简洁的后端框架
- 所有开源贡献者

---

**注意**: 本系统仅用于辅助发票整理工作，请在使用前仔细核对AI识别结果的准确性。
