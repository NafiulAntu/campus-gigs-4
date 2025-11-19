# PostgreSQL Setup Roadmap for Campus Gigs

## Step 1: Install PostgreSQL

### Windows:

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Set password for postgres user (remember this!)
4. Default port: 5432
5. Install pgAdmin (included with installer)

### Mac:

```bash
brew install postgresql
brew services start postgresql
```

### Linux:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

Open pgAdmin or use psql command line:

```bash
# Connect to PostgreSQL
psql -U postgres

# Run the schema file
\i /path/to/BackEnd/database/schema.sql

# Or manually:
CREATE DATABASE campus_gigs;
\c campus_gigs
```

Then paste the SQL from `database/schema.sql`

## Step 3: Install Dependencies

```bash
cd BackEnd
npm install pg dotenv
```

## Step 4: Configure Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_gigs
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=your-secret-key-123
```

## Step 5: Update package.json

Make sure you have these dependencies:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.0"
  }
}
```

## Step 6: Start the Server

```bash
cd BackEnd
node server.js
```

You should see:

```
PostgreSQL Connected Successfully
Database connected at: [timestamp]
Server running on http://localhost:3000
```

## Step 7: Test the API

### Test Signup:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirm_password": "password123",
    "terms_agreed": true
  }'
```

### Test Signin:

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Step 8: Verify Database

In pgAdmin or psql:

```sql
-- View all users
SELECT * FROM users;

-- Check user count
SELECT COUNT(*) FROM users;
```

## Troubleshooting

### Connection Refused Error:

- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify port 5432 is open
- Check credentials in .env

### Authentication Failed:

- Reset postgres password: `ALTER USER postgres PASSWORD 'newpassword';`
- Check pg_hba.conf file for authentication method

### Table Not Found:

- Run schema.sql again
- Verify you're connected to correct database: `\c campus_gigs`

## Project Structure

```
BackEnd/
├── config/
│   └── db.js              # PostgreSQL connection pool
├── controllers/
│   └── authController.js   # Signup/Signin logic
├── models/
│   └── User.js            # User model with SQL queries
├── routes/
│   └── authRoutes.js      # API routes
├── database/
│   └── schema.sql         # Database schema
├── .env                   # Environment variables (create this)
├── .env.example           # Environment template
├── server.js              # Main server file
└── package.json

Frontend (Campus-gigs-2-main) connects to:
- http://localhost:3000/api/auth/signup
- http://localhost:3000/api/auth/signin
```

## Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database and tables created
3. ✅ Backend updated to use PostgreSQL
4. ✅ Environment variables configured
5. ✅ Test signup/signin from frontend
6. 🔄 Add more features (profiles, posts, etc.)

## Benefits of PostgreSQL over MongoDB

- ✅ ACID compliance
- ✅ Strong relationships between tables
- ✅ Better for complex queries
- ✅ Data integrity with constraints
- ✅ Mature ecosystem
- ✅ Free and open source
