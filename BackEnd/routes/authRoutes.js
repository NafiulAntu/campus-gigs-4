const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected route - Get current user profile
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

module.exports = router;