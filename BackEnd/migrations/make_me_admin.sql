-- Step 1: View all users to find your user ID
SELECT id, full_name, email, username, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Make yourself admin (REPLACE 'your-email@gmail.com' with YOUR actual email)
-- After running the SELECT above, use the correct email address below:
UPDATE users SET role = 'admin' WHERE email = 'your-email@gmail.com';

-- Step 3: Verify the change
SELECT id, full_name, email, role 
FROM users 
WHERE role IN ('admin', 'super_admin');

-- Alternative: If you know your user ID (for example, ID = 1)
-- UPDATE users SET role = 'admin' WHERE id = 1;
