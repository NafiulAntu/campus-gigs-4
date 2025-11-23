const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and common file types
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip|rar|ppt|pptx|xls|xlsx|csv|odt|rtf)$/i;
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/rtf',
    'application/octet-stream' // Some systems send .txt files with this MIME type
  ];
  
  const hasValidExtension = allowedExtensions.test(file.originalname.toLowerCase());
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
  
  console.log('📎 File validation:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    hasValidExtension,
    hasValidMimeType
  });
  
  if (hasValidExtension || hasValidMimeType) {
    return cb(null, true);
  } else {
    cb(new Error(`File type not allowed! File: ${file.originalname}, MIME: ${file.mimetype}. Supported formats: JPEG, PNG, GIF, WEBP, PDF, DOC, DOCX, TXT, ODT, RTF, ZIP, RAR, PPT, PPTX, XLS, XLSX, CSV`));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Upload single or multiple files
router.post('/', protect, (req, res) => {
  const uploadHandler = upload.array('files', 10);
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      console.log(`✅ Uploaded ${req.files.length} file(s):`);
      req.files.forEach(file => {
        console.log(`  - ${file.filename} (${file.mimetype})`);
      });

      // Return file URLs
      const fileUrls = req.files.map(file => {
        return `http://localhost:3000/uploads/posts/${file.filename}`;
      });

      res.status(200).json({
        message: 'Files uploaded successfully',
        files: fileUrls
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ error: 'File upload failed' });
    }
  });
});

module.exports = router;
