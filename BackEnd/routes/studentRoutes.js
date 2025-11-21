const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (auth required) - MUST come before /:username to avoid conflicts
// POST /api/students/profile - Create/update own student profile
router.post('/profile', protect, studentController.createOrUpdateStudent);

// GET /api/students/profile/me - Get own student profile
router.get('/profile/me', protect, studentController.getMyProfile);

// DELETE /api/students/profile - Delete own student profile
router.delete('/profile', protect, studentController.deleteMyProfile);

// Public routes (no auth required)
// GET /api/students/:username - Get student profile by username
router.get('/:username', studentController.getStudentByUsername);

module.exports = router;