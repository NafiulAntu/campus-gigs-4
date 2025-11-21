const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (auth required) - MUST come before /:username to avoid conflicts
// POST /api/teachers/profile - Create/update own teacher profile
router.post('/profile', protect, teacherController.createOrUpdateTeacher);

// GET /api/teachers/profile/me - Get own teacher profile
router.get('/profile/me', protect, teacherController.getMyProfile);

// Public routes (no auth required)
// GET /api/teachers - Get all teachers (with optional filters)
router.get('/', teacherController.getAllTeachers);

// GET /api/teachers/:username - Get teacher profile by username
router.get('/:username', teacherController.getTeacherByUsername);

// DELETE /api/teachers/profile - Delete own teacher profile
router.delete('/profile', protect, teacherController.deleteMyProfile);

module.exports = router;