const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/users', userController.getAllUsers);           // GET /api/users
router.get('/users/search', protect, userController.searchUsers);    // GET /api/users/search?q=query
router.get('/users/firebase/:firebaseUid', protect, userController.getUserByFirebaseUid); // GET /api/users/firebase/:firebaseUid

// Get current user (must come before /:id route)
router.get('/users/me', protect, userController.getCurrentUser);     // GET /api/users/me

// Follow system routes (protected)
router.post('/users/:id/follow', protect, userController.followUser);          // POST /api/users/:id/follow
router.delete('/users/:id/follow', protect, userController.unfollowUser);       // DELETE /api/users/:id/follow
router.get('/users/:id/follow/status', protect, userController.checkFollowStatus); // GET /api/users/:id/follow/status
router.get('/users/:id/followers', protect, userController.getFollowers);       // GET /api/users/:id/followers
router.get('/users/:id/following', protect, userController.getFollowing);       // GET /api/users/:id/following
router.get('/users/:id/follow/counts', protect, userController.getFollowCounts); // GET /api/users/:id/follow/counts

// Protected routes (require JWT token)
router.get('/users/:id', protect, userController.getUserById);       // GET /api/users/:id
router.post('/users', protect, userController.createUser);           // POST /api/users
router.put('/users/:id', protect, userController.updateUser);        // PUT /api/users/:id
router.delete('/users/:id', protect, userController.deleteUser);     // DELETE /api/users/:id

module.exports = router;
