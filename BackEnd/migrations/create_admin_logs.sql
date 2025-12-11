-- Admin Logs Table
-- Create this table to track admin actions

CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'post', 'verification', etc.
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Add verified_by column to users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE users ADD COLUMN verified_by INTEGER REFERENCES users(id);
    END IF;
END $$;

-- Ensure role column exists with proper default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Create an admin user (update this with your email)
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- Grant example: To make a user an admin
-- UPDATE users SET role = 'admin' WHERE id = <user_id>;

-- Grant example: To make a user a super_admin
-- UPDATE users SET role = 'super_admin' WHERE id = <user_id>;
