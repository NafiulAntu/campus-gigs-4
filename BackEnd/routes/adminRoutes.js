const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Check admin status (for frontend)
router.get('/check-status', adminController.checkAdminStatus);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.get('/users/:userId/posts', adminController.getUserPosts);
router.post('/users/:userId/approve', adminController.approveUser);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
