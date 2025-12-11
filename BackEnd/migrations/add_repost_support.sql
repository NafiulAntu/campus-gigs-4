-- Add repost support to posts table
-- Run this migration to enable reposts/shares as separate posts

-- Add repost_of column to track which post is being reposted
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS repost_of INTEGER REFERENCES posts(id) ON DELETE CASCADE;

-- Add index for better performance when querying reposts
CREATE INDEX IF NOT EXISTS idx_posts_repost_of ON posts(repost_of);

-- Success message
SELECT 'Repost support added successfully!' AS message;
