# 部署指南 (Deployment Guide)

本文档提供详细的部署步骤和最佳实践。

## 目录

1. [本地开发环境](#本地开发环境)
2. [Docker部署](#docker部署)
3. [VPS生产环境部署](#vps生产环境部署)
4. [性能调优](#性能调优)
5. [监控和日志](#监控和日志)
6. [故障排除](#故障排除)

## 本地开发环境

### 前置要求

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本
- Git

### 安装步骤

1. **克隆仓库**

```bash
git clone <repository-url>
cd ai-invoice-organizer
```

2. **安装依赖**

```bash
# 根目录依赖（用于并发启动）
npm install

# 前端依赖
cd client
npm install
cd ..

# 后端依赖
cd server
npm install
cd ..
```

3. **配置环境变量**

```bash
cp .env.example .env
```

编辑 `.env` 文件（可选，使用默认值也可以）：

```env
PORT=3000
MAX_MEMORY_MB=500
MAX_CONCURRENT=2
LOG_LEVEL=info
```

4. **启动开发服务器**

```bash
npm run dev
```

这将同时启动：
- 前端: http://localhost:5173 (Vite开发服务器)
- 后端: http://localhost:3000 (Express服务器)

前端会自动代理API请求到后端。

### 开发工作流

```bash
# 仅启动前端
cd client && npm run dev

# 仅启动后端
cd server && npm run dev

# 运行测试
cd server && npm test

# 代码检查
npm run lint

# 构建生产版本
npm run build
```


## Docker部署

### 前置要求

- Docker 20.10.0 或更高版本
- Docker Compose 2.0.0 或更高版本

### 快速部署

```bash
# 克隆项目
git clone <repository-url>
cd ai-invoice-organizer

# 配置环境变量
cp .env.example .env
nano .env  # 根据需要修改

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

应用将在 http://localhost:3000 上运行。

### 使用Nginx反向代理

如果需要使用Nginx作为反向代理（推荐用于生产环境）：

```bash
# 启动应用和Nginx
docker-compose --profile with-nginx up -d

# 查看日志
docker-compose --profile with-nginx logs -f
```

应用将在 http://localhost:80 上运行。

### Docker Compose配置说明

`docker-compose.yml` 文件包含以下配置：

```yaml
services:
  ai-invoice-organizer:
    # 应用服务
    ports:
      - "3000:3000"  # 端口映射
    environment:
      # 环境变量
      - MAX_MEMORY_MB=500
      - MAX_CONCURRENT=2
    deploy:
      resources:
        limits:
          memory: 512M  # 内存限制
```

### 自定义配置

#### 修改端口

编辑 `.env` 文件：

```env
PORT=8080
```

然后修改 `docker-compose.yml`：

```yaml
ports:
  - "8080:3000"
```

#### 调整资源限制

编辑 `docker-compose.yml`：

```yaml
deploy:
  resources:
    limits:
      memory: 1G      # 增加内存限制
      cpus: '2'       # 限制CPU使用
    reservations:
      memory: 512M
```


## VPS生产环境部署

### 服务器要求

**最低配置**:
- CPU: 1核
- 内存: 1GB
- 存储: 10GB
- 操作系统: Ubuntu 20.04+ / CentOS 7+ / Debian 10+

**推荐配置**:
- CPU: 2核
- 内存: 2GB
- 存储: 20GB
- 操作系统: Ubuntu 22.04 LTS

### 完整部署步骤

#### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl git ufw

# 配置防火墙
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

#### 2. 安装Docker

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录以应用组更改
exit
# 重新SSH登录

# 验证安装
docker --version
```

#### 3. 安装Docker Compose

```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

#### 4. 部署应用

```bash
# 克隆项目
cd /opt
sudo git clone <repository-url> ai-invoice-organizer
cd ai-invoice-organizer

# 设置权限
sudo chown -R $USER:$USER .

# 配置环境变量
cp .env.example .env
nano .env
```

编辑 `.env` 文件：

```env
PORT=3000
MAX_MEMORY_MB=500
MAX_CONCURRENT=2
LOG_LEVEL=info
NODE_ENV=production
```

```bash
# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 5. 配置域名和SSL（可选但推荐）

**使用Certbot获取免费SSL证书**:

```bash
# 安装Certbot
sudo apt install -y certbot

# 停止Nginx（如果正在运行）
docker-compose --profile with-nginx down

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 证书将保存在 /etc/letsencrypt/live/your-domain.com/
```

**配置Nginx使用SSL**:

编辑 `nginx.conf`，取消HTTPS部分的注释并更新：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... 其他配置
}
```

更新 `docker-compose.yml` 添加证书卷挂载：

```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

重启服务：

```bash
docker-compose --profile with-nginx up -d
```

#### 6. 设置自动启动

```bash
# 创建systemd服务文件
sudo nano /etc/systemd/system/ai-invoice-organizer.service
```

添加以下内容：

```ini
[Unit]
Description=AI Invoice Organizer
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ai-invoice-organizer
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl enable ai-invoice-organizer
sudo systemctl start ai-invoice-organizer
sudo systemctl status ai-invoice-organizer
```


## 性能调优

### 低配置环境优化

对于1GB内存的VPS：

```env
# .env 配置
MAX_MEMORY_MB=300
MAX_CONCURRENT=1
LOG_LEVEL=warn
```

```yaml
# docker-compose.yml 配置
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '1'
```

### 高性能环境优化

对于4GB+内存的服务器：

```env
# .env 配置
MAX_MEMORY_MB=1000
MAX_CONCURRENT=4
LOG_LEVEL=info
```

```yaml
# docker-compose.yml 配置
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '2'
```

### Nginx性能优化

编辑 `nginx.conf`：

```nginx
# 增加worker进程
worker_processes auto;

# 增加连接数
events {
    worker_connections 2048;
}

http {
    # 启用gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 
                     keys_zone=my_cache:10m max_size=1g 
                     inactive=60m use_temp_path=off;
}
```

### 数据库优化（如果添加持久化）

如果未来添加数据库，建议：

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: invoice_db
      POSTGRES_USER: invoice_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  postgres_data:
```


## 监控和日志

### 查看日志

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f ai-invoice-organizer

# 查看最近100行
docker-compose logs --tail=100

# 查看特定时间范围
docker-compose logs --since 2024-01-01T00:00:00
```

### 日志持久化

修改 `docker-compose.yml`：

```yaml
services:
  ai-invoice-organizer:
    volumes:
      - ./logs:/app/logs
    environment:
      - LOG_FILE=/app/logs/app.log
```

### 监控内存使用

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats ai-invoice-organizer

# 一次性查看
docker stats --no-stream
```

### 健康检查

应用内置健康检查端点：

```bash
# 检查应用健康状态
curl http://localhost:3000/health

# 预期响应
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 设置监控告警

使用简单的脚本监控：

```bash
#!/bin/bash
# monitor.sh

while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
    
    if [ "$response" != "200" ]; then
        echo "$(date): Health check failed with status $response" >> /var/log/ai-invoice-monitor.log
        # 发送告警邮件或通知
    fi
    
    sleep 60
done
```

添加到crontab：

```bash
crontab -e
# 添加
@reboot /path/to/monitor.sh &
```

### 使用第三方监控工具

**Prometheus + Grafana**:

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
```


## 故障排除

### 常见问题

#### 1. 容器无法启动

**症状**: `docker-compose up -d` 后容器立即退出

**诊断**:
```bash
# 查看容器状态
docker-compose ps

# 查看详细日志
docker-compose logs

# 查看容器退出代码
docker inspect ai-invoice-organizer | grep ExitCode
```

**可能原因和解决方案**:

- **端口被占用**:
```bash
# 检查端口占用
sudo lsof -i :3000
# 或
sudo netstat -tulpn | grep 3000

# 杀死占用进程或修改端口
```

- **内存不足**:
```bash
# 检查系统内存
free -h

# 减少内存限制
# 编辑 docker-compose.yml
deploy:
  resources:
    limits:
      memory: 256M
```

- **权限问题**:
```bash
# 修复权限
sudo chown -R $USER:$USER .
```

#### 2. 构建失败

**症状**: `docker-compose build` 失败

**解决方案**:
```bash
# 清理Docker缓存
docker system prune -a

# 重新构建（不使用缓存）
docker-compose build --no-cache

# 检查磁盘空间
df -h
```

#### 3. 应用响应慢

**诊断**:
```bash
# 检查资源使用
docker stats ai-invoice-organizer

# 检查日志中的错误
docker-compose logs | grep ERROR
```

**解决方案**:
- 增加资源限制
- 减少并发处理数
- 检查AI API响应时间
- 优化网络连接

#### 4. AI识别失败

**症状**: 文档上传后识别失败

**诊断**:
```bash
# 查看应用日志
docker-compose logs -f | grep AI

# 测试API连接
curl -X POST http://localhost:3000/api/test-connection \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"your-api-endpoint","apiKey":"your-key","model":"gpt-4o"}'
```

**可能原因**:
- API配置错误
- API密钥无效
- 网络连接问题
- API配额用尽

#### 5. 内存泄漏

**症状**: 内存使用持续增长

**诊断**:
```bash
# 监控内存使用
watch -n 5 'docker stats --no-stream ai-invoice-organizer'
```

**解决方案**:
```bash
# 重启容器
docker-compose restart

# 如果问题持续，检查代码中的内存泄漏
# 启用Node.js内存分析
docker-compose exec ai-invoice-organizer node --inspect=0.0.0.0:9229 dist/index.js
```

### 紧急恢复

#### 快速重启

```bash
# 停止所有服务
docker-compose down

# 清理所有容器和网络
docker-compose down -v

# 重新启动
docker-compose up -d
```

#### 回滚到之前版本

```bash
# 查看Git历史
git log --oneline

# 回滚到特定版本
git checkout <commit-hash>

# 重新构建和部署
docker-compose down
docker-compose build
docker-compose up -d
```

#### 完全重置

```bash
# 停止并删除所有容器
docker-compose down -v

# 删除镜像
docker rmi ai-invoice-organizer

# 清理系统
docker system prune -a

# 重新部署
git pull
docker-compose build
docker-compose up -d
```

### 获取帮助

如果问题仍未解决：

1. 收集诊断信息：
```bash
# 生成诊断报告
docker-compose logs > logs.txt
docker stats --no-stream > stats.txt
docker inspect ai-invoice-organizer > inspect.txt
```

2. 提交Issue到GitHub，附上诊断信息

3. 查看项目文档和FAQ

## 维护计划

### 日常维护

- 每天检查日志和监控
- 每周检查磁盘空间
- 每月更新依赖和安全补丁

### 更新流程

```bash
# 1. 备份当前配置
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup

# 2. 拉取最新代码
git pull

# 3. 检查更新日志
git log --oneline -10

# 4. 重新构建
docker-compose build

# 5. 停止旧版本
docker-compose down

# 6. 启动新版本
docker-compose up -d

# 7. 验证
curl http://localhost:3000/health

# 8. 如果有问题，回滚
git checkout HEAD~1
docker-compose down
docker-compose build
docker-compose up -d
```

### 备份策略

```bash
# 备份配置文件
tar -czf backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml nginx.conf

# 定期备份（添加到crontab）
0 2 * * * cd /opt/ai-invoice-organizer && tar -czf /backup/ai-invoice-$(date +\%Y\%m\%d).tar.gz .env docker-compose.yml nginx.conf
```

---

**注意**: 本部署指南假设您有基本的Linux和Docker知识。如遇到问题，请参考官方文档或寻求技术支持。
