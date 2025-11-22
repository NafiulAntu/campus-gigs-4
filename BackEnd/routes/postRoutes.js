const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes

router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getPosts);
// Add PUT /:id, DELETE /:id, etc.

module.exports = router;