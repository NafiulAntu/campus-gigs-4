# Database Setup for Signin/Signup

This guide will help you set up the **PG Antu** PostgreSQL database for user authentication.

## Prerequisites

- PostgreSQL installed on your system
- pgAdmin or psql command-line tool

## Setup Steps

### 1. Create Database

Open pgAdmin or psql and run:

```sql
CREATE DATABASE "PG Antu";
```

### 2. Connect to Database

```sql
\c "PG Antu"
```

### 3. Run Schema

Execute the contents of `database/schema.sql`:

```sql
-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table for signin/signup
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 4. Verify Table Creation

```sql
\dt
SELECT * FROM users;
```

### 5. Configure Environment

Make sure your `.env` file has correct credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=PG Antu
DB_USER=postgres
DB_PASSWORD=antu@1972
```

### 6. Start Backend Server

```bash
cd BackEnd
node server.js
```

Expected output:

```
Server running on http://localhost:3000
Database connected at: [timestamp]
```

## Testing Signup/Signin

### Test Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirm_password": "password123",
    "terms_agreed": true
  }'
```

### Test Signin

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Verify in Database

```sql
SELECT id, full_name, email, created_at FROM users;
```

## Troubleshooting

### Password Authentication Failed

- Check your PostgreSQL password is correct
- Verify `DB_PASSWORD` in `.env` matches your postgres password
- Try resetting postgres password: `ALTER USER postgres PASSWORD 'antu@1972';`

### Database Does Not Exist

- Make sure you created the database: `CREATE DATABASE "PG Antu";`
- Note: The database name has a space, so use quotes

### Port Already in Use

- Check if another process is using port 3000
- Change `PORT` in `.env` file if needed

## Database Structure

**users table:**

- `id` - Auto-incrementing primary key
- `full_name` - User's full name
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp (auto-updated)

## Security Notes

- Passwords are hashed using bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Email must be unique (enforced by database constraint)
- Never store plain text passwords
