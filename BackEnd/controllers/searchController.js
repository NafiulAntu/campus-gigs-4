const pool = require('../config/db');

/**
 * Search Controller
 * Handles full-text search for posts and jobs
 */

/**
 * Search posts with full-text search
 * GET /api/search/posts?q=frontend&category=development&location=remote
 */
exports.searchPosts = async (req, res) => {
  try {
    const {
      q = '',           // Search query
      category,         // Job category filter
      location,         // Location filter
      type,             // Job type filter (full-time, part-time, etc.)
      jobs_only = 'false', // Only show job posts
      limit = 50,
      offset = 0
    } = req.query;

    const userId = req.user?.id;

    console.log('🔍 Search request:', { q, category, location, type, jobs_only });

    // Use the advanced search function
    const query = `
      SELECT * FROM search_posts(
        $1::TEXT,           -- search_query
        $2::VARCHAR,        -- category_filter
        $3::VARCHAR,        -- location_filter
        $4::VARCHAR,        -- job_type_filter
        $5::BOOLEAN,        -- is_job_only
        $6::INTEGER,        -- limit_results
        $7::INTEGER         -- offset_results
      )
    `;

    const values = [
      q || '',
      category || null,
      location || null,
      type || null,
      jobs_only === 'true',
      parseInt(limit),
      parseInt(offset)
    ];

    const result = await pool.query(query, values);

    // Add user interaction flags if user is authenticated
    if (userId) {
      const postIds = result.rows.map(p => p.id);
      
      if (postIds.length > 0) {
        const likesQuery = `
          SELECT post_id 
          FROM post_likes 
          WHERE user_id = $1 AND post_id = ANY($2)
        `;
        const sharesQuery = `
          SELECT post_id 
          FROM post_shares 
          WHERE user_id = $1 AND post_id = ANY($2)
        `;

        const [likesResult, sharesResult] = await Promise.all([
          pool.query(likesQuery, [userId, postIds]),
          pool.query(sharesQuery, [userId, postIds])
        ]);

        const likedPostIds = new Set(likesResult.rows.map(r => r.post_id));
        const sharedPostIds = new Set(sharesResult.rows.map(r => r.post_id));

        result.rows.forEach(post => {
          post.user_liked = likedPostIds.has(post.id);
          post.user_shared = sharedPostIds.has(post.id);
        });
      }
    }

    console.log(`✅ Found ${result.rows.length} results for: "${q}"`);

    res.json({
      success: true,
      count: result.rows.length,
      query: q,
      filters: { category, location, type, jobs_only },
      posts: result.rows
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Get popular job categories (for autocomplete/suggestions)
 * GET /api/search/categories
 */
exports.getPopularCategories = async (req, res) => {
  try {
    const query = `
      SELECT job_category, post_count 
      FROM popular_job_categories
      ORDER BY post_count DESC
      LIMIT 20
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      categories: result.rows
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

/**
 * Get popular tags (for autocomplete/suggestions)
 * GET /api/search/tags
 */
exports.getPopularTags = async (req, res) => {
  try {
    const query = `
      SELECT tag, usage_count 
      FROM popular_tags
      ORDER BY usage_count DESC
      LIMIT 50
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      tags: result.rows
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tags',
      error: error.message
    });
  }
};

/**
 * Search suggestions (autocomplete)
 * GET /api/search/suggestions?q=fron
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q = '' } = req.query;

    if (q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    // Search in job titles, categories, and tags
    const query = `
      SELECT DISTINCT ON (suggestion) suggestion, type, count
      FROM (
        -- Job titles
        SELECT 
          job_title as suggestion,
          'title' as type,
          COUNT(*) as count
        FROM posts
        WHERE job_title ILIKE $1 AND is_job_post = true
        GROUP BY job_title
        
        UNION ALL
        
        -- Categories
        SELECT 
          job_category as suggestion,
          'category' as type,
          COUNT(*) as count
        FROM posts
        WHERE job_category ILIKE $1 AND is_job_post = true
        GROUP BY job_category
        
        UNION ALL
        
        -- Tags
        SELECT 
          unnest(tags) as suggestion,
          'tag' as type,
          COUNT(*) as count
        FROM posts
        WHERE tags && ARRAY(SELECT unnest(tags) FROM posts WHERE unnest(tags) ILIKE $1)
        GROUP BY suggestion
      ) suggestions
      ORDER BY suggestion, count DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [`%${q}%`]);

    res.json({
      success: true,
      suggestions: result.rows
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

/**
 * Get job posts only
 * GET /api/search/jobs
 */
exports.getJobPosts = async (req, res) => {
  try {
    const {
      category,
      location,
      type,
      limit = 50,
      offset = 0
    } = req.query;

    const userId = req.user?.id;

    const query = `
      SELECT 
        p.*,
        u.full_name,
        u.username,
        u.profile_picture,
        u.email,
        COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = $1), 0) > 0 as user_liked,
        COALESCE((SELECT COUNT(*) FROM post_shares WHERE post_id = p.id AND user_id = $1), 0) > 0 as user_shared
      FROM posts p
      JOIN users u ON p.posted_by = u.id
      WHERE p.is_job_post = true
        AND ($2::VARCHAR IS NULL OR p.job_category ILIKE '%' || $2 || '%')
        AND ($3::VARCHAR IS NULL OR p.job_location ILIKE '%' || $3 || '%')
        AND ($4::VARCHAR IS NULL OR p.job_type = $4)
      ORDER BY p.created_at DESC
      LIMIT $5 OFFSET $6
    `;

    const values = [
      userId || null,
      category || null,
      location || null,
      type || null,
      parseInt(limit),
      parseInt(offset)
    ];

    const result = await pool.query(query, values);

    console.log(`✅ Found ${result.rows.length} job posts`);

    res.json({
      success: true,
      count: result.rows.length,
      filters: { category, location, type },
      jobs: result.rows
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job posts',
      error: error.message
    });
  }
};

/**
 * Refresh search materialized views (admin only)
 * POST /api/search/admin/refresh
 */
exports.refreshSearchViews = async (req, res) => {
  try {
    await pool.query('SELECT refresh_search_materialized_views()');

    console.log('✅ Search views refreshed');

    res.json({
      success: true,
      message: 'Search views refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh views error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh views',
      error: error.message
    });
  }
};

module.exports = exports;
