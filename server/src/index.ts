import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter, { errorHandler } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS配置 - 允许前端访问
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体大小限制（50MB）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Invoice Organizer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api', apiRouter);

// 生产环境：提供静态文件
if (isProduction) {
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));
  
  // SPA fallback - 所有非API路由返回index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NotFound',
      message: `路由不存在: ${req.method} ${req.path}`
    }
  });
});

// 全局错误处理中间件
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
});

export default app;
