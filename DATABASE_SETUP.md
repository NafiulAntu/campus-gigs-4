# Database Setup Instructions

## Run these commands in PostgreSQL (pgAdmin or psql):

### 1. Create Jobs Table
```sql
-- Copy and paste the contents of: BackEnd/migrations/create_jobs_table.sql
-- This will create:
-- - jobs table
-- - job_applications table  
-- - job_skills table
-- - All necessary indexes
```

### 2. Insert Demo Jobs
```sql
-- Copy and paste the contents of: BackEnd/migrations/seed_demo_jobs.sql
-- This will insert:
-- - 30 demo jobs from bdjobs.com
-- - Job skills for each job
```

## OR Run via Command Line:

### Windows (if PostgreSQL bin is in PATH):
```bash
cd Campus/BackEnd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d "PG Antu" -f migrations/create_jobs_table.sql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d "PG Antu" -f migrations/seed_demo_jobs.sql
```

### Linux/Mac:
```bash
cd Campus/BackEnd
psql -U postgres -d "PG Antu" -f migrations/create_jobs_table.sql
psql -U postgres -d "PG Antu" -f migrations/seed_demo_jobs.sql
```

## Via pgAdmin:

1. Open pgAdmin
2. Connect to PostgreSQL server
3. Select database "PG Antu"
4. Open Query Tool (Tools > Query Tool)
5. Open file: `migrations/create_jobs_table.sql`
6. Click Execute (F5)
7. Open file: `migrations/seed_demo_jobs.sql`
8. Click Execute (F5)

## Verify Installation:

Run this query to check if tables were created:
```sql
SELECT 
  'jobs' as table_name, COUNT(*) as record_count 
FROM jobs
UNION ALL
SELECT 
  'job_skills' as table_name, COUNT(*) 
FROM job_skills
UNION ALL
SELECT 
  'job_applications' as table_name, COUNT(*) 
FROM job_applications;
```

Expected result:
- jobs: 30 records
- job_skills: ~116 records (skills for jobs)
- job_applications: 0 records (empty initially)

## Troubleshooting:

### Error: relation "jobs" already exists
```sql
-- Drop existing tables if needed (WARNING: This deletes all data!)
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Then run create_jobs_table.sql again
```

### Error: syntax error
- Make sure you're running the entire SQL file
- Check PostgreSQL version (18 required for some features)
- Try running each CREATE TABLE statement separately

### No demo jobs appearing
- Make sure seed_demo_jobs.sql ran successfully
- Check for foreign key errors
- Verify `posted_by` user ID exists in users table

## Next Steps:

1. Restart backend server: `npm run dev`
2. Frontend should auto-detect new routes
3. Click "Jobs" in sidebar to see job listings
4. Search, filter, and browse 30 demo jobs!

## Manual Test Query:

```sql
-- Get all active jobs
SELECT 
  id, title, company, location, 
  salary_min, salary_max, deadline, 
  created_at
FROM jobs 
WHERE status = 'active' 
ORDER BY created_at DESC;
```
