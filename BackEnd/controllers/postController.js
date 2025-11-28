const Post = require('../models/Post');
const { deleteFromFirebase, isFirebaseEnabled } = require('../config/firebase');
const { notifySup, notifyRepost } = require('../utils/notificationHelpers');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    console.log('📝 Create post request received');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?.id);
    
    const { content, media_urls } = req.body;
    const userId = req.user.id;

    // Allow posts with just media (no text content required)
    const postContent = content && content.trim() !== '' ? content.trim() : '';

    console.log('✅ Creating post with:', { userId, content: postContent, media_urls });
    const post = await Post.create(userId, postContent, media_urls || []);
    console.log('✅ Post created:', post);
    
    // Get the full post with user info
    const fullPost = await Post.getById(post.id);
    console.log('✅ Full post retrieved:', fullPost);

    res.status(201).json({ 
      message: 'Post created successfully', 
      post: fullPost 
    });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const currentUserId = req.user ? req.user.id : null;

    const posts = await Post.getAll(currentUserId, limit, offset);

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get posts by user ID
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await Post.getByUserId(userId, limit, offset);

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.getById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    console.log('✏️ Update post request received');
    console.log('Post ID:', req.params.postId);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?.id);
    
    const { postId } = req.params;
    const { content, media_urls } = req.body;
    const userId = req.user.id;

    // Allow posts with just media (no text content required)
    const postContent = content && content.trim() !== '' ? content.trim() : '';

    console.log('✅ Updating post with:', { postId, userId, content: postContent, media_urls });
    const post = await Post.update(postId, userId, postContent, media_urls || []);

    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    
    // Get the full post with user info
    const fullPost = await Post.getById(postId);
    console.log('✅ Post updated successfully:', fullPost);

    res.status(200).json({ 
      message: 'Post updated successfully', 
      post: fullPost 
    });
  } catch (error) {
    console.error('❌ Error updating post:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update post', details: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Get post before deletion to access media URLs
    const postToDelete = await Post.getById(postId);
    
    if (!postToDelete) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (postToDelete.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    // Delete from database
    const post = await Post.delete(postId, userId);

    if (!post) {
      return res.status(404).json({ error: 'Failed to delete post' });
    }

    // Delete media files from Firebase Storage (if enabled)
    if (isFirebaseEnabled() && postToDelete.media_urls && postToDelete.media_urls.length > 0) {
      console.log('🗑️ Deleting media files from Firebase Storage...');
      for (const url of postToDelete.media_urls) {
        try {
          await deleteFromFirebase(url);
        } catch (deleteError) {
          console.error('Failed to delete media file:', deleteError.message);
          // Continue with post deletion even if media deletion fails
        }
      }
    }

    res.status(200).json({ 
      message: 'Post deleted successfully',
      postId: post.id
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const result = await Post.toggleLike(postId, userId);
    
    // Get updated post
    const post = await Post.getById(postId);

    // Send notification if post was liked (not unliked)
    if (result.liked && post.user_id !== userId) {
      const io = req.app.get('io');
      await notifySup(post.user_id, userId, req.user.username || req.user.fullname, postId, io);
      console.log('✅ Like notification sent to user:', post.user_id);
    }

    res.status(200).json({ 
      message: result.liked ? 'Post liked' : 'Post unliked',
      liked: result.liked,
      likesCount: post.likes_count
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Share/Unshare a post
exports.toggleShare = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const result = await Post.toggleShare(postId, userId);
    
    // Get updated post
    const post = await Post.getById(postId);

    // Send notification if post was shared (not unshared)
    if (result.shared && post.user_id !== userId) {
      const io = req.app.get('io');
      await notifyRepost(post.user_id, userId, req.user.username || req.user.fullname, postId, io);
      console.log('✅ Share notification sent to user:', post.user_id);
    }

    res.status(200).json({ 
      message: result.shared ? 'Post shared' : 'Post unshared',
      shared: result.shared,
      sharesCount: post.shares_count
    });
  } catch (error) {
    console.error('Error toggling share:', error);
    res.status(500).json({ error: 'Failed to toggle share' });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const newComment = await Post.addComment(postId, userId, comment);

    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Post.getComments(postId);

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};