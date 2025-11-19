# 🔧 Fix PostgreSQL Password & Create Table

## Problem:

PostgreSQL is rejecting password "antu@1972" from .env file

## Solution:

### Option 1: Using pgAdmin (Recommended)

1. **Open pgAdmin** (Windows Start Menu → pgAdmin 4)

2. **Connect to PostgreSQL**

   - You'll be asked for a password
   - Try these common passwords:
     - (empty/blank)
     - `postgres`
     - `admin`
     - `root`
   - If none work, you'll need to reset it (see Option 2)

3. **Reset Password to antu@1972**

   - Once connected, right-click on "PostgreSQL 16" (or your version)
   - Select "Query Tool"
   - Run this command:

   ```sql
   ALTER USER postgres PASSWORD 'antu@1972';
   ```

   - You should see: "ALTER ROLE"

4. **Create Database (if not exists)**

   ```sql
   CREATE DATABASE "PG Antu";
   ```

5. **Connect to PG Antu and Create Table**

   - In the left sidebar, find "Databases" → "PG Antu"
   - Right-click "PG Antu" → "Query Tool"
   - Run this:

   ```sql
   DROP TABLE IF EXISTS users CASCADE;

   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       full_name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE INDEX idx_users_email ON users(email);

   -- Verify
   SELECT * FROM users;
   ```

6. **Test Backend Connection**
   ```bash
   cd BackEnd
   node server.js
   ```
   You should see: ✅ "Database connected at: [timestamp]"

### Option 2: Using Command Line

```bash
# Find your PostgreSQL bin directory, usually:
# C:\Program Files\PostgreSQL\16\bin

# Reset password (will ask for current password)
psql -U postgres -c "ALTER USER postgres PASSWORD 'antu@1972';"

# Create database
psql -U postgres -c "CREATE DATABASE \"PG Antu\";"

# Run our setup script
cd BackEnd
node setup-database.js
```

### Option 3: Reinstall PostgreSQL (Last Resort)

If you forgot the password completely:

1. Uninstall PostgreSQL
2. Reinstall from postgresql.org
3. During install, set password to: `antu@1972`
4. Then run: `node setup-database.js`

---

## Quick Test After Fixing:

```bash
cd BackEnd
node setup-database.js
```

Expected output:

```
✓ Dropped existing users table
✓ Created users table
✓ Created email index
✓ Created update function
✓ Created update trigger

📊 Users table structure:
  - id: integer (required)
  - full_name: character varying (required)
  - email: character varying (required)
  - password: character varying (required)
  - created_at: timestamp without time zone
  - updated_at: timestamp without time zone

✅ Database setup complete!
```

## Then Test Signup:

1. Start backend: `node server.js`
2. Go to: http://localhost:3012/signup
3. Fill form and click "Create Account"
4. Check in pgAdmin: `SELECT * FROM users;`

You should see your new user! 🎉
