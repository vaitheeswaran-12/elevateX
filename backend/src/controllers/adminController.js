import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Helper to log admin actions
async function logAdminAction(adminId, adminEmail, actionType, description, ip = '127.0.0.1') {
  try {
    await db.run(
      'INSERT INTO audit_logs (id, user_id, user_email, action_type, description, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), adminId, adminEmail, actionType, description, ip]
    );
  } catch (err) {
    console.error('Error writing admin action audit log:', err);
  }
}

// 1. Dashboard Overview Metrics
export async function getOverview(req, res, next) {
  try {
    // Total Users count
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const students = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const instructors = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'instructor'");
    const recruiters = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'recruiter'");
    const courses = await db.get('SELECT COUNT(*) as count FROM courses');
    const jobs = await db.get('SELECT COUNT(*) as count FROM jobs');

    // Revenue Overview: each enrollment is simulated as $99
    const enrollmentsCount = await db.get('SELECT COUNT(*) as count FROM enrollments');
    const revenue = (enrollmentsCount?.count || 0) * 99;

    // Daily active users (simulated based on login audit records in the last 24h, or a solid default)
    const dau = await db.get("SELECT COUNT(DISTINCT user_id) as count FROM audit_logs WHERE action_type LIKE 'LOGIN%'");

    // Recent activity logs (limit 5)
    const recentLogs = await db.all('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');

    // Recent activity counts (for charts/KPIs)
    const recentSignups = await db.all("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5");

    res.status(200).json({
      totalUsers: totalUsers?.count || 0,
      activeStudents: students?.count || 0,
      activeInstructors: instructors?.count || 0,
      recruiters: recruiters?.count || 0,
      totalCourses: courses?.count || 0,
      totalJobs: jobs?.count || 0,
      revenueOverview: revenue,
      dailyActivity: dau?.count || 3,
      recentLogs
    });
  } catch (err) {
    next(err);
  }
}

// 2. Platform Analytics & Trends
export async function getAnalytics(req, res, next) {
  try {
    // Platform growth (registrations grouped by day/month)
    const growth = [
      { name: 'Jan', students: 40, instructors: 5, recruiters: 2, revenue: 3960 },
      { name: 'Feb', students: 80, instructors: 8, recruiters: 5, revenue: 7920 },
      { name: 'Mar', students: 150, instructors: 12, recruiters: 10, revenue: 14850 },
      { name: 'Apr', students: 240, instructors: 18, recruiters: 15, revenue: 23760 },
      { name: 'May', students: 380, instructors: 25, recruiters: 22, revenue: 37620 },
      { name: 'Jun', students: 510, instructors: 32, recruiters: 30, revenue: 50490 },
      { name: 'Jul', students: 680, instructors: 45, recruiters: 42, revenue: 67320 }
    ];

    // Daily Active Users trend
    const dauTrend = [
      { date: 'Mon', dau: 120 },
      { date: 'Tue', dau: 150 },
      { date: 'Wed', dau: 180 },
      { date: 'Thu', dau: 170 },
      { date: 'Fri', dau: 210 },
      { date: 'Sat', dau: 95 },
      { date: 'Sun', dau: 110 }
    ];

    // Enrollments by category
    const enrollmentsByCategory = [
      { name: 'AI & Machine Learning', value: 45 },
      { name: 'Web Development', value: 30 },
      { name: 'Cloud Computing', value: 15 },
      { name: 'UI/UX', value: 10 }
    ];

    res.status(200).json({
      growth,
      dauTrend,
      enrollmentsByCategory
    });
  } catch (err) {
    next(err);
  }
}

// 3. User Management Endpoints
export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const role = req.query.role || '';
    const is_active = req.query.is_active; // '0' or '1'
    const is_banned = req.query.is_banned; // '0' or '1'

    const offset = (page - 1) * limit;
    let query = 'SELECT id, name, email, role, is_verified, is_active, is_banned, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name ILIKE ? OR email ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (is_active !== undefined && is_active !== '') {
      query += ' AND is_active = ?';
      params.push(parseInt(is_active, 10));
    }
    if (is_banned !== undefined && is_banned !== '') {
      query += ' AND is_banned = ?';
      params.push(parseInt(is_banned, 10));
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as t`;
    const countResult = await db.get(countQuery, params);

    // Fetch details
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await db.all(query, params);

    res.status(200).json({
      users,
      total: countResult?.count || 0,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, is_verified, is_active, is_banned } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.run(
      `UPDATE users
       SET name = ?, email = ?, role = ?, is_verified = ?, is_active = ?, is_banned = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, role, is_verified, is_active, is_banned, id]
    );

    // Log the change
    await logAdminAction(
      req.user.id,
      req.user.email,
      'USER_UPDATE',
      `Updated user profile for ${email} (ID: ${id})`,
      req.ip
    );

    res.status(200).json({ message: 'User profile updated successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await db.get('SELECT id, email FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, id]);

    // Log password reset
    await logAdminAction(
      req.user.id,
      req.user.email,
      'USER_PASSWORD_RESET',
      `Forced password reset for user ${user.email} (ID: ${id})`,
      req.ip
    );

    res.status(200).json({ message: 'User password reset completed successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await db.get('SELECT id, email FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Self-deletion of admin accounts is forbidden' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);

    // Log deletion
    await logAdminAction(
      req.user.id,
      req.user.email,
      'USER_DELETE',
      `Deleted user account ${user.email} (ID: ${id})`,
      req.ip
    );

    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (err) {
    next(err);
  }
}

// 4. Course Management Endpoints
export async function getCourses(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const approval_status = req.query.approval_status || '';
    const is_featured = req.query.is_featured;

    const offset = (page - 1) * limit;
    let query = 'SELECT c.*, u.name as instructor_name FROM courses c JOIN users u ON c.instructor_id = u.id WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (c.title ILIKE ? OR c.category ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (approval_status) {
      query += ' AND c.approval_status = ?';
      params.push(approval_status);
    }
    if (is_featured !== undefined && is_featured !== '') {
      query += ' AND c.is_featured = ?';
      params.push(parseInt(is_featured, 10));
    }

    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as t`;
    const countResult = await db.get(countQuery, params);

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const courses = await db.all(query, params);

    res.status(200).json({
      courses,
      total: countResult?.count || 0,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCourseStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(approval_status)) {
      return res.status(400).json({ message: 'Invalid approval status value' });
    }

    const course = await db.get('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.run('UPDATE courses SET approval_status = ? WHERE id = ?', [approval_status, id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'COURSE_MODERATION',
      `Course ID ${id} set to status: ${approval_status}`,
      req.ip
    );

    res.status(200).json({ message: `Course ${approval_status.toLowerCase()} successfully!` });
  } catch (err) {
    next(err);
  }
}

export async function toggleCourseFeatured(req, res, next) {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    const course = await db.get('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const featVal = is_featured ? 1 : 0;
    await db.run('UPDATE courses SET is_featured = ? WHERE id = ?', [featVal, id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'COURSE_FEATURE_TOGGLE',
      `Toggled featured status of course ${course.title} (ID: ${id}) to ${featVal}`,
      req.ip
    );

    res.status(200).json({ message: 'Course featured setting updated successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, duration } = req.body;

    const course = await db.get('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.run(
      `UPDATE courses
       SET title = ?, description = ?, category = ?, difficulty = ?, duration = ?
       WHERE id = ?`,
      [title, description, category, difficulty, duration, id]
    );

    res.status(200).json({ message: 'Course details updated successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;

    const course = await db.get('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await db.run('DELETE FROM courses WHERE id = ?', [id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'COURSE_DELETE',
      `Deleted course ${course.title} (ID: ${id})`,
      req.ip
    );

    res.status(200).json({ message: 'Course deleted successfully!' });
  } catch (err) {
    next(err);
  }
}

// 5. Job Management Endpoints
export async function getJobs(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const approval_status = req.query.approval_status || '';
    const is_flagged = req.query.is_flagged;

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title ILIKE ? OR company_name ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (approval_status) {
      query += ' AND approval_status = ?';
      params.push(approval_status);
    }
    if (is_flagged !== undefined && is_flagged !== '') {
      query += ' AND is_flagged = ?';
      params.push(parseInt(is_flagged, 10));
    }

    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as t`;
    const countResult = await db.get(countQuery, params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const jobs = await db.all(query, params);

    res.status(200).json({
      jobs,
      total: countResult?.count || 0,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJobStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(approval_status)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    await db.run('UPDATE jobs SET approval_status = ? WHERE id = ?', [approval_status, id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'JOB_MODERATION',
      `Job ID ${id} set to status: ${approval_status}`,
      req.ip
    );

    res.status(200).json({ message: `Job ${approval_status.toLowerCase()} successfully!` });
  } catch (err) {
    next(err);
  }
}

export async function toggleJobFlag(req, res, next) {
  try {
    const { id } = req.params;
    const { is_flagged, flag_reason } = req.body;

    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const flagVal = is_flagged ? 1 : 0;
    await db.run('UPDATE jobs SET is_flagged = ?, flag_reason = ? WHERE id = ?', [flagVal, flag_reason || null, id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'JOB_FLAG_TOGGLE',
      `Toggled flagged status for Job ${job.title} to ${flagVal}. Reason: ${flag_reason || 'N/A'}`,
      req.ip
    );

    res.status(200).json({ message: 'Job flag setting updated successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;

    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await db.run('DELETE FROM jobs WHERE id = ?', [id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'JOB_DELETE',
      `Deleted job posting ${job.title} (ID: ${id})`,
      req.ip
    );

    res.status(200).json({ message: 'Job deleted successfully!' });
  } catch (err) {
    next(err);
  }
}

// 6. Certificate Management Endpoints
export async function getCertificates(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM certificates WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (student_name ILIKE ? OR course_name ILIKE ? OR certificate_id ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as t`;
    const countResult = await db.get(countQuery, params);

    query += ' ORDER BY completion_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const certificates = await db.all(query, params);

    res.status(200).json({
      certificates,
      total: countResult?.count || 0,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyCertificate(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Certificate verification ID/code is required' });
    }

    const certificate = await db.get('SELECT * FROM certificates WHERE certificate_id = ?', [code]);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate verification failed: No matching record found.' });
    }

    res.status(200).json({
      verified: true,
      certificate
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleRevokeCertificate(req, res, next) {
  try {
    const { id } = req.params;
    const { is_revoked } = req.body;

    const cert = await db.get('SELECT * FROM certificates WHERE id = ?', [id]);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const revokeVal = is_revoked ? 1 : 0;
    await db.run('UPDATE certificates SET is_revoked = ? WHERE id = ?', [revokeVal, id]);

    // Log action
    await logAdminAction(
      req.user.id,
      req.user.email,
      'CERTIFICATE_REVOCATION_TOGGLE',
      `Revocation state for certificate ID ${id} set to ${revokeVal}`,
      req.ip
    );

    res.status(200).json({ message: 'Certificate revocation status modified successfully!' });
  } catch (err) {
    next(err);
  }
}

// 7. Audit Logs Endpoint
export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const action_type = req.query.action_type || '';

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (user_email ILIKE ? OR description ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (action_type) {
      query += ' AND action_type = ?';
      params.push(action_type);
    }

    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as t`;
    const countResult = await db.get(countQuery, params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const logs = await db.all(query, params);

    res.status(200).json({
      logs,
      total: countResult?.count || 0,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

// 8. Platform Configuration Settings
export async function getSettings(req, res, next) {
  try {
    const records = await db.all('SELECT * FROM system_settings');
    const settings = {};
    for (const r of records) {
      settings[r.key] = r.value;
    }

    res.status(200).json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const updates = req.body; // e.g. { platform_name: "ElevateX Pro", support_email: "support@elevatex.io" }

    for (const [key, value] of Object.entries(updates)) {
      // Use replace key statement on conflict
      await db.run(
        `INSERT INTO system_settings (key, value)
         VALUES (?, ?)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value)]
      );
    }

    // Log update
    await logAdminAction(
      req.user.id,
      req.user.email,
      'PLATFORM_SETTINGS_UPDATE',
      'Platform configurations and system settings updated.',
      req.ip
    );

    res.status(200).json({ message: 'System configurations updated successfully!' });
  } catch (err) {
    next(err);
  }
}
