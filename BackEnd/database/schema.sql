-- Database: PG Antu
-- Connect to PG Antu database before running this script
-- Use: \c "PG Antu" in psql
-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS users CASCADE;
-- Create users table for signup/signin with OAuth support
-- This includes fields for local signup (full name, email, password, terms agreement)
-- and OAuth integration (Gmail/Google, GitHub, LinkedIn) via provider fields.
-- Password is stored hashed (handle hashing in backend with bcryptjs).
-- Confirm password is frontend/backend validation only—not stored.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- Auto-incrementing unique ID
    full_name VARCHAR(255) NOT NULL,
    -- Full name from signup form
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Email address (unique for login/lookup)
    password VARCHAR(255),
    -- Hashed password (NULL for OAuth-only users)
    terms_agreed BOOLEAN DEFAULT FALSE NOT NULL,
    -- Checkbox: Agree to Terms & Privacy Policy
    provider VARCHAR(50) DEFAULT 'local' CHECK (
        provider IN ('local', 'google', 'github', 'linkedin')
    ),
    -- 'local' for email/pass, others for OAuth
    provider_id VARCHAR(255),
    -- Unique ID from OAuth provider (e.g., Google user ID)
    profile_picture VARCHAR(500),
    -- Optional: Avatar URL from OAuth (e.g., GitHub profile pic)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Signup timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Last update timestamp
);
-- Ensure uniqueness for OAuth users (prevents duplicate accounts across providers)
ALTER TABLE users
ADD CONSTRAINT unique_provider_id UNIQUE (provider, provider_id);
-- Indexes for faster queries (email lookups, provider searches)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();