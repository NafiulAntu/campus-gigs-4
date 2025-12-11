const express = require('express');
const router = express.Router();
const multer = require('multer');
const verificationController = require('../controllers/verificationController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Configure multer for file uploads (memory storage for processing)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// User routes (requires authentication)
router.post(
  '/submit',
  protect,
  upload.fields([
    { name: 'id_card_front', maxCount: 1 },
    { name: 'id_card_back', maxCount: 1 }
  ]),
  verificationController.submitVerification
);

router.get('/status', protect, verificationController.getVerificationStatus);
router.get('/:id', protect, verificationController.getVerificationById);

// Admin routes (requires admin role)
router.get('/admin/pending', protect, requireAdmin, verificationController.getPendingVerifications);
router.get('/admin/stats', protect, requireAdmin, verificationController.getVerificationStats);
router.get('/admin/by-status/:status', protect, requireAdmin, verificationController.getVerificationsByStatus);
router.post('/admin/approve/:id', protect, requireAdmin, verificationController.approveVerification);
router.post('/admin/reject/:id', protect, requireAdmin, verificationController.rejectVerification);

module.exports = router;
