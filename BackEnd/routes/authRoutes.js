const express = require('express');
const router = express.Router();
const { signup, signin, forgotPassword, resetPassword, oauthCallback, deleteAccount, firebaseSync } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('../config/passport');

// Public authentication routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.delete('/delete-account', protect, deleteAccount);
router.post('/firebase-sync', protect, firebaseSync);

// OAuth routes - Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// OAuth routes - GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// OAuth routes - LinkedIn
router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// Protected route - Get current user profile
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

module.exports = router;