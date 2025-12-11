-- Set a specific user as admin
-- Run this in your PostgreSQL client after replacing the email

-- Option 1: By email
UPDATE users SET role = 'admin' WHERE email = 'your-email@gmail.com';

-- Option 2: By user ID
-- UPDATE users SET role = 'admin' WHERE id = 1;

-- Option 3: Make someone super_admin (has all admin privileges)
-- UPDATE users SET role = 'super_admin' WHERE email = 'your-email@gmail.com';

-- Check all users with admin roles
SELECT id, full_name, email, role, is_verified, created_at 
FROM users 
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at DESC;

-- Check all users
SELECT id, full_name, email, role, is_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 20;
