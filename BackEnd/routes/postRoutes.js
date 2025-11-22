const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// Post CRUD routes
router.post('/', authMiddleware, postController.createPost);
router.get('/', authMiddleware, postController.getAllPosts);
router.get('/user/:userId', authMiddleware, postController.getUserPosts);
router.get('/:postId', authMiddleware, postController.getPostById);
router.put('/:postId', authMiddleware, postController.updatePost);
router.delete('/:postId', authMiddleware, postController.deletePost);

// Post interaction routes
router.post('/:postId/like', authMiddleware, postController.toggleLike);
router.post('/:postId/share', authMiddleware, postController.toggleShare);
router.post('/:postId/comment', authMiddleware, postController.addComment);
router.get('/:postId/comments', authMiddleware, postController.getComments);

module.exports = router;