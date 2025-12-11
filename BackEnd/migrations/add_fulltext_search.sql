-- ============================================
-- PostgreSQL Full-Text Search for Posts
-- Enables job/post search functionality
-- ============================================

-- 1. Add search vector column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Add job-related columns for better filtering
ALTER TABLE posts ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS job_type VARCHAR(50); -- 'full-time', 'part-time', 'internship', 'freelance'
ALTER TABLE posts ADD COLUMN IF NOT EXISTS job_category VARCHAR(100); -- 'frontend', 'backend', 'design', 'marketing'
ALTER TABLE posts ADD COLUMN IF NOT EXISTS job_location VARCHAR(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS job_salary_range VARCHAR(100);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_job_post BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of tags like ['react', 'javascript', 'remote']

-- 3. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING GIN(search_vector);

-- 4. Create indexes for job filtering
CREATE INDEX IF NOT EXISTS idx_posts_job_category ON posts(job_category) WHERE is_job_post = true;
CREATE INDEX IF NOT EXISTS idx_posts_job_type ON posts(job_type) WHERE is_job_post = true;
CREATE INDEX IF NOT EXISTS idx_posts_job_location ON posts(job_location) WHERE is_job_post = true;
CREATE INDEX IF NOT EXISTS idx_posts_is_job ON posts(is_job_post);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- 5. Create function to automatically update search vector
CREATE OR REPLACE FUNCTION posts_search_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Build search vector from multiple columns with different weights
  -- A = highest weight (job_title, job_category)
  -- B = high weight (content, tags)
  -- C = medium weight (job_location)
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.job_title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.job_category, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.job_location, '')), 'C');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-update search vector on insert/update
DROP TRIGGER IF EXISTS posts_search_vector_update ON posts;

CREATE TRIGGER posts_search_vector_update
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION posts_search_trigger_function();

-- 7. Update existing posts with search vectors
UPDATE posts 
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(job_title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(job_category, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(job_location, '')), 'C')
WHERE search_vector IS NULL;

-- 8. Create view for job posts
CREATE OR REPLACE VIEW job_posts AS
SELECT 
  p.*,
  u.full_name,
  u.username,
  u.profile_picture,
  u.email,
  ts_rank(p.search_vector, plainto_tsquery('english', '')) as rank
FROM posts p
JOIN users u ON p.posted_by = u.id
WHERE p.is_job_post = true
ORDER BY p.created_at DESC;

-- 9. Create materialized view for popular job categories (for autocomplete)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_job_categories AS
SELECT 
  job_category,
  COUNT(*) as post_count
FROM posts
WHERE is_job_post = true AND job_category IS NOT NULL
GROUP BY job_category
ORDER BY post_count DESC
LIMIT 50;

CREATE INDEX IF NOT EXISTS idx_popular_categories ON popular_job_categories(job_category);

-- 10. Create materialized view for popular tags (for autocomplete)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_tags AS
SELECT 
  unnest(tags) as tag,
  COUNT(*) as usage_count
FROM posts
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 100;

CREATE INDEX IF NOT EXISTS idx_popular_tags ON popular_tags(tag);

-- 11. Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_search_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_job_categories;
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_tags;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function for advanced search with ranking
CREATE OR REPLACE FUNCTION search_posts(
  search_query TEXT,
  category_filter VARCHAR DEFAULT NULL,
  location_filter VARCHAR DEFAULT NULL,
  job_type_filter VARCHAR DEFAULT NULL,
  is_job_only BOOLEAN DEFAULT false,
  limit_results INTEGER DEFAULT 50,
  offset_results INTEGER DEFAULT 0
)
RETURNS TABLE(
  id INTEGER,
  posted_by INTEGER,
  content TEXT,
  job_title VARCHAR,
  job_category VARCHAR,
  job_type VARCHAR,
  job_location VARCHAR,
  job_salary_range VARCHAR,
  tags TEXT[],
  media_urls TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  created_at TIMESTAMP,
  full_name TEXT,
  username VARCHAR,
  profile_picture TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.posted_by,
    p.content,
    p.job_title,
    p.job_category,
    p.job_type,
    p.job_location,
    p.job_salary_range,
    p.tags,
    p.media_urls,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.created_at,
    u.full_name,
    u.username,
    u.profile_picture,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM posts p
  JOIN users u ON p.posted_by = u.id
  WHERE 
    (search_query = '' OR p.search_vector @@ plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR p.job_category ILIKE '%' || category_filter || '%')
    AND (location_filter IS NULL OR p.job_location ILIKE '%' || location_filter || '%')
    AND (job_type_filter IS NULL OR p.job_type = job_type_filter)
    AND (NOT is_job_only OR p.is_job_post = true)
  ORDER BY 
    CASE WHEN search_query = '' THEN 0 ELSE ts_rank(p.search_vector, plainto_tsquery('english', search_query)) END DESC,
    p.created_at DESC
  LIMIT limit_results
  OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- 13. Add comments
COMMENT ON COLUMN posts.search_vector IS 'Full-text search vector for efficient job/post searching';
COMMENT ON COLUMN posts.job_title IS 'Job title for job posts (e.g., Frontend Developer)';
COMMENT ON COLUMN posts.job_category IS 'Job category (frontend, backend, design, marketing, etc.)';
COMMENT ON COLUMN posts.job_type IS 'Job type: full-time, part-time, internship, freelance';
COMMENT ON COLUMN posts.job_location IS 'Job location (remote, city name, etc.)';
COMMENT ON COLUMN posts.is_job_post IS 'Flag to identify job/opportunity posts';
COMMENT ON COLUMN posts.tags IS 'Array of searchable tags (skills, technologies, keywords)';

-- ============================================
-- Full-Text Search System Complete!
-- ============================================

SELECT 
  'PostgreSQL Full-Text Search created successfully!' as status,
  (SELECT COUNT(*) FROM posts WHERE search_vector IS NOT NULL) as indexed_posts,
  (SELECT COUNT(*) FROM posts WHERE is_job_post = true) as job_posts;
