-- ============================================
-- Campus Gigs - Database Setup Script
-- Database: PG Antu
-- Purpose: Create users table for signin/signup
-- ============================================
-- Step 1: Create database (run this first if database doesn't exist)
-- Note: You must run this command separately in psql or pgAdmin
-- CREATE DATABASE "PG Antu";
-- Step 2: Connect to the database
-- \c "PG Antu"
-- ============================================
-- Clean existing schema (if any)
-- ============================================
DROP TABLE IF EXISTS users CASCADE;
-- ============================================
-- Create users table
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- Create indexes for performance
-- ============================================
CREATE INDEX idx_users_email ON users(email);
-- ============================================
-- Create automatic updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- Verify setup
-- ============================================
-- Show all tables
\ dt -- Show users table structure
\ d users -- Display message
SELECT 'Database setup complete! Users table created successfully.' AS status;