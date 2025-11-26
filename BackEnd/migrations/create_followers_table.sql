-- Create followers table for user follow relationships
CREATE TABLE IF NOT EXISTS followers (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_created ON followers(created_at DESC);
-- Add follower/following count columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts() RETURNS TRIGGER AS $$ BEGIN IF (TG_OP = 'INSERT') THEN -- Increment following count for follower
UPDATE users
SET following_count = following_count + 1
WHERE id = NEW.follower_id;
-- Increment followers count for followed user
UPDATE users
SET followers_count = followers_count + 1
WHERE id = NEW.following_id;
RETURN NEW;
ELSIF (TG_OP = 'DELETE') THEN -- Decrement following count for follower
UPDATE users
SET following_count = following_count - 1
WHERE id = OLD.follower_id;
-- Decrement followers count for followed user
UPDATE users
SET followers_count = followers_count - 1
WHERE id = OLD.following_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to automatically update counts
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON followers;
CREATE TRIGGER trigger_update_follower_counts
AFTER
INSERT
    OR DELETE ON followers FOR EACH ROW EXECUTE FUNCTION update_follower_counts();
-- Initialize follower/following counts for existing users
UPDATE users
SET followers_count = (
        SELECT COUNT(*)
        FROM followers
        WHERE following_id = users.id
    ),
    following_count = (
        SELECT COUNT(*)
        FROM followers
        WHERE follower_id = users.id
    );