import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import seed from '../src/config/seed_data.js';

describe('AscendIQ Course Learning Engine & Progress APIs', () => {
  let studentToken = '';
  let nonEnrolledToken = '';
  let enrolledStudentId = 'u_student_1';
  let nonEnrolledStudentId = '';
  let courseId = 'c_1';
  let lessonId = 'l_1';
  let quizId = 'q_1';
  let assignmentId = 'asg_1';

  beforeAll(async () => {
    // Fresh high-fidelity seed before testing begins
    await seed();

    // 1. Authenticate Enrolled Student (student@ascendiq.com is seeded and enrolled in c_1)
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@ascendiq.com', password: 'securepassword' });
    studentToken = studentRes.body.token;

    // 2. Create and authenticate a new non-enrolled student to check security guards
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Unenrolled Student',
        email: 'unenrolled@ascendiq.com',
        password: 'securepassword',
        role: 'student'
      });
    nonEnrolledToken = registerRes.body.token;
    nonEnrolledStudentId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Course Player Security Guards & Course Details', () => {
    it('Should reject learning access requests if the student is not enrolled', async () => {
      const res = await request(app)
        .get(`/api/learning/course/${courseId}`)
        .set('Authorization', `Bearer ${nonEnrolledToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Must enroll/i);
    });

    it('Should retrieve full course modules, video lessons, resources, and progress for enrolled students', async () => {
      const res = await request(app)
        .get(`/api/learning/course/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('course');
      expect(res.body).toHaveProperty('enrollment');
      expect(res.body).toHaveProperty('modules');
      expect(Array.isArray(res.body.modules)).toBe(true);
      expect(res.body.modules[0].lessons.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('quizzes');
      expect(res.body).toHaveProperty('assignments');
    });
  });

  describe('Lesson Completions & Progress Trackers', () => {
    it('Should successfully mark a lesson as completed', async () => {
      const res = await request(app)
        .post(`/api/learning/lesson/${lessonId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/marked as complete/i);
      expect(res.body.completed_lessons).toContain(lessonId);
    });
  });

  describe('Personal Lesson Notes manager', () => {
    it('Should successfully create or overwrite personal notes for a lesson', async () => {
      const res = await request(app)
        .post(`/api/learning/lesson/${lessonId}/notes`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ note_text: 'My custom PyTorch attention weights notes!' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/notes updated successfully/i);
    });

    it('Should retrieve saved personal notes for a lesson', async () => {
      const res = await request(app)
        .get(`/api/learning/lesson/${lessonId}/notes`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notes).toBe('My custom PyTorch attention weights notes!');
    });
  });

  describe('Quiz Engine & Evaluation', () => {
    it('Should load quiz metadata and list of questions without leaking the correct answer index', async () => {
      const res = await request(app)
        .get(`/api/learning/quiz/${quizId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quiz');
      expect(res.body).toHaveProperty('questions');
      res.body.questions.forEach(q => {
        expect(q).not.toHaveProperty('correct_option_index');
      });
    });

    it('Should evaluate submitted multiple-choice answers, log score, and trigger certificate generation on pass', async () => {
      // Submitting correct options (qq_1: 1, qq_2: 0, qq_3: 2) -> 100% score (Pass >= 70)
      const res = await request(app)
        .post(`/api/learning/quiz/${quizId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: {
            "qq_1": 1,
            "qq_2": 0,
            "qq_3": 2
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(100);
      expect(res.body.passed).toBe(true);

      // Verify certificate auto generation in DB
      const cert = await db.get('SELECT * FROM certificates WHERE student_id = ? AND course_id = ?', [enrolledStudentId, courseId]);
      expect(cert).toBeTruthy();
      expect(cert.student_name).toBe('Jane Learner');
    });
  });

  describe('Assignments submissions', () => {
    it('Should submit homework file link successfully', async () => {
      const res = await request(app)
        .post(`/api/learning/assignment/${assignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          fileUrl: 'https://supabase.storage.com/jane/decoder_block.py',
          submissionText: 'Optimized multi-head query-key-value decoders completed!'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/submitted successfully/i);
    });

    it('Should retrieve submissions history with grade and feedback indicators', async () => {
      const res = await request(app)
        .get(`/api/learning/assignment/${assignmentId}/history`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].file_url).toBe('https://supabase.storage.com/jane/decoder_block.py');
    });
  });

  describe('Cryptographic Certificates Verification Portal (Public)', () => {
    it('Should publicly verify a genuine, unrevoked certificate without requiring login coordinates', async () => {
      // Fetch cert ID from DB
      const dbCert = await db.get('SELECT certificate_id FROM certificates WHERE student_id = ?', [enrolledStudentId]);
      const certIdCode = dbCert.certificate_id;

      const res = await request(app)
        .get(`/api/learning/certificates/verify/${certIdCode}`);

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.certificate.student_name).toBe('Jane Learner');
    });

    it('Should reject verification queries for invalid certificate ID codes', async () => {
      const res = await request(app)
        .get('/api/learning/certificates/verify/FAKE-ID-999');

      expect(res.status).toBe(404);
      expect(res.body.verified).toBe(false);
      expect(res.body.message).toMatch(/No active, authentic credential/i);
    });
  });
});
