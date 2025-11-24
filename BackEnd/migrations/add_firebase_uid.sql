-- Add firebase_uid column to users table
-- This migration adds support for Firebase Authentication
-- Add the firebase_uid column (nullable for existing users)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;
-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
-- Add a comment to document the column
COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID for syncing with Firebase Auth';
-- Update provider column type if needed (ensure it can hold 'firebase' value)
-- Provider values: 'local', 'google', 'github', 'linkedin', 'firebase'
-- Display current schema
SELECT column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;