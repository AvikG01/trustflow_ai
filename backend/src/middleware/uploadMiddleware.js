const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ALLOWED_FILE_TYPES, FILE_EXTENSIONS } = require('../config/constants');
const responseHandler = require('../utils/responseHandler');

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (FILE_EXTENSIONS.includes(ext) || ALLOWED_FILE_TYPES.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, DOC, and DOCX documents are allowed.'), false);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

function handleUploadSingle(fieldName) {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return responseHandler.error(res, 'File size exceeds maximum 5MB limit', 400, 'FILE_TOO_LARGE');
          }
          return responseHandler.error(res, `Upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
        }
        return responseHandler.error(res, err.message, 400, 'INVALID_FILE_FORMAT');
      }
      next();
    });
  };
}

module.exports = {
  uploadDir,
  handleUploadSingle,
};
