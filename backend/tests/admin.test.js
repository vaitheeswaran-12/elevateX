import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import seed from '../src/config/seed_data.js';

describe('AscendIQ Admin Control Panel Endpoints', () => {
  let adminToken = '';
  let studentToken = '';
  let targetUserId = 'u_student_1';
  let targetCourseId = 'c_1';
  let targetJobId = 'j_1';

  beforeAll(async () => {
    // Re-seed database cleanly before tests start
    await seed();

    // Authenticate Admin to obtain Bearer Token
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ascendiq.com', password: 'securepassword' });
    adminToken = adminRes.body.token;

    // Authenticate Non-Admin to verify authorization guards
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@ascendiq.com', password: 'securepassword' });
    studentToken = studentRes.body.token;
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Authorization Guards', () => {
    it('Should reject requests without any authentication token', async () => {
      const res = await request(app).get('/api/admin/overview');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is required/i);
    });

    it('Should reject requests with non-admin authentication credentials', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Forbidden/i);
    });
  });

  describe('GET /api/admin/overview', () => {
    it('Should retrieve system KPIs and overview metrics for authenticated admins', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalUsers');
      expect(res.body).toHaveProperty('activeStudents');
      expect(res.body).toHaveProperty('activeInstructors');
      expect(res.body).toHaveProperty('totalCourses');
      expect(res.body).toHaveProperty('totalJobs');
      expect(res.body).toHaveProperty('revenueOverview');
      expect(res.body).toHaveProperty('recentLogs');
      expect(Array.isArray(res.body.recentLogs)).toBe(true);
    });
  });

  describe('GET /api/admin/analytics', () => {
    it('Should retrieve historical analytics data for trends graphs', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('growth');
      expect(res.body).toHaveProperty('dauTrend');
      expect(res.body).toHaveProperty('enrollmentsByCategory');
    });
  });

  describe('User Accounts Management', () => {
    it('Should fetch a paginated list of users', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('total');
      expect(res.body.users.length).toBeLessThanOrEqual(5);
    });

    it('Should filter users by role successfully', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=instructor')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.users.forEach(u => {
        expect(u.role).toBe('instructor');
      });
    });

    it('Should update user details and trigger an audit entry', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Verified Learner',
          email: 'student@ascendiq.com',
          role: 'student',
          is_verified: 1,
          is_active: 1,
          is_banned: 0
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/updated successfully/i);

      // Verify DB update
      const dbUser = await db.get('SELECT name FROM users WHERE id = ?', [targetUserId]);
      expect(dbUser.name).toBe('Jane Verified Learner');
    });

    it('Should force a user password reset successfully', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${targetUserId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: 'newSecurePassword123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reset completed successfully/i);
    });

    it('Should refuse self-deletion to prevent administrative lockouts', async () => {
      // Find admin user ID
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      const myId = meRes.body.user.id;

      const res = await request(app)
        .delete(`/api/admin/users/${myId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Self-deletion.*forbidden/i);
    });
  });

  describe('Courses Moderation & Management', () => {
    it('Should get a list of courses with filtering', async () => {
      const res = await request(app)
        .get('/api/admin/courses?approval_status=Approved')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('courses');
    });

    it('Should update course moderation status', async () => {
      const res = await request(app)
        .put(`/api/admin/courses/${targetCourseId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approval_status: 'Rejected' });

      expect(res.status).toBe(200);

      const dbCourse = await db.get('SELECT approval_status FROM courses WHERE id = ?', [targetCourseId]);
      expect(dbCourse.approval_status).toBe('Rejected');
    });

    it('Should toggle Featured setting on courses', async () => {
      const res = await request(app)
        .put(`/api/admin/courses/${targetCourseId}/feature`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_featured: true });

      expect(res.status).toBe(200);

      const dbCourse = await db.get('SELECT is_featured FROM courses WHERE id = ?', [targetCourseId]);
      expect(dbCourse.is_featured).toBe(1);
    });
  });

  describe('Jobs Board Moderation', () => {
    it('Should list job opportunities with filtering options', async () => {
      const res = await request(app)
        .get('/api/admin/jobs?is_flagged=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('jobs');
    });

    it('Should update job moderation status', async () => {
      const res = await request(app)
        .put(`/api/admin/jobs/${targetJobId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approval_status: 'Approved' });

      expect(res.status).toBe(200);
    });

    it('Should toggle flagging on jobs with explanation reasons', async () => {
      const res = await request(app)
        .put(`/api/admin/jobs/${targetJobId}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_flagged: true, flag_reason: 'Suspicious remote job coordinates' });

      expect(res.status).toBe(200);

      const dbJob = await db.get('SELECT is_flagged, flag_reason FROM jobs WHERE id = ?', [targetJobId]);
      expect(dbJob.is_flagged).toBe(1);
      expect(dbJob.flag_reason).toBe('Suspicious remote job coordinates');
    });
  });

  describe('Credentials Verification & Revocation', () => {
    it('Should query list of issued certificates', async () => {
      const res = await request(app)
        .get('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('certificates');
    });

    it('Should toggle certificate revocation successfully', async () => {
      const res = await request(app)
        .put('/api/admin/certificates/cert_1/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_revoked: true });

      expect(res.status).toBe(200);

      const dbCert = await db.get('SELECT is_revoked FROM certificates WHERE id = ?', ['cert_1']);
      expect(dbCert.is_revoked).toBe(1);
    });
  });

  describe('Administrative Action Auditing & Systems Configuration', () => {
    it('Should fetch administrative system audit logs', async () => {
      const res = await request(app)
        .get('/api/admin/logs?action_type=USER_UPDATE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('logs');
      expect(res.body.logs.length).toBeGreaterThanOrEqual(1);
    });

    it('Should retrieve current Platform Settings', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('settings');
      expect(res.body.settings.platform_name).toBe('AscendIQ');
    });

    it('Should apply batch settings and template updates successfully', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          platform_name: 'AscendIQ Enterprises',
          maintenance_mode: 'true'
        });

      expect(res.status).toBe(200);

      const dbSetting = await db.get("SELECT value FROM system_settings WHERE key = 'platform_name'");
      expect(dbSetting.value).toBe('AscendIQ Enterprises');
    });
  });
});
