import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// 1. COMPANY PROFILE
// ==========================================

export async function getCompanyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    let profile = await db.get('SELECT * FROM company_profiles WHERE user_id = ?', [userId]);

    if (!profile) {
      // Return a blank default company profile template if not created yet
      const id = uuidv4();
      await db.run(
        `INSERT INTO company_profiles (id, user_id, company_name, logo_url, website, about, industry, location, company_size, headquarters, linkedin_url, twitter_url)
         VALUES (?, ?, ?, '', '', '', '', '', '1-10 employees', 'San Francisco, CA', '', '')`,
        [id, userId, 'My Company']
      );
      profile = await db.get('SELECT * FROM company_profiles WHERE user_id = ?', [userId]);
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 5. ADVANCED JOB MANAGEMENT ACTIONS
// ==========================================

export async function duplicateJob(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiter_id !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this job posting' });
    }

    const newId = uuidv4();
    const sql = `
      INSERT INTO jobs (
        id, recruiter_id, company_name, company_logo, title, description, location,
        skills_required, salary_range, job_type, experience_level, employment_type,
        workplace_type, application_deadline, status, industry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      newId,
      recruiterId,
      job.company_name,
      job.company_logo,
      `${job.title} (Copy)`,
      job.description,
      job.location,
      job.skills_required,
      job.salary_range,
      job.job_type,
      job.experience_level,
      job.employment_type,
      job.workplace_type,
      job.application_deadline,
      'Draft', // duplicated postings start as Drafts
      job.industry
    ]);

    res.status(201).json({ message: 'Job posting duplicated successfully as a draft!', jobId: newId });
  } catch (err) {
    next(err);
  }
}

export async function cloneJob(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiter_id !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this job posting' });
    }

    const newId = uuidv4();
    const sql = `
      INSERT INTO jobs (
        id, recruiter_id, company_name, company_logo, title, description, location,
        skills_required, salary_range, job_type, experience_level, employment_type,
        workplace_type, application_deadline, status, industry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      newId,
      recruiterId,
      job.company_name,
      job.company_logo,
      `${job.title} (Clone)`,
      job.description,
      job.location,
      job.skills_required,
      job.salary_range,
      job.job_type,
      job.experience_level,
      job.employment_type,
      job.workplace_type,
      job.application_deadline,
      'Draft',
      job.industry
    ]);

    res.status(201).json({ message: 'Job posting cloned successfully as a draft!', jobId: newId });
  } catch (err) {
    next(err);
  }
}

export async function archiveJob(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    const job = await db.get('SELECT recruiter_id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiter_id !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this job posting' });
    }

    await db.run("UPDATE jobs SET status = 'Archived' WHERE id = ?", [jobId]);
    res.status(200).json({ message: 'Job posting archived successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function bulkPublishJobs(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: 'jobIds must be a non-empty array' });
    }

    // Sanitize and double check ownership
    const placeholders = jobIds.map(() => '?').join(',');
    const checkCount = await db.get(
      `SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ? AND id IN (${placeholders})`,
      [recruiterId, ...jobIds]
    );

    if (parseInt(checkCount.count, 10) !== jobIds.length) {
      return res.status(403).json({ message: 'Unauthorized or invalid jobIds specified' });
    }

    await db.run(
      `UPDATE jobs SET status = 'Published' WHERE recruiter_id = ? AND id IN (${placeholders})`,
      [recruiterId, ...jobIds]
    );

    res.status(200).json({ message: `Successfully published ${jobIds.length} jobs in bulk!` });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteJobs(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: 'jobIds must be a non-empty array' });
    }

    const placeholders = jobIds.map(() => '?').join(',');
    const checkCount = await db.get(
      `SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ? AND id IN (${placeholders})`,
      [recruiterId, ...jobIds]
    );

    if (parseInt(checkCount.count, 10) !== jobIds.length) {
      return res.status(403).json({ message: 'Unauthorized or invalid jobIds specified' });
    }

    await db.run(
      `DELETE FROM jobs WHERE recruiter_id = ? AND id IN (${placeholders})`,
      [recruiterId, ...jobIds]
    );

    res.status(200).json({ message: `Successfully deleted ${jobIds.length} jobs in bulk!` });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { company_name, logo_url, website, about, industry, location, company_size, headquarters, linkedin_url, twitter_url } = req.body;

    if (!company_name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const check = await db.get('SELECT id FROM company_profiles WHERE user_id = ?', [userId]);
    if (!check) {
      const id = uuidv4();
      await db.run(
        `INSERT INTO company_profiles (id, user_id, company_name, logo_url, website, about, industry, location, company_size, headquarters, linkedin_url, twitter_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          company_name,
          logo_url || '',
          website || '',
          about || '',
          industry || '',
          location || '',
          company_size || '1-10 employees',
          headquarters || 'San Francisco, CA',
          linkedin_url || '',
          twitter_url || ''
        ]
      );
    } else {
      const sql = `
        UPDATE company_profiles
        SET company_name = ?,
            logo_url = ?,
            website = ?,
            about = ?,
            industry = ?,
            location = ?,
            company_size = ?,
            headquarters = ?,
            linkedin_url = ?,
            twitter_url = ?
        WHERE user_id = ?
      `;
      await db.run(sql, [
        company_name,
        logo_url || '',
        website || '',
        about || '',
        industry || '',
        location || '',
        company_size || '1-10 employees',
        headquarters || 'San Francisco, CA',
        linkedin_url || '',
        twitter_url || '',
        userId
      ]);
    }

    res.status(200).json({ message: 'Company profile updated successfully!' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. JOB MANAGEMENT (CRUD + TOGGLES)
// ==========================================

export async function listRecruiterJobs(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const sql = `
      SELECT j.*, COUNT(a.id) as applicant_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const jobs = await db.all(sql, [recruiterId, limit, offset]);

    const countResult = await db.get('SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ?', [recruiterId]);
    const total = countResult ? parseInt(countResult.count, 10) : 0;

    res.status(200).json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createJob(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const {
      title,
      description,
      location,
      skills_required,
      salary_range,
      job_type,
      experience_level,
      employment_type,
      workplace_type,
      application_deadline,
      status
    } = req.body;

    if (!title || !description || !location || !skills_required || !job_type) {
      return res.status(400).json({ message: 'Title, description, location, required skills, and job type are required' });
    }

    // Fetch company name to match jobs
    const company = await db.get('SELECT company_name, logo_url FROM company_profiles WHERE user_id = ?', [recruiterId]);
    const companyName = company ? company.company_name : 'My Company';
    const companyLogo = company ? company.logo_url : '';

    const id = uuidv4();
    const sql = `
      INSERT INTO jobs (
        id, recruiter_id, company_name, company_logo, title, description, location,
        skills_required, salary_range, job_type, experience_level, employment_type,
        workplace_type, application_deadline, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      id,
      recruiterId,
      companyName,
      companyLogo,
      title,
      description,
      location,
      skills_required,
      salary_range || '',
      job_type,
      experience_level || 'Entry Level',
      employment_type || 'Full-time',
      workplace_type || 'Remote',
      application_deadline || null,
      status || 'Published'
    ]);

    res.status(201).json({ message: 'Job posting published successfully!', jobId: id });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;
    const {
      title,
      description,
      location,
      skills_required,
      salary_range,
      job_type,
      experience_level,
      employment_type,
      workplace_type,
      application_deadline,
      status
    } = req.body;

    const job = await db.get('SELECT recruiter_id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiter_id !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this job posting' });
    }

    const sql = `
      UPDATE jobs
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          location = COALESCE(?, location),
          skills_required = COALESCE(?, skills_required),
          salary_range = COALESCE(?, salary_range),
          job_type = COALESCE(?, job_type),
          experience_level = COALESCE(?, experience_level),
          employment_type = COALESCE(?, employment_type),
          workplace_type = COALESCE(?, workplace_type),
          application_deadline = COALESCE(?, application_deadline),
          status = COALESCE(?, status)
      WHERE id = ?
    `;

    await db.run(sql, [
      title || null,
      description || null,
      location || null,
      skills_required || null,
      salary_range || null,
      job_type || null,
      experience_level || null,
      employment_type || null,
      workplace_type || null,
      application_deadline || null,
      status || null,
      jobId
    ]);

    res.status(200).json({ message: 'Job posting updated successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    const job = await db.get('SELECT recruiter_id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiter_id !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.run('DELETE FROM jobs WHERE id = ?', [jobId]);
    res.status(200).json({ message: 'Job posting deleted successfully!' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. APPLICANTS PIPELINE
// ==========================================

export async function getApplicants(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { search, skills, experience, location, jobId } = req.query;

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    // Load applications for jobs posted by this recruiter
    let sql = `
      SELECT a.id as application_id, a.resume_url, a.status, a.applied_at,
             j.title as job_title, j.skills_required as job_skills, j.id as job_id,
             u.name as candidate_name, u.email as candidate_email, u.id as candidate_id,
             p.about, p.skills as candidate_skills, p.education, p.experience, p.projects, p.github_url, p.linkedin_url
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.student_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE j.recruiter_id = $1
    `;

    const params = [recruiterId];
    let placeholderCounter = 2;

    if (jobId) {
      sql += ` AND j.id = $${placeholderCounter++}`;
      params.push(jobId);
    }

    if (search) {
      sql += ` AND (u.name ILIKE $${placeholderCounter} OR j.title ILIKE $${placeholderCounter})`;
      placeholderCounter++;
      params.push(`%${search}%`);
    }

    if (location) {
      sql += ` AND j.location ILIKE $${placeholderCounter++}`;
      params.push(`%${location}%`);
    }

    sql += ` ORDER BY a.applied_at DESC`;

    const rows = await db.all(sql, params);

    // Filter rows by Candidate profile details in JS (Education/Experience filtering) & calculate skills matching score
    let filteredRows = rows.map(row => {
      // Calculate premium skills overlap match ratio
      let matchScore = 0;
      let matchDetails = [];
      try {
        const required = (row.job_skills || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

        let possessed = [];
        if (row.candidate_skills) {
          if (row.candidate_skills.startsWith('[')) {
            possessed = JSON.parse(row.candidate_skills).map(s => s.toLowerCase().trim());
          } else {
            possessed = row.candidate_skills.split(',').map(s => s.trim().toLowerCase());
          }
        }

        if (required.length > 0) {
          const intersections = required.filter(skill => possessed.includes(skill));
          matchScore = Math.round((intersections.length / required.length) * 100);
          matchDetails = intersections;
        } else {
          matchScore = 100; // No requirements means 100% match
        }
      } catch (err) {
        matchScore = 50;
      }

      return {
        ...row,
        matchScore,
        matchDetails,
        skills: row.candidate_skills ? (row.candidate_skills.startsWith('[') ? JSON.parse(row.candidate_skills) : row.candidate_skills.split(',')) : [],
        education: row.education ? JSON.parse(row.education) : [],
        experience: row.experience ? JSON.parse(row.experience) : [],
        projects: row.projects ? JSON.parse(row.projects) : []
      };
    });

    // Handle extra filtering via JavaScript
    if (skills) {
      const skillsQuery = skills.toLowerCase().trim();
      filteredRows = filteredRows.filter(r => r.skills.some(s => s.toLowerCase().includes(skillsQuery)));
    }

    if (experience) {
      const expQuery = experience.toLowerCase().trim();
      filteredRows = filteredRows.filter(r => r.experience.some(e =>
        (e.title || '').toLowerCase().includes(expQuery) ||
        (e.company || '').toLowerCase().includes(expQuery)
      ));
    }

    // Apply pagination in JS after dynamic filtering
    const total = filteredRows.length;
    const paginatedRows = filteredRows.slice(offset, offset + limit);

    res.status(200).json({
      candidates: paginatedRows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateStatus(req, res, next) {
  try {
    const recruiterId = req.user.id;
    const { application_id, status } = req.body;

    if (!application_id || !status) {
      return res.status(400).json({ message: 'application_id and status are required' });
    }

    const allowedStatuses = ['Applied', 'Viewed', 'Shortlisted', 'Interviewing', 'Interview Scheduled', 'Hired', 'Offer', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    // Ownership check
    const checkSql = `
      SELECT j.recruiter_id, a.student_id, j.title as job_title
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `;
    const check = await db.get(checkSql, [application_id]);
    if (!check) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    if (check.recruiter_id !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.run('UPDATE applications SET status = ? WHERE id = ?', [status, application_id]);

    // Send automated notification to student regarding ATS status update
    const notifId = uuidv4();
    const notifTitle = `Application Update: ${check.job_title}`;
    const notifMessage = `Your application status has been moved to "${status}" by the recruiter.`;
    await db.run(
      'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [notifId, check.student_id, notifTitle, notifMessage, 'Application Status']
    );

    res.status(200).json({ message: `Candidate status updated to ${status} successfully!`, next_status: status });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. HIRING ANALYTICS & RECENT ACTIVITY
// ==========================================

export async function getHiringAnalytics(req, res, next) {
  try {
    const recruiterId = req.user.id;

    // Aggregate key indicators
    const jobsCountResult = await db.get(`
      SELECT COUNT(CASE WHEN status = 'Published' THEN 1 END) as active_jobs,
             COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft_jobs
      FROM jobs
      WHERE recruiter_id = ?
    `, [recruiterId]);

    const activeJobs = jobsCountResult ? parseInt(jobsCountResult.active_jobs || '0', 10) : 0;
    const draftJobs = jobsCountResult ? parseInt(jobsCountResult.draft_jobs || '0', 10) : 0;

    const appsCountResult = await db.get(`
      SELECT COUNT(a.id) as total_applicants,
             COUNT(CASE WHEN a.status = 'Shortlisted' THEN 1 END) as shortlisted,
             COUNT(CASE WHEN a.status = 'Interviewing' THEN 1 END) as interviewing,
             COUNT(CASE WHEN a.status = 'Hired' THEN 1 END) as hired,
             COUNT(CASE WHEN a.status = 'Rejected' THEN 1 END) as rejected
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = ?
    `, [recruiterId]);

    const totalApplicants = appsCountResult ? parseInt(appsCountResult.total_applicants || '0', 10) : 0;
    const shortlistedCount = appsCountResult ? parseInt(appsCountResult.shortlisted || '0', 10) : 0;
    const interviewingCount = appsCountResult ? parseInt(appsCountResult.interviewing || '0', 10) : 0;
    const hiredCount = appsCountResult ? parseInt(appsCountResult.hired || '0', 10) : 0;
    const rejectedCount = appsCountResult ? parseInt(appsCountResult.rejected || '0', 10) : 0;

    // Applicant Funnel structure
    const funnel = [
      { stage: 'Applied', count: totalApplicants },
      { stage: 'Shortlisted', count: shortlistedCount },
      { stage: 'Interviewing', count: interviewingCount },
      { stage: 'Hired', count: hiredCount }
    ];

    // Job Performance (applicants count per job)
    const performanceSql = `
      SELECT j.title, COUNT(a.id) as applicants
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id
      ORDER BY applicants DESC
      LIMIT 5
    `;
    const performance = await db.all(performanceSql, [recruiterId]);

    res.status(200).json({
      summary: {
        activeJobs,
        draftJobs,
        totalApplicants,
        shortlistedCount,
        interviewingCount,
        hiredCount,
        rejectedCount
      },
      funnel,
      jobPerformance: performance
    });
  } catch (err) {
    next(err);
  }
}
