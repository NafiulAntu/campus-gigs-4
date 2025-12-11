const pool = require('../config/db');

// Get all jobs with filters and search
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      job_type,
      experience_min,
      experience_max,
      salary_min,
      salary_max,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        j.*,
        json_agg(DISTINCT jsonb_build_object('skill_name', js.skill_name)) FILTER (WHERE js.skill_name IS NOT NULL) as skills,
        u.full_name as poster_name,
        u.profile_picture as poster_avatar
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.status = 'active' AND j.deadline >= CURRENT_DATE
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (
        to_tsvector('english', j.title) @@ plainto_tsquery('english', $${paramIndex})
        OR to_tsvector('english', j.description) @@ plainto_tsquery('english', $${paramIndex})
        OR j.company ILIKE $${paramIndex + 1}
        OR j.location ILIKE $${paramIndex + 1}
      )`;
      params.push(search, `%${search}%`);
      paramIndex += 2;
    }

    // Category filter
    if (category) {
      query += ` AND j.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Location filter
    if (location) {
      query += ` AND (j.location ILIKE $${paramIndex} OR j.location_district ILIKE $${paramIndex})`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Job type filter
    if (job_type) {
      query += ` AND j.job_type = $${paramIndex}`;
      params.push(job_type);
      paramIndex++;
    }

    // Experience filter
    if (experience_min !== undefined) {
      query += ` AND j.experience_min >= $${paramIndex}`;
      params.push(experience_min);
      paramIndex++;
    }
    if (experience_max !== undefined) {
      query += ` AND j.experience_max <= $${paramIndex}`;
      params.push(experience_max);
      paramIndex++;
    }

    // Salary filter
    if (salary_min !== undefined) {
      query += ` AND j.salary_min >= $${paramIndex}`;
      params.push(salary_min);
      paramIndex++;
    }
    if (salary_max !== undefined) {
      query += ` AND j.salary_max <= $${paramIndex}`;
      params.push(salary_max);
      paramIndex++;
    }

    query += ` GROUP BY j.id, u.full_name, u.profile_picture`;

    // Sorting
    const allowedSortFields = ['created_at', 'deadline', 'salary_min', 'salary_max', 'views', 'title'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY j.${sortField} ${sortDirection}, j.is_featured DESC, j.is_urgent DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT j.id) as total
      FROM jobs j
      WHERE j.status = 'active' AND j.deadline >= CURRENT_DATE
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (
        to_tsvector('english', j.title) @@ plainto_tsquery('english', $${countParamIndex})
        OR to_tsvector('english', j.description) @@ plainto_tsquery('english', $${countParamIndex})
        OR j.company ILIKE $${countParamIndex + 1}
        OR j.location ILIKE $${countParamIndex + 1}
      )`;
      countParams.push(search, `%${search}%`);
      countParamIndex += 2;
    }
    if (category) {
      countQuery += ` AND j.category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    if (location) {
      countQuery += ` AND (j.location ILIKE $${countParamIndex} OR j.location_district ILIKE $${countParamIndex})`;
      countParams.push(`%${location}%`);
      countParamIndex++;
    }
    if (job_type) {
      countQuery += ` AND j.job_type = $${countParamIndex}`;
      countParams.push(job_type);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalJobs = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalJobs / limit);

    res.json({
      success: true,
      jobs: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        j.*,
        json_agg(DISTINCT jsonb_build_object('skill_name', js.skill_name)) FILTER (WHERE js.skill_name IS NOT NULL) as skills,
        u.fullname as poster_name,
        u.profile_picture as poster_avatar,
        u.email as poster_email,
        u.phone as poster_phone
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.id = $1
      GROUP BY j.id, u.fullname, u.profile_picture, u.email, u.phone
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment views
    await pool.query('UPDATE jobs SET views = views + 1 WHERE id = $1', [id]);

    res.json({
      success: true,
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new job (requires authentication)
exports.createJob = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      title,
      company,
      company_logo,
      location,
      location_district,
      job_type,
      category,
      industry,
      description,
      requirements,
      responsibilities,
      benefits,
      salary_min,
      salary_max,
      salary_type,
      experience_min,
      experience_max,
      education_level,
      vacancy_count,
      deadline,
      skills,
      is_featured,
      is_urgent
    } = req.body;

    // Validate required fields
    if (!title || !company || !location || !job_type || !category || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const query = `
      INSERT INTO jobs (
        title, company, company_logo, location, location_district,
        job_type, category, industry, description, requirements,
        responsibilities, benefits, salary_min, salary_max, salary_type,
        experience_min, experience_max, education_level, vacancy_count,
        deadline, posted_by, is_featured, is_urgent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const values = [
      title, company, company_logo, location, location_district,
      job_type, category, industry, description, requirements,
      responsibilities, benefits, salary_min, salary_max, salary_type,
      experience_min, experience_max, education_level, vacancy_count || 1,
      deadline, userId, is_featured || false, is_urgent || false
    ];

    const result = await pool.query(query, values);
    const jobId = result.rows[0].id;

    // Insert skills
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const skillsQuery = `INSERT INTO job_skills (job_id, skill_name) VALUES ${skills.map((_, i) => `($1, $${i + 2})`).join(', ')}`;
      await pool.query(skillsQuery, [jobId, ...skills]);
    }

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update job (requires authentication and ownership)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if job exists and user owns it
    const checkQuery = 'SELECT * FROM jobs WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (checkResult.rows[0].posted_by !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this job' });
    }

    const {
      title, company, company_logo, location, location_district,
      job_type, category, industry, description, requirements,
      responsibilities, benefits, salary_min, salary_max, salary_type,
      experience_min, experience_max, education_level, vacancy_count,
      deadline, status, skills
    } = req.body;

    const query = `
      UPDATE jobs SET
        title = COALESCE($1, title),
        company = COALESCE($2, company),
        company_logo = COALESCE($3, company_logo),
        location = COALESCE($4, location),
        location_district = COALESCE($5, location_district),
        job_type = COALESCE($6, job_type),
        category = COALESCE($7, category),
        industry = COALESCE($8, industry),
        description = COALESCE($9, description),
        requirements = COALESCE($10, requirements),
        responsibilities = COALESCE($11, responsibilities),
        benefits = COALESCE($12, benefits),
        salary_min = COALESCE($13, salary_min),
        salary_max = COALESCE($14, salary_max),
        salary_type = COALESCE($15, salary_type),
        experience_min = COALESCE($16, experience_min),
        experience_max = COALESCE($17, experience_max),
        education_level = COALESCE($18, education_level),
        vacancy_count = COALESCE($19, vacancy_count),
        deadline = COALESCE($20, deadline),
        status = COALESCE($21, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $22
      RETURNING *
    `;

    const values = [
      title, company, company_logo, location, location_district,
      job_type, category, industry, description, requirements,
      responsibilities, benefits, salary_min, salary_max, salary_type,
      experience_min, experience_max, education_level, vacancy_count,
      deadline, status, id
    ];

    const result = await pool.query(query, values);

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      await pool.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
      if (skills.length > 0) {
        const skillsQuery = `INSERT INTO job_skills (job_id, skill_name) VALUES ${skills.map((_, i) => `($1, $${i + 2})`).join(', ')}`;
        await pool.query(skillsQuery, [id, ...skills]);
      }
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete job (requires authentication and ownership)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if job exists and user owns it
    const checkQuery = 'SELECT * FROM jobs WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (checkResult.rows[0].posted_by !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this job' });
    }

    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get job categories
exports.getCategories = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category, COUNT(*) as count
      FROM jobs
      WHERE status = 'active' AND deadline >= CURRENT_DATE
      GROUP BY category
      ORDER BY count DESC
    `;
    const result = await pool.query(query);

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get job locations
exports.getLocations = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT location_district, COUNT(*) as count
      FROM jobs
      WHERE status = 'active' AND deadline >= CURRENT_DATE AND location_district IS NOT NULL
      GROUP BY location_district
      ORDER BY count DESC
    `;
    const result = await pool.query(query);

    res.json({
      success: true,
      locations: result.rows
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { cover_letter, resume_url } = req.body;

    // Check if job exists
    const jobQuery = 'SELECT * FROM jobs WHERE id = $1 AND status = $2';
    const jobResult = await pool.query(jobQuery, [id, 'active']);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    // Check if already applied
    const checkQuery = 'SELECT * FROM job_applications WHERE job_id = $1 AND applicant_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }

    // Create application
    const query = `
      INSERT INTO job_applications (job_id, applicant_id, cover_letter, resume_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId, cover_letter, resume_url]);

    // Increment applications count
    await pool.query('UPDATE jobs SET applications = applications + 1 WHERE id = $1', [id]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user's job applications
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        ja.*,
        j.title, j.company, j.location, j.job_type, j.salary_min, j.salary_max,
        j.company_logo, j.deadline, j.status as job_status
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.applicant_id = $1
      ORDER BY ja.applied_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      applications: result.rows
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get my posted jobs
exports.getMyPostedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        j.*,
        json_agg(DISTINCT jsonb_build_object('skill_name', js.skill_name)) FILTER (WHERE js.skill_name IS NOT NULL) as skills
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.posted_by = $1
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      jobs: result.rows
    });
  } catch (error) {
    console.error('Error fetching posted jobs:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
