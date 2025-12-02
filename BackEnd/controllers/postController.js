const Post = require('../models/Post');
const { deleteFromFirebase, isFirebaseEnabled } = require('../config/firebase');
const { notifySup, notifyRepost, notifyComment } = require('../utils/simpleNotificationHelpers');

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

    console.log(`👍 toggleLike: postId=${postId}, userId=${userId}`);

    const result = await Post.toggleLike(postId, userId);
    
    // Get updated post
    const post = await Post.getById(postId);

    console.log(`📊 Post info: posted_by=${post.posted_by}, liked=${result.liked}, isOwnPost=${post.posted_by === userId}`);

    // Send notification if post was liked (not unliked) and not own post
    if (result.liked && post.posted_by !== userId) {
      try {
        const io = req.app.get('io');
        const userName = req.user.full_name || req.user.username || 'Someone';
        console.log(`🔔 Sending like notification: from userId=${userId} (${userName}) to userId=${post.posted_by}`);
        await notifySup(post.posted_by, userId, userName, postId, io);
        console.log('✅ Like notification sent successfully');
      } catch (notifError) {
        console.error('⚠️ Failed to send like notification:', notifError.message);
        // Don't fail the request if notification fails
      }
    } else {
      console.log('⏩ Skipping notification: liked=', result.liked, 'isOwnPost=', post.posted_by === userId);
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

// Share/Unshare a post (Create a repost)
exports.toggleShare = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content } = req.body; // Optional repost comment

    console.log(`🔄 toggleShare: postId=${postId}, userId=${userId}, content=${content}`);

    // Check if user already shared this post
    const existingShare = await Post.getUserShare(postId, userId);
    
    if (existingShare) {
      // Unshare - delete the repost
      await Post.deleteRepost(existingShare.id);
      const post = await Post.getById(postId);
      
      res.status(200).json({ 
        message: 'Post unshared',
        shared: false,
        sharesCount: post.shares_count
      });
    } else {
      // Share - create a new repost
      const repostContent = content?.trim() || '';
      const repost = await Post.createRepost(userId, postId, repostContent);
      
      // Get the original post for notification
      const originalPost = await Post.getById(postId);
      
      // Send notification if not own post
      if (originalPost.posted_by !== userId) {
        try {
          const io = req.app.get('io');
          const userName = req.user.full_name || req.user.username || 'Someone';
          console.log(`🔔 Sending share notification: from userId=${userId} (${userName}) to userId=${originalPost.posted_by}`);
          await notifyRepost(originalPost.posted_by, userId, userName, postId, io);
          console.log('✅ Share notification sent successfully');
        } catch (notifError) {
          console.error('⚠️ Failed to send share notification:', notifError.message);
        }
      }
      
      res.status(200).json({ 
        message: 'Post shared',
        shared: true,
        sharesCount: originalPost.shares_count + 1,
        repost: repost
      });
    }
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

    console.log(`💬 addComment: postId=${postId}, userId=${userId}`);

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const newComment = await Post.addComment(postId, userId, comment);
    
    // Get post to check ownership
    const post = await Post.getById(postId);

    console.log(`📊 Post info: posted_by=${post.posted_by}, isOwnPost=${post.posted_by === userId}`);

    // Send notification if not own post
    if (post.posted_by !== userId) {
      try {
        const io = req.app.get('io');
        const userName = req.user.full_name || req.user.username || 'Someone';
        console.log(`🔔 Sending comment notification: from userId=${userId} (${userName}) to userId=${post.posted_by}`);
        await notifyComment(post.posted_by, userId, userName, postId, comment, io);
        console.log('✅ Comment notification sent successfully');
      } catch (notifError) {
        console.error('⚠️ Failed to send comment notification:', notifError.message);
        // Don't fail the request if notification fails
      }
    } else {
      console.log('⏩ Skipping notification: user commented on own post');
    }

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