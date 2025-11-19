-- ================================================================
-- COMPLETE SETUP FOR USER SIGNUP/SIGNIN DATABASE
-- Database: PG Antu
-- Purpose: Store all user information from signup form
-- ================================================================
-- STEP 1: Ensure you're connected to "PG Antu" database
-- In pgAdmin: Right-click "PG Antu" -> Query Tool
-- Or in psql: \c "PG Antu"
-- STEP 2: Drop existing table if any (clean slate)
DROP TABLE IF EXISTS users CASCADE;
-- STEP 3: Create users table with ALL signup form fields
CREATE TABLE users (
    -- Auto-incrementing ID (primary key)
    id SERIAL PRIMARY KEY,
    -- User Information from Signup Form
    full_name VARCHAR(255) NOT NULL,
    -- Full Name field
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Email field (must be unique)
    password VARCHAR(255) NOT NULL,
    -- Password field (will be hashed)
    -- Timestamps (automatic)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Constraints
    CONSTRAINT email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    )
);
-- STEP 4: Create index for faster email lookups during signin
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_id ON users(id);
-- STEP 5: Create function to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- STEP 6: Create trigger to call the update function
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- STEP 7: Create a view for safe user data (without password)
CREATE OR REPLACE VIEW users_safe AS
SELECT id,
    full_name,
    email,
    created_at,
    updated_at
FROM users;
-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Check table structure
SELECT column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
-- Check indexes
SELECT indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users';
-- Check triggers
SELECT trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users';
-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
SELECT '✓ Users table created successfully!' AS status,
    '✓ Table ready to store signup data' AS message,
    '✓ Email uniqueness enforced' AS constraint_1,
    '✓ Password will be hashed by backend' AS security,
    '✓ Automatic timestamps enabled' AS feature;
-- ================================================================
-- TEST DATA (Optional - for testing only)
-- ================================================================
-- Uncomment below to insert test user (password is "test123" hashed with bcrypt)
/*
 INSERT INTO users (full_name, email, password) VALUES
 ('Test User', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYNvSg3qRwi');
 
 SELECT 'Test user inserted!' AS test_status;
 SELECT * FROM users_safe;
 */
-- ================================================================
-- USAGE NOTES
-- ================================================================
-- When user clicks "Create Account":
-- 1. Frontend sends: full_name, email, password, confirm_password
-- 2. Backend validates: passwords match, email format, terms agreed
-- 3. Backend hashes password using bcrypt (12 salt rounds)
-- 4. Backend inserts: full_name, email, hashed_password into users table
-- 5. Backend returns: JWT token + user info (without password)
-- 6. User redirected to signin page
-- When user signs in:
-- 1. Frontend sends: email, password
-- 2. Backend finds user by email
-- 3. Backend compares password with bcrypt.compare()
-- 4. Backend returns: JWT token + user info
-- 5. User redirected to /post page
-- ================================================================