import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

    return {
      folder: 'online-classroom-materials',
      resource_type: 'auto', // Hỗ trợ đầy đủ file tài liệu (pdf, docx, zip...) và ảnh
      public_id: `${file.fieldname}-${Date.now()}-${originalName}`,
      format: ext || undefined,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|zip|rar|png|jpg|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ hỗ trợ định dạng: PDF, DOC, DOCX, ZIP, RAR, PNG, JPG'));
  }
};

export { cloudinary };

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
  fileFilter,
});