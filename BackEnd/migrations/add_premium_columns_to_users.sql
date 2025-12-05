-- =====================================================
-- Add Premium Columns to Users Table
-- =====================================================
-- Adds is_premium and premium_expires_at columns for subscription tracking
-- =====================================================

-- Add is_premium column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Add premium_expires_at column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;

-- Add index for premium users lookup
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_premium_expires ON users(premium_expires_at);

-- Update existing users with active subscriptions
UPDATE users u
SET is_premium = TRUE,
    premium_expires_at = s.end_date
FROM subscriptions s
WHERE u.id = s.user_id 
  AND s.status = 'active' 
  AND s.end_date > NOW()
  AND u.is_premium IS NOT TRUE;

COMMENT ON COLUMN users.is_premium IS 'Indicates if the user has an active premium subscription';
COMMENT ON COLUMN users.premium_expires_at IS 'The date and time when the premium subscription expires';

-- Done
SELECT 'Premium columns added successfully to users table' AS status;
