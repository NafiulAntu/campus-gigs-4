-- Connect to database: PG Antu
-- User: postgres
-- Password: antu@1972
-- View all users
SELECT id,
    full_name,
    email,
    provider,
    terms_agreed,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;
-- Count total users
SELECT COUNT(*) as total_users
FROM users;
-- View users by provider
SELECT provider,
    COUNT(*) as count
FROM users
GROUP BY provider;