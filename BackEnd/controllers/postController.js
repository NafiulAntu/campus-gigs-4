const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'), false);
}});

exports.createPost = [upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id; // From auth middleware
    const post = await Post.create({ content, userId, imageUrl: req.file ? `/uploads/${req.file.filename}` : null });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}];

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({ include: User });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add updatePost, deletePost, etc., similarly