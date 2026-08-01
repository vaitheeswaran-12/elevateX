import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import seed from '../src/config/seed_data.js';

describe('AscendIQ Instructor Dashboard APIs', () => {
  let instructorToken = '';

  beforeAll(async () => {
    try {
      // Seed to restore deterministic records
      await seed();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah@ascendiq.com',
          password: 'securepassword'
        });
      instructorToken = res.body.token;
    } catch (err) {
      console.error('Test preparation login failed:', err);
    }
  });

  test('GET /api/instructor/courses - Should retrieve instructor course catalogue', async () => {
    const res = await request(app)
      .get('/api/instructor/courses?page=1&limit=5')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('courses');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThan(0);
    expect(res.body.pagination.page).toEqual(1);
  });

  test('POST /api/instructor/courses - Should successfully construct a Course draft', async () => {
    const res = await request(app)
      .post('/api/instructor/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Deep Learning with PyTorch',
        description: 'Tackle neural network parameters, forward passes, and backwards gradients.',
        category: 'AI & Machine Learning',
        difficulty: 'Advanced',
        duration: '15 Hours'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('courseId');
    expect(res.body.message).toContain('Course draft created');
  });

  test('POST /api/instructor/modules - Should create module under course', async () => {
    const res = await request(app)
      .post('/api/instructor/modules')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: 'c_1',
        title: 'Module 3: Generative Adversarial Networks',
        sort_order: 3
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('moduleId');
  });

  test('POST /api/instructor/lessons - Should append lesson under module', async () => {
    const res = await request(app)
      .post('/api/instructor/lessons')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        module_id: 'm_1',
        title: 'Discriminator & Generator Training Loops',
        duration: '18:15',
        sort_order: 3,
        is_preview: true
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('lessonId');
  });

  test('POST /api/instructor/quizzes - Should configure quiz assessment', async () => {
    const res = await request(app)
      .post('/api/instructor/quizzes')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: 'c_1',
        title: 'Transformers midterm exam',
        timer_minutes: 20,
        passing_percentage: 85,
        randomize_questions: true
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('quizId');
  });

  test('GET /api/instructor/students - Should list enrolled students tracking details', async () => {
    const res = await request(app)
      .get('/api/instructor/students')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].student_name).toEqual('Jane Learner');
    expect(res.body[0].completion_percentage).toBeGreaterThan(0);
  });

  test('GET /api/instructor/analytics - Should retrieve summary reports', async () => {
    const res = await request(app)
      .get('/api/instructor/analytics')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('charts');
    expect(res.body.summary.totalStudents).toBeGreaterThan(0);
  });
});
