const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * Search Routes
 * Full-text search for posts and jobs
 */

// Public search endpoints (optionalAuth allows search without login)
router.get('/posts', optionalAuth, searchController.searchPosts);
router.get('/jobs', optionalAuth, searchController.getJobPosts);
router.get('/categories', searchController.getPopularCategories);
router.get('/tags', searchController.getPopularTags);
router.get('/suggestions', searchController.getSearchSuggestions);

// Admin endpoints
router.post('/admin/refresh', protect, requireAdmin, searchController.refreshSearchViews);

module.exports = router;
