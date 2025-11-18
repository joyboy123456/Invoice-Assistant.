import multer from 'multer';
import { Request } from 'express';

// 使用内存存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅支持 PDF、PNG、JPG'));
  }
};

// Multer配置
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 50, // 最多50个文件
  },
});

// 单文件上传
export const uploadSingle = upload.single('file');

// 多文件上传
export const uploadMultiple = upload.array('files', 50);
