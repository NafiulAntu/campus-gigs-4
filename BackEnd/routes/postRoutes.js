const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Post CRUD routes
router.post('/', protect, postController.createPost);
router.get('/', protect, postController.getAllPosts);
router.get('/user/:userId', protect, postController.getUserPosts);

// Post interaction routes (specific routes before generic :postId)
router.post('/:postId/like', protect, postController.toggleLike);
router.post('/:postId/share', protect, postController.toggleShare);
router.post('/:postId/accept', protect, postController.acceptPost);
router.post('/:postId/reject', protect, postController.rejectPost);
router.post('/:postId/comment', protect, postController.addComment);
router.get('/:postId/comments', protect, postController.getComments);

// Generic post routes (must be last)
router.get('/:postId', protect, postController.getPostById);
router.put('/:postId', protect, postController.updatePost);
router.delete('/:postId', protect, postController.deletePost);

module.exports = router;