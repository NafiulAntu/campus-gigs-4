const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (auth required) - MUST come before /:username to avoid conflicts
// POST /api/employees/profile - Create/update own employee profile
router.post('/profile', protect, employeeController.createOrUpdateEmployee);

// GET /api/employees/profile/me - Get own employee profile
router.get('/profile/me', protect, employeeController.getMyProfile);

// DELETE /api/employees/profile - Delete own employee profile
router.delete('/profile', protect, employeeController.deleteMyProfile);

// Public routes (no auth required)
// GET /api/employees/:username - Get employee profile by username
router.get('/:username', employeeController.getEmployeeByUsername);

module.exports = router;