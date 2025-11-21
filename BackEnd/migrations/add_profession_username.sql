-- Add profession and username columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profession VARCHAR(50),
    ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);
-- Add comment
COMMENT ON COLUMN users.profession IS 'User profession: Student, Teacher, or Employee';
COMMENT ON COLUMN users.username IS 'Unique username for the user profile';