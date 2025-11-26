const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/users', userController.getAllUsers);           // GET /api/users
router.get('/users/search', protect, userController.searchUsers);    // GET /api/users/search?q=query
router.get('/users/firebase/:firebaseUid', protect, userController.getUserByFirebaseUid); // GET /api/users/firebase/:firebaseUid

// Protected routes (require JWT token)
router.get('/users/:id', protect, userController.getUserById);       // GET /api/users/:id
router.post('/users', protect, userController.createUser);           // POST /api/users
router.put('/users/:id', protect, userController.updateUser);        // PUT /api/users/:id
router.delete('/users/:id', protect, userController.deleteUser);     // DELETE /api/users/:id

module.exports = router;
