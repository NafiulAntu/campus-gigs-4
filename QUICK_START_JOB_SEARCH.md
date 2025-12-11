# Quick Start Guide - Job Search Feature

## 🚀 Get Started in 5 Minutes!

### Step 1: Run Database Migrations (Required)

Open **pgAdmin** or any PostgreSQL client and connect to database `PG Antu`:

#### Option A: Using pgAdmin
1. Right-click on database `PG Antu` → Query Tool
2. Open file: `Campus/BackEnd/migrations/create_jobs_table.sql`
3. Click Execute (F5) or Run button
4. Open file: `Campus/BackEnd/migrations/seed_demo_jobs.sql`
5. Click Execute (F5) or Run button
6. ✅ Done! You should see "30 rows affected"

#### Option B: Using Command Line
```bash
# Replace path with your PostgreSQL installation path
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d "PG Antu" -f "S:/C-Gigs-React/Campus/BackEnd/migrations/create_jobs_table.sql"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d "PG Antu" -f "S:/C-Gigs-React/Campus/BackEnd/migrations/seed_demo_jobs.sql"
```

### Step 2: Restart Backend Server

```bash
cd S:/C-Gigs-React/Campus/BackEnd
npm run dev
```

**Wait for**: `✅ Database connected: PG Antu`

### Step 3: Start Frontend (if not running)

```bash
cd S:/C-Gigs-React/Campus/FrontEnd
npm run dev
```

**Open**: http://localhost:3000

### Step 4: Test Job Search! 🎉

1. **Login** to Campus Gigs
2. Click **"Jobs"** in the sidebar (briefcase icon)
3. You should see **30 job listings**!

## ✨ Try These Features:

### 1. Search
- Type "software" → See IT jobs
- Type "manager" → See management positions
- Type "Dhaka" → See jobs in Dhaka

### 2. Filters
- Click **"Filters"** button
- Select **Category**: "IT/Telecommunication"
- Select **Location**: "Dhaka"
- Select **Job Type**: "Full Time"
- Enter **Min Experience**: 2
- Enter **Max Experience**: 5

### 3. View Job
- Click **"View Details"** on any job
- See complete job information
- Click **"Apply Now"**
- Write cover letter
- Submit application!

### 4. Sort Jobs
- Sort by **Latest** (newest first)
- Sort by **Deadline** (expiring soon)
- Sort by **Salary** (highest paid)

## 🎯 Demo Jobs to Try:

### High-Paying Jobs:
1. **Senior Manager Taxation** at Huawei (৳90k-130k)
2. **Manager - Data Scientist** at DBH Finance (৳80k-120k)
3. **Sr. Manager/Manager - HR** at Besthome Properties (৳70k-100k)

### IT Jobs:
1. **Software Developer** at Hana System (৳40k-60k)
2. **Flutter Application Developer** at Tanvir Construction (৳50k-70k)
3. **Jr. Product Analyst** at Bdjobs.com (৳35k-50k)

### Fresh Graduate Jobs:
1. **Management Trainee Officer** at Servopro IT (৳25k-35k)
2. **Internship** at Nymphea (৳10k-15k)
3. **Internship** at GIZ (৳15k-20k)

### Remote Jobs:
1. **Content Writer (Remote)** at Tech Startup BD (৳20k-35k)

## 🔍 Search Examples:

```
Search: "developer"
Filter: Category = "IT/Telecommunication"
Result: 7 IT jobs

Search: "manager"
Filter: Experience = 5-10 years
Result: Senior management roles

Search: "intern"
Filter: Experience = 0 years
Result: Internship opportunities

Search: nothing (leave empty)
Filter: Location = "Dhaka", Salary Min = 50000
Result: High-paying Dhaka jobs
```

## ✅ Verify Installation:

Run this in PostgreSQL to check:
```sql
SELECT COUNT(*) as job_count FROM jobs WHERE status = 'active';
-- Should return: 30

SELECT COUNT(*) as skill_count FROM job_skills;
-- Should return: ~116

SELECT category, COUNT(*) FROM jobs GROUP BY category ORDER BY COUNT(*) DESC;
-- Should show job distribution by category
```

## 🐛 Troubleshooting:

### "No jobs found"
- ✅ Check backend is running
- ✅ Check database migrations ran successfully
- ✅ Check browser console for errors
- ✅ Try refreshing the page

### "Failed to fetch"
- ✅ Backend server must be running on port 5000
- ✅ Check `http://localhost:5000` responds
- ✅ Check CORS is enabled in backend

### Database errors
- ✅ Make sure PostgreSQL is running
- ✅ Database name is exactly "PG Antu"
- ✅ User has permissions to create tables
- ✅ PostgreSQL version 18 recommended

## 📱 Mobile Testing:

1. Open on mobile browser or use dev tools
2. Responsive design should work perfectly
3. Grid adjusts to single column
4. Filters collapse for better UX

## 🎓 Learn More:

- **Full Documentation**: `JOB_SEARCH_README.md`
- **Implementation Details**: `JOB_SEARCH_IMPLEMENTATION.md`
- **Database Setup**: `DATABASE_SETUP.md`

## 🚀 You're Ready!

Job search feature is now fully functional with:
- ✅ 30 real job listings from bdjobs.com
- ✅ Advanced search and filters
- ✅ Beautiful responsive design
- ✅ Application system
- ✅ Complete backend API

**Start browsing jobs now!** 🎉

## 📞 Need Help?

Common issues and solutions:
1. **Jobs not showing**: Check backend logs for database errors
2. **Search not working**: Clear browser cache and hard refresh
3. **Apply not working**: Make sure you're logged in
4. **Slow loading**: Check network tab for API response times

Happy job hunting! 🎯
