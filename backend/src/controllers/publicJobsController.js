import db from '../config/db.js';

// ==========================================================
// PUBLIC & STUDENT ADVANCED JOB PORTAL CONTROLLER
// ==========================================================

export async function listAllJobsAdvanced(req, res, next) {
  try {
    const {
      search,
      skills,
      category,
      industry,
      experience_level,
      employment_type,
      workplace_type,
      posted_within, // 'today', '7days', '30days'
      remote_only,   // 'true'
      salary_min,
      salary_max,
      sortBy,        // 'newest', 'salary_high'
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT id, recruiter_id, company_name, company_logo, title, description, location,
             skills_required, salary_range, job_type, experience_level, employment_type,
             workplace_type, application_deadline, status, approval_status, industry, created_at
      FROM jobs
      WHERE status = 'Published' AND approval_status = 'Approved'
    `;

    const params = [];
    let paramIndex = 1;

    // Search input (Company, Title, Skills, Description)
    if (search) {
      query += ` AND (
        title ILIKE $${paramIndex} OR
        company_name ILIKE $${paramIndex} OR
        skills_required ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Skills exact or substring list (comma-separated query or array)
    if (skills) {
      const skillsList = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (skillsList.length > 0) {
        query += ` AND (`;
        const skillConditions = skillsList.map(skill => {
          const cond = `skills_required ILIKE $${paramIndex}`;
          params.push(`%${skill}%`);
          paramIndex++;
          return cond;
        });
        query += skillConditions.join(' OR ') + `)`;
      }
    }

    // Job Type Category filter (Job vs Internship)
    if (category && category !== 'All') {
      query += ` AND job_type = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Industry filter
    if (industry && industry !== 'All') {
      query += ` AND industry = $${paramIndex}`;
      params.push(industry);
      paramIndex++;
    }

    // Experience Level filter
    if (experience_level && experience_level !== 'All') {
      query += ` AND experience_level = $${paramIndex}`;
      params.push(experience_level);
      paramIndex++;
    }

    // Employment Type filter
    if (employment_type && employment_type !== 'All') {
      query += ` AND employment_type = $${paramIndex}`;
      params.push(employment_type);
      paramIndex++;
    }

    // Workplace Type filter
    if (workplace_type && workplace_type !== 'All') {
      query += ` AND workplace_type = $${paramIndex}`;
      params.push(workplace_type);
      paramIndex++;
    }

    // Remote Only quick checkbox
    if (remote_only === 'true') {
      query += ` AND workplace_type = 'Remote'`;
    }

    // Posted Time Window filter
    if (posted_within) {
      let interval = '';
      if (posted_within === 'today') {
        interval = '1 day';
      } else if (posted_within === '7days') {
        interval = '7 days';
      } else if (posted_within === '30days') {
        interval = '30 days';
      }

      if (interval) {
        query += ` AND created_at >= NOW() - INTERVAL '${interval}'`;
      }
    }

    // Basic numerical parsing of salary from text range
    // NOTE: In PostgreSQL we can do regex parses or parse inline to approximate,
    // or we can parse via javascript filter. To be perfectly robust with PostgreSQL,
    // we fetch matching rows and then double-check salary filters if salary_min or salary_max are specified.
    // Or we can approximate: e.g. clean salary_range and convert.
    // Let's load the filtered database rows, and we can additionally filter salary/skills high-fidelity on the JS side if needed.

    // Sorting definition
    let orderSql = ' ORDER BY created_at DESC';
    if (sortBy === 'salary_high') {
      // Approximate salary sort by extracting the largest digit-sequences from salary_range text if possible, or fallback
      orderSql = ` ORDER BY COALESCE(NULLIF(regexp_replace(salary_range, '[^0-9]', '', 'g'), ''), '0')::NUMERIC DESC, created_at DESC`;
    }

    query += orderSql;

    // Pagination Limit + Offset
    const countQuery = `SELECT COUNT(*) as count FROM (${query}) AS temp_count`;
    const totalCountResult = await db.all(countQuery, params);
    const total = totalCountResult && totalCountResult[0] ? parseInt(totalCountResult[0].count, 10) : 0;

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const jobs = await db.all(query, params);

    // Filter salary via JavaScript to handle complex formats e.g. "$120,000 - $150,000" or "$40 - $55 / hour"
    let filteredJobs = jobs;
    if (salary_min || salary_max) {
      const minVal = parseFloat(salary_min) || 0;
      const maxVal = parseFloat(salary_max) || Infinity;

      filteredJobs = jobs.filter(job => {
        // Extract all numbers from the salary string
        const numbers = (job.salary_range || '').replace(/,/g, '').match(/\d+/g);
        if (!numbers) return true; // Keep if we can't determine
        const parsedNums = numbers.map(Number);
        const maxSalary = Math.max(...parsedNums);
        const minSalary = Math.min(...parsedNums);

        // check if they overlap with the search range
        return maxSalary >= minVal && minSalary <= maxVal;
      });
    }

    res.status(200).json({
      jobs: filteredJobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobsFiltersMeta(req, res, next) {
  try {
    // Dynamic fetching of filter dropdown lists based on active database postings
    const companies = await db.all("SELECT DISTINCT company_name FROM jobs WHERE status = 'Published' AND approval_status = 'Approved' ORDER BY company_name");
    const industries = await db.all("SELECT DISTINCT industry FROM jobs WHERE status = 'Published' AND approval_status = 'Approved' ORDER BY industry");
    const locations = await db.all("SELECT DISTINCT location FROM jobs WHERE status = 'Published' AND approval_status = 'Approved' ORDER BY location");

    res.status(200).json({
      companies: companies.map(c => c.company_name).filter(Boolean),
      industries: industries.map(i => i.industry).filter(Boolean),
      locations: locations.map(l => l.location).filter(Boolean),
      categories: ['All', 'Job', 'Internship'],
      experienceLevels: ['All', 'Entry Level', 'Intermediate', 'Senior', 'Lead'],
      employmentTypes: ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'],
      workplaceTypes: ['All', 'Remote', 'Hybrid', 'Onsite']
    });
  } catch (err) {
    next(err);
  }
}
