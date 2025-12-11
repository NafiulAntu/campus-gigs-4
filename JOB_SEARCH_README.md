# Job Search Feature - Campus Gigs

## Overview
The Job Search feature allows users to browse and search for job opportunities across Bangladesh. It includes advanced filtering, real-time search, and a comprehensive job details page.

## Features

### 1. **Job Listings**
- Display jobs collected from bdjobs.com (30 demo jobs included)
- Categories: IT, Finance, Marketing, HR, Engineering, Education, Healthcare, NGO, Design, etc.
- Job types: Full-time, Part-time, Contract, Internship, Remote

### 2. **Advanced Search & Filters**
- **Search**: By job title, company name, or keywords
- **Category Filter**: Browse by job category
- **Location Filter**: Filter by district (Dhaka, Chattogram, etc.)
- **Job Type Filter**: Filter by employment type
- **Experience Filter**: Min/Max years of experience
- **Salary Filter**: Min/Max salary range
- **Sort Options**: Latest, Deadline, Salary, Job Title

### 3. **Job Details Page**
- Complete job information
- Company details
- Salary and benefits
- Requirements and responsibilities
- Skills required
- Application statistics
- Apply directly with cover letter

### 4. **Application System**
- Submit applications with cover letter
- Track application status
- View my applications
- Prevent duplicate applications

## Database Setup

### 1. Run the Migration
```bash
cd Campus/BackEnd
psql -U postgres -d "PG Antu" -f migrations/create_jobs_table.sql
```

### 2. Seed Demo Jobs
```bash
psql -U postgres -d "PG Antu" -f migrations/seed_demo_jobs.sql
```

This will create:
- `jobs` table (30 demo jobs)
- `job_applications` table
- `job_skills` table
- Indexes for fast search

## API Endpoints

### Public Endpoints
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get single job details
- `GET /api/jobs/categories` - Get all categories
- `GET /api/jobs/locations` - Get all locations

### Protected Endpoints (Require Authentication)
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job
- `GET /api/jobs/my/applications` - Get my applications
- `GET /api/jobs/my/posted` - Get my posted jobs

## Frontend Components

### 1. JobSearch (`FrontEnd/src/components/jobs/JobSearch.jsx`)
Main component with:
- Search bar
- Advanced filters (collapsible)
- Job grid display
- Pagination
- Filter chips
- Loading states

### 2. JobCard (`FrontEnd/src/components/jobs/JobCard.jsx`)
Individual job card showing:
- Company logo and name
- Job title and location
- Salary range
- Experience required
- Job type and category
- Skills (first 4)
- Deadline countdown
- Posted time

### 3. JobDetails (`FrontEnd/src/components/jobs/JobDetails.jsx`)
Full job details page with:
- Complete job information
- Apply dialog
- Share and save buttons
- Company information
- Job statistics

## Usage

### Access Job Search
1. Click on "Jobs" in the sidebar (briefcase icon)
2. The job search page will load with all active jobs
3. Use search bar or filters to find specific jobs
4. Click "View Details" on any job card

### Search for Jobs
```javascript
// Example filters
{
  search: 'software developer',
  category: 'IT/Telecommunication',
  location: 'Dhaka',
  job_type: 'full-time',
  experience_min: 2,
  experience_max: 5,
  salary_min: 30000,
  salary_max: 60000,
  sort_by: 'created_at',
  sort_order: 'DESC',
  page: 1,
  limit: 12
}
```

### Apply for a Job
1. Click "View Details" on a job
2. Review job information
3. Click "Apply Now"
4. Write cover letter
5. Submit application
6. User's profile info is automatically included

### Post a Job (Coming Soon)
Employers can post jobs with:
- Job title and description
- Company information
- Requirements and responsibilities
- Salary range
- Required skills
- Application deadline

## Search Features

### Full-Text Search
Jobs are indexed for fast full-text search on:
- Job title
- Company name
- Job description
- Location

### Filter Combinations
All filters work together:
- Search + Category + Location + Type
- Experience + Salary range
- Any combination of filters

### Smart Sorting
Sort by:
- **Latest**: Most recently posted
- **Deadline**: Expiring soon first
- **Salary**: High to low or low to high
- **Title**: Alphabetical

## Job Categories
Based on bdjobs.com categories:
- Accounting/Finance
- IT/Telecommunication
- Marketing/Sales
- HR/Org. Development
- Engineer/Architects
- Education/Training
- Healthcare/Medical
- NGO/Development
- Design/Creative
- Apparel/Fashion
- Management
- Internship
- And more...

## Demo Jobs Included

### Featured Jobs
- Data Scientist at DBH Finance (৳80k-120k)
- Senior Manager HR at Besthome Properties (৳70k-100k)
- Senior Manager Taxation at Huawei (৳90k-130k)

### Popular Categories
- **IT Jobs**: Software Developer, Flutter Developer, Product Analyst
- **Finance Jobs**: Assistant Manager Finance, Accounts Officer
- **Engineering**: Civil Engineer, MEP Design Manager
- **Healthcare**: Medical Promotion Officer, Medical Information Officer
- **Education**: Physics Teacher, Faculty positions
- **Fresh Graduate**: Management Trainee, Internships

### Job Types Distribution
- Full-time: 25 jobs
- Part-time: 1 job
- Contract: 1 job
- Internship: 2 jobs
- Remote: 1 job

## Customization

### Add More Job Categories
Edit `seed_demo_jobs.sql` and add:
```sql
INSERT INTO jobs (title, company, category, ...) VALUES
('New Job Title', 'Company Name', 'New Category', ...);
```

### Modify Search Algorithm
Edit `BackEnd/controllers/jobController.js`:
```javascript
// Adjust search query weights
query += ` AND (
  to_tsvector('english', j.title) @@ plainto_tsquery('english', $${paramIndex})
  OR ...
)`;
```

### Customize Job Card UI
Edit `FrontEnd/src/components/jobs/JobCard.jsx` to change:
- Colors and styling
- Information displayed
- Card layout
- Hover effects

## Performance

### Database Indexes
Created for fast queries on:
- Category
- Location
- Job type
- Status
- Deadline
- Created date
- Full-text search on title and description

### Pagination
- Default: 12 jobs per page
- Reduces load time
- Smooth navigation

### Caching
Categories and locations are fetched once and cached.

## Future Enhancements

1. **Job Posting UI**
   - Form for employers to post jobs
   - Upload company logo
   - Add multiple skills

2. **Advanced Application System**
   - Resume upload
   - Application tracking
   - Status updates

3. **Job Alerts**
   - Email notifications
   - Saved searches
   - New job alerts

4. **Employer Dashboard**
   - View applications
   - Shortlist candidates
   - Message applicants

5. **Job Recommendations**
   - Based on user profile
   - Based on search history
   - Similar jobs

## Troubleshooting

### Jobs not loading
1. Check backend server is running: `http://localhost:5000`
2. Verify database connection
3. Check browser console for errors
4. Run migrations if needed

### Search not working
1. Check database indexes are created
2. Verify search query in network tab
3. Check controller logic

### Apply button not working
1. Ensure user is logged in
2. Check authentication token
3. Verify job ID is correct

## API Response Examples

### Get Jobs
```json
{
  "success": true,
  "jobs": [
    {
      "id": 1,
      "title": "Software Developer",
      "company": "Tech Company",
      "location": "Dhaka",
      "salary_min": 40000,
      "salary_max": 60000,
      "experience_min": 2,
      "experience_max": 4,
      "skills": [
        { "skill_name": "JavaScript" },
        { "skill_name": "React" }
      ],
      "created_at": "2025-01-01T00:00:00.000Z",
      "deadline": "2025-01-25T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalJobs": 30,
    "hasMore": true
  }
}
```

### Get Categories
```json
{
  "success": true,
  "categories": [
    { "category": "IT/Telecommunication", "count": 7 },
    { "category": "Accounting/Finance", "count": 3 }
  ]
}
```

## Credits
Demo job data collected from [bdjobs.com](https://bdjobs.com/), Bangladesh's #1 employment marketplace.
