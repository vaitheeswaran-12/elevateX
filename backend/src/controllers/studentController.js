import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ==========================================
// 1. PROFILE CONTROLLERS
// ==========================================

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await db.get('SELECT id, name, email, role, is_verified FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [userId]);

    res.status(200).json({
      user,
      profile: profile ? {
        ...profile,
        skills: JSON.parse(profile.skills || '[]'),
        education: JSON.parse(profile.education || '[]'),
        experience: JSON.parse(profile.experience || '[]'),
        projects: JSON.parse(profile.projects || '[]')
      } : null
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, about, skills, education, experience, projects, github_url, linkedin_url, avatar_url, resume_url } = req.body;

    if (name) {
      await db.run('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : skills || '[]';
    const educationJson = Array.isArray(education) ? JSON.stringify(education) : education || '[]';
    const experienceJson = Array.isArray(experience) ? JSON.stringify(experience) : experience || '[]';
    const projectsJson = Array.isArray(projects) ? JSON.stringify(projects) : projects || '[]';

    // Check if profile exists, otherwise insert
    const profileExists = await db.get('SELECT id FROM profiles WHERE user_id = ?', [userId]);

    if (profileExists) {
      const sqlUpdate = `
        UPDATE profiles
        SET about = ?, skills = ?, education = ?, experience = ?, projects = ?,
            github_url = ?, linkedin_url = ?, avatar_url = ?, resume_url = ?
        WHERE user_id = ?
      `;
      await db.run(sqlUpdate, [
        about || '',
        skillsJson,
        educationJson,
        experienceJson,
        projectsJson,
        github_url || '',
        linkedin_url || '',
        avatar_url || '',
        resume_url || '',
        userId
      ]);
    } else {
      const sqlInsert = `
        INSERT INTO profiles (id, user_id, about, skills, education, experience, projects, github_url, linkedin_url, avatar_url, resume_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(sqlInsert, [
        uuidv4(),
        userId,
        about || '',
        skillsJson,
        educationJson,
        experienceJson,
        projectsJson,
        github_url || '',
        linkedin_url || '',
        avatar_url || '',
        resume_url || ''
      ]);
    }

    res.status(200).json({ message: 'Profile updated successfully!' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. ENROLLED COURSES CONTROLLERS
// ==========================================

export async function getEnrolledCourses(req, res, next) {
  try {
    const studentId = req.user.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    // Query joins enrollments and corresponding courses with pagination
    const sql = `
      SELECT e.id as enrollment_id, e.completed_lessons, e.quiz_score, e.completed_at, e.created_at as enrolled_at,
             c.id as course_id, c.title, c.description, c.thumbnail_url, c.category, c.difficulty, c.duration, c.rating,
             u.name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.student_id = ?
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const enrollments = await db.all(sql, [studentId, limit, offset]);

    // Gather dynamic lesson count per enrolled course
    const courseIds = [...new Set(enrollments.map(e => e.course_id))];
    const lessonCountMap = {};

    if (courseIds.length > 0) {
      const lessonsSql = `
        SELECT m.course_id, COUNT(l.id) as lesson_count
        FROM course_modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        WHERE m.course_id IN (${courseIds.map(() => '?').join(',')})
        GROUP BY m.course_id
      `;
      const lessonCounts = await db.all(lessonsSql, courseIds);
      lessonCounts.forEach(lc => {
        lessonCountMap[lc.course_id] = parseInt(lc.lesson_count || '0', 10);
      });
    }

    const formatted = enrollments.map(item => {
      const totalLessons = lessonCountMap[item.course_id] || 3; // default to 3 fallback if no syllabus defined yet
      return {
        enrollment_id: item.enrollment_id,
        completed_lessons: JSON.parse(item.completed_lessons || '[]'),
        quiz_score: item.quiz_score,
        completed_at: item.completed_at,
        enrolled_at: item.enrolled_at,
        total_lessons: totalLessons,
        course: {
          id: item.course_id,
          title: item.title,
          description: item.description,
          thumbnail_url: item.thumbnail_url,
          category: item.category,
          difficulty: item.difficulty,
          duration: item.duration,
          rating: item.rating,
          instructor_name: item.instructor_name
        }
      };
    });

    const countResult = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE student_id = ?', [studentId]);
    const total = countResult ? parseInt(countResult.count, 10) : 0;

    res.status(200).json({
      enrollments: formatted,
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

// ==========================================
// 3. JOB PORTAL CONTROLLERS (SAVED & APPLIED)
// ==========================================

export async function getSavedJobs(req, res, next) {
  try {
    const studentId = req.user.id;
    const sql = `
      SELECT s.id as saved_id, s.created_at as saved_at,
             j.id as job_id, j.company_name, j.company_logo, j.title, j.description, j.location, j.skills_required, j.salary_range, j.job_type
      FROM saved_jobs s
      JOIN jobs j ON s.job_id = j.id
      WHERE s.student_id = ?
    `;
    const rows = await db.all(sql, [studentId]);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getAppliedJobs(req, res, next) {
  try {
    const studentId = req.user.id;
    const sql = `
      SELECT a.id as application_id, a.resume_url, a.status, a.applied_at,
             j.id as job_id, j.company_name, j.company_logo, j.title, j.location, j.salary_range, j.job_type
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.student_id = ?
    `;
    const rows = await db.all(sql, [studentId]);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function toggleSaveJob(req, res, next) {
  try {
    const studentId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const exists = await db.get('SELECT id FROM saved_jobs WHERE student_id = ? AND job_id = ?', [studentId, jobId]);

    if (exists) {
      await db.run('DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?', [studentId, jobId]);
      return res.status(200).json({ saved: false, message: 'Job removed from saves' });
    } else {
      await db.run('INSERT INTO saved_jobs (id, student_id, job_id) VALUES (?, ?, ?)', [uuidv4(), studentId, jobId]);
      return res.status(200).json({ saved: true, message: 'Job saved successfully!' });
    }
  } catch (err) {
    next(err);
  }
}

export async function applyToJob(req, res, next) {
  try {
    const studentId = req.user.id;
    const { jobId, resumeUrl } = req.body;

    if (!jobId || !resumeUrl) {
      return res.status(400).json({ message: 'jobId and resumeUrl are required' });
    }

    const alreadyApplied = await db.get('SELECT id FROM applications WHERE student_id = ? AND job_id = ?', [studentId, jobId]);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this position' });
    }

    await db.run(
      'INSERT INTO applications (id, job_id, student_id, resume_url, status) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), jobId, studentId, resumeUrl, 'Applied']
    );

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. CERTIFICATE CONTROLLERS
// ==========================================

export async function getCertificates(req, res, next) {
  try {
    const studentId = req.user.id;
    const sql = 'SELECT * FROM certificates WHERE student_id = ? ORDER BY completion_date DESC';
    const rows = await db.all(sql, [studentId]);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 5. NOTIFICATION CONTROLLERS
// ==========================================

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    const rows = await db.all(sql, [userId]);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { notificationId } = req.body;

    if (notificationId) {
      await db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, userId]);
    } else {
      await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    }

    res.status(200).json({ message: 'Notifications updated successfully!' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 6. SETTINGS CONTROLLERS
// ==========================================

export async function updateSettings(req, res, next) {
  try {
    const userId = req.user.id;
    const { email, currentPassword, newPassword } = req.body;

    if (email) {
      const emailExists = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase().trim(), userId]);
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already registered by another account' });
      }
      await db.run('UPDATE users SET email = ? WHERE id = ?', [email.toLowerCase().trim(), userId]);
    }

    if (currentPassword && newPassword) {
      const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res.status(400).json({ message: 'Current password provided is incorrect' });
      }

      const hashedNew = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNew, userId]);
    }

    res.status(200).json({ message: 'Account settings updated successfully!' });
  } catch (err) {
    next(err);
  }
}
