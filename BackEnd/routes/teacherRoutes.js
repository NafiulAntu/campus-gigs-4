const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth required)
// GET /api/teachers/:username - Get teacher profile by username
router.get('/:username', teacherController.getTeacherByUsername);

// GET /api/teachers - Get all teachers (with optional filters)
router.get('/', teacherController.getAllTeachers);

// Protected routes (auth required)
// POST /api/teachers/profile - Create/update own teacher profile
router.post('/profile', authMiddleware, teacherController.createOrUpdateTeacher);

// GET /api/teachers/profile/me - Get own teacher profile
router.get('/profile/me', authMiddleware, teacherController.getMyProfile);

// DELETE /api/teachers/profile - Delete own teacher profile
router.delete('/profile', authMiddleware, teacherController.deleteMyProfile);

module.exports = router;