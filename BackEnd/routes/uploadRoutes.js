const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadToFirebase, isFirebaseEnabled } = require('../config/firebase');
const path = require('path');
const fs = require('fs');

// Fallback: Local storage if Firebase fails
const uploadsDir = path.join(__dirname, '..', 'uploads', 'posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to store files in memory for Firebase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and common file types
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip|rar|ppt|pptx|xls|xlsx|csv|odt|rtf|mp4|mov|avi|webm)$/i;
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
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
    'application/octet-stream'
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
    cb(new Error(`File type not allowed! File: ${file.originalname}, MIME: ${file.mimetype}`));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: fileFilter
});

// Upload single or multiple files
router.post('/', protect, (req, res) => {
  const uploadHandler = upload.array('files', 10);
  
  uploadHandler(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 50MB limit' });
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

      console.log(`📤 Uploading ${req.files.length} file(s)...`);

      const fileUrls = [];

      // Upload to Firebase Storage
      if (isFirebaseEnabled()) {
        console.log('🔥 Using Firebase Storage');
        
        for (const file of req.files) {
          try {
            const firebaseUrl = await uploadToFirebase(
              file.buffer,
              file.originalname,
              file.mimetype
            );
            fileUrls.push(firebaseUrl);
            console.log(`  ✅ ${file.originalname} → Firebase`);
          } catch (uploadError) {
            console.error(`  ❌ Failed to upload ${file.originalname}:`, uploadError.message);
            throw uploadError;
          }
        }
      } else {
        // Fallback to local storage
        console.log('💾 Using local storage (Firebase not configured)');
        
        for (const file of req.files) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const filename = 'post-' + uniqueSuffix + path.extname(file.originalname);
          const filepath = path.join(uploadsDir, filename);
          
          fs.writeFileSync(filepath, file.buffer);
          fileUrls.push(`http://localhost:5000/uploads/posts/${filename}`);
          console.log(`  ✅ ${file.originalname} → Local`);
        }
      }

      res.status(200).json({
        message: 'Files uploaded successfully',
        files: fileUrls,
        storage: isFirebaseEnabled() ? 'firebase' : 'local'
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ error: 'File upload failed: ' + error.message });
    }
  });
});

module.exports = router;
