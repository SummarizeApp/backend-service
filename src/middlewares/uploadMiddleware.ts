import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Multer konfigürasyonu
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    logger.info('Received file:', {
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyaları kabul edilmektedir'));
    }
  },
});

// Multer hata yönetimi middleware'i
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu 10MB\'dan büyük olamaz'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası'
    });
  } else if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export default upload;