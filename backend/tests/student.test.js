import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';

import seed from '../src/config/seed_data.js';

describe('AscendIQ Student Dashboard APIs', () => {
  let studentToken = '';

  // Retrieve active token by logging in as the seeded student before testing
  beforeAll(async () => {
    try {
      // Re-seed database before test run to ensure complete determinism
      await seed();
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@ascendiq.com',
          password: 'securepassword'
        });
      studentToken = res.body.token;
    } catch (err) {
      console.error('Test login preparation failed:', err);
    }
  });

  test('GET /api/student/profile - Should retrieve seeded student profile successfully', async () => {
    const res = await request(app)
      .get('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('profile');
    expect(res.body.user.email).toEqual('student@ascendiq.com');
    expect(res.body.profile.about).toContain('neural architecture');
    expect(Array.isArray(res.body.profile.skills)).toBe(true);
    expect(res.body.profile.skills).toContain('PyTorch');
  });

  test('PUT /api/student/profile - Should update student profile details successfully', async () => {
    const res = await request(app)
      .put('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        about: 'Highly updated about section for Stanford senior developer.',
        skills: ['Python', 'React', 'C++', 'TensorFlow'],
        github_url: 'https://github.com/new-student'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('Profile updated successfully');

    // Re-fetch to ensure the update was committed to database correctly
    const checkRes = await request(app)
      .get('/api/student/profile')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(checkRes.body.profile.about).toEqual('Highly updated about section for Stanford senior developer.');
    expect(checkRes.body.profile.skills).toContain('TensorFlow');
  });

  test('GET /api/student/courses - Should retrieve active student course enrollments', async () => {
    const res = await request(app)
      .get('/api/student/courses')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('enrollments');
    expect(Array.isArray(res.body.enrollments)).toBe(true);
    expect(res.body.enrollments.length).toBeGreaterThan(0);
    // Let's assert against any valid seeded course title
    const hasGenerativeTitle = res.body.enrollments.some(e => e.course.title.includes('Generative AI'));
    expect(hasGenerativeTitle).toBe(true);
  });

  test('GET /api/student/jobs/saved - Should retrieve saved jobs', async () => {
    const res = await request(app)
      .get('/api/student/jobs/saved')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].company_name).toEqual('NimbusScale Systems');
  });

  test('POST /api/student/jobs/save-toggle - Should toggle save status for job', async () => {
    // Unsave the job (j_3) that is currently saved by default
    const unsaveRes = await request(app)
      .post('/api/student/jobs/save-toggle')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: 'j_3' });

    expect(unsaveRes.statusCode).toEqual(200);
    expect(unsaveRes.body.saved).toBe(false);

    // Re-save the same job (j_3)
    const saveRes = await request(app)
      .post('/api/student/jobs/save-toggle')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: 'j_3' });

    expect(saveRes.statusCode).toEqual(200);
    expect(saveRes.body.saved).toBe(true);
  });

  test('GET /api/student/certificates - Should retrieve earned certifications list', async () => {
    const res = await request(app)
      .get('/api/student/certificates')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].certificate_id).toEqual('AI-CERT-98234-2026');
  });

  test('GET /api/student/notifications - Should retrieve all alert events', async () => {
    const res = await request(app)
      .get('/api/student/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(3);
  });

  test('POST /api/student/notifications/read - Should mark notifications as read successfully', async () => {
    const res = await request(app)
      .post('/api/student/notifications/read')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ notificationId: 'n_1' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('updated successfully');
  });

  test('PUT /api/student/settings - Should fail when updating with invalid password', async () => {
    const res = await request(app)
      .put('/api/student/settings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        currentPassword: 'wrong_password',
        newPassword: 'myNewSuperPassword123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('incorrect');
  });
});
