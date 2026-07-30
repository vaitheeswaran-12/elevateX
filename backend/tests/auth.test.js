import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';

describe('AscendIQ JWT Authentication Endpoints', () => {
  // Clear any existing test user before starting
  beforeAll(async () => {
    try {
      await db.run("DELETE FROM users WHERE email IN ('test_user@ascendiq.com', 'google_test_user@gmail.com')");
    } catch (err) {
      console.error(err);
    }
  });

  let testUserToken = '';
  let verificationToken = '';

  test('POST /api/auth/register - Should register a new student user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'test_user@ascendiq.com',
        password: 'securePassword123',
        role: 'student'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('test_user@ascendiq.com');
    expect(res.body.user.role).toEqual('student');
    expect(res.body.user.is_verified).toEqual(0);
    expect(res.body.user).toHaveProperty('verification_token');

    testUserToken = res.body.token;
    verificationToken = res.body.user.verification_token;
  });

  test('POST /api/auth/register - Should reject registration with an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Name',
        email: 'test_user@ascendiq.com',
        password: 'anotherPassword',
        role: 'student'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('already registered');
  });

  test('GET /api/auth/verify-email - Should verify email address successfully', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email?token=${verificationToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('verified successfully');
  });

  test('POST /api/auth/login - Should successfully log in', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_user@ascendiq.com',
        password: 'securePassword123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.is_verified).toEqual(1);
  });

  test('POST /api/auth/google - Should authenticate/register google user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        email: 'google_test_user@gmail.com',
        name: 'Google Test User',
        role: 'student'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('google_test_user@gmail.com');
  });

  test('GET /api/auth/me - Should retrieve active authenticated user session details', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.email).toEqual('test_user@ascendiq.com');
    expect(res.body).toHaveProperty('profile');
  });

  test('GET /api/auth/me - Should reject request with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.statusCode).toEqual(401);
  });
});
