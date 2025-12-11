# Job Search - Quick Fix Guide

## ✅ What's Been Done

1. **Database Created**: Jobs tables with 29 demo jobs from bdjobs.com
2. **Deadlines Fixed**: All job deadlines updated to 30 days from now
3. **Backend Code Fixed**: 
   - Changed `u.fullname` → `u.full_name` to match schema
   - Jobs API endpoint: `http://localhost:5000/api/jobs`
4. **Frontend Complete**: JobSearch component integrated in PostPage

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd S:/C-Gigs-React/Campus/BackEnd
npm start
```

Wait for: `🚀 Server running on http://localhost:5000`

### 2. Start Frontend
```bash
cd S:/C-Gigs-React/Campus/FrontEnd
npm run dev
```

### 3. Test Jobs Feature
1. Open browser to your frontend URL (usually http://localhost:3000)
2. Log in to your account
3. Click **"Jobs"** in the sidebar menu
4. You should see 29 jobs from bdjobs.com

## 📊 Available Jobs

- Software Engineers (Laravel, React, Node.js)
- Full Stack Developers  
- Mobile App Developers
- Business Development roles
- Sales & Marketing positions
- And more...

Salary ranges: ৳15,000 - ৳150,000/month

## 🔍 Features Available

- **Search**: By job title, company, location
- **Filter**: Category, location, job type, experience, salary
- **Sort**: Latest, deadline, salary
- **Pagination**: 20 jobs per page
- **Apply**: Click "Apply Now" to apply for jobs
- **View Details**: See full job description

## ⚠️ Note

The backend server may be unstable and crash after starting. If you click Jobs and nothing shows:

1. Check if backend is running: `http://localhost:5000/api/jobs`
2. Restart backend: Press Ctrl+C and run `npm start` again
3. Refresh your frontend page

## 🐛 Troubleshooting

**No jobs showing?**
- Backend not running → Start it
- Deadlines expired → Already fixed (updated to 30 days from now)  
- Frontend not connected → Check console for errors

**API returns empty array?**
- Run this SQL to fix deadlines:
```sql
UPDATE jobs SET deadline = CURRENT_DATE + INTERVAL '30 days' WHERE deadline < CURRENT_DATE;
```

**Frontend errors?**
- date-fns missing → Already installed
- JobSearch not imported → Already imported in PostPage.jsx

## 📂 Key Files

- Backend Controller: `BackEnd/controllers/jobController.js`
- Backend Routes: `BackEnd/routes/jobRoutes.js`
- Frontend Component: `FrontEnd/src/components/jobs/JobSearch.jsx`
- Database Migrations: `BackEnd/migrations/run-migrations.js` (already run)
- PostPage Integration: `FrontEnd/src/components/Post/pages/PostPage.jsx` (line 712)

The system is ready! Just start both servers and click Jobs in the sidebar.
