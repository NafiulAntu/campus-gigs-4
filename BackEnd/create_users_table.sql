-- ============================================
-- CREATE USERS TABLE FOR SIGNIN/SIGNUP
-- Database: PG Antu
-- ============================================
-- Step 1: Create database (if not exists)
-- Uncomment if you need to create the database first:
-- CREATE DATABASE "PG Antu";
-- Step 2: Connect to PG Antu database
-- Run this in pgAdmin or psql: \c "PG Antu"
-- Step 3: Drop existing users table (if any)
DROP TABLE IF EXISTS users CASCADE;
-- Step 4: Create users table with all signup form fields
CREATE TABLE users (
    -- Primary key
    id SERIAL PRIMARY KEY,
    -- Signup form fields
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Step 5: Create index on email for faster signin/lookup
CREATE INDEX idx_users_email ON users(email);
-- Step 6: Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Step 7: Verify table creation
SELECT 'Users table created successfully!' AS status;
-- View table structure
\ d users -- View all tables in database
\ dt -- ============================================
-- TABLE STRUCTURE EXPLANATION
-- ============================================
-- id: Auto-incrementing unique identifier for each user
-- full_name: User's full name from signup form
-- email: Unique email address for signin (cannot duplicate)
-- password: Hashed password (bcrypt with 12 salt rounds)
-- created_at: When account was created
-- updated_at: When account was last modified (auto-updates)
-- ============================================
-- SAMPLE QUERY TO VIEW USERS
-- ============================================
-- SELECT id, full_name, email, created_at FROM users;