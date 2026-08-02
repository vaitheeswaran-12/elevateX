import request from 'supertest';
import app from '../src/app.js';
import seed from '../src/config/seed_data.js';

describe('ElevateX Recruiter Dashboard APIs', () => {
  let recruiterToken = '';
  let studentToken = '';

  beforeAll(async () => {
    try {
      await seed();

      // Login as recruiter
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'recruiter@ascendiq.com',
          password: 'securepassword'
        });
      recruiterToken = res.body.token;

      // Login as student
      const studentRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@ascendiq.com',
          password: 'securepassword'
        });
      studentToken = studentRes.body.token;
    } catch (err) {
      console.error('Recruiter test login preparation failed:', err);
    }
  });

  test('GET /api/recruiter/profile - Should retrieve seeded company profile info', async () => {
    const res = await request(app)
      .get('/api/recruiter/profile')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('company_name');
    expect(res.body.company_name).toEqual('NeuralCorp Systems');
    expect(res.body.headquarters).toEqual('San Francisco, CA');
  });

  test('PUT /api/recruiter/profile - Should successfully modify company fields', async () => {
    const res = await request(app)
      .put('/api/recruiter/profile')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        company_name: 'NeuralCorp sovereign AI',
        website: 'https://sovereign.neuralcorp.systems',
        about: 'Premium decentralized cognitive loops and AI architectures.',
        company_size: '500+ employees',
        headquarters: 'Miami, FL'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('updated successfully');

    // Confirm changes saved
    const verify = await request(app)
      .get('/api/recruiter/profile')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(verify.body.company_name).toEqual('NeuralCorp sovereign AI');
    expect(verify.body.company_size).toEqual('500+ employees');
    expect(verify.body.headquarters).toEqual('Miami, FL');
  });

  test('GET /api/recruiter/jobs - Should list active company job listings with pagination', async () => {
    const res = await request(app)
      .get('/api/recruiter/jobs?page=1&limit=5')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('jobs');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.jobs)).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
    expect(res.body.pagination.total).toBe(3);
  });

  test('POST /api/recruiter/jobs - Should successfully publish a new Job opportunity', async () => {
    const res = await request(app)
      .post('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Sovereign AI Core Architect',
        description: 'Design deep learning optimization modules, kernels, and CUDA operations.',
        location: 'San Jose, CA',
        skills_required: 'Python, PyTorch, CUDA, C++',
        salary_range: '$200,000 - $260,000',
        job_type: 'Job',
        experience_level: 'Senior Level',
        employment_type: 'Full-time',
        workplace_type: 'Hybrid',
        status: 'Published'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('jobId');
    expect(res.body.message).toContain('published successfully');
  });

  test('GET /api/recruiter/applicants - Should retrieve candidates list and calculate dynamic skills-matching index', async () => {
    const res = await request(app)
      .get('/api/recruiter/applicants')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('candidates');
    expect(Array.isArray(res.body.candidates)).toBe(true);
    expect(res.body.candidates.length).toBeGreaterThan(0);

    const first = res.body.candidates[0];
    expect(first).toHaveProperty('matchScore');
    expect(first.matchScore).toBeGreaterThanOrEqual(0);
    expect(first.candidate_name).toEqual('Jane Learner');
  });

  test('POST /api/recruiter/applicants/status - Should transition workflow of applicant and trigger automated alert notification', async () => {
    // 1. Get first candidate to get application_id
    const listRes = await request(app)
      .get('/api/recruiter/applicants')
      .set('Authorization', `Bearer ${recruiterToken}`);
    const appId = listRes.body.candidates[0].application_id;

    // 2. Transition status to Interviewing
    const res = await request(app)
      .post('/api/recruiter/applicants/status')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        application_id: appId,
        status: 'Interviewing'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.next_status).toEqual('Interviewing');

    // 3. Confirm student received the notification
    const notifRes = await request(app)
      .get('/api/student/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(notifRes.statusCode).toEqual(200);
    const hasStatusNotif = notifRes.body.some(n => n.title.includes('Application Update') && n.message.includes('Interviewing'));
    expect(hasStatusNotif).toBe(true);
  });

  test('GET /api/recruiter/analytics - Should retrieve pipeline aggregates and job response metrics', async () => {
    const res = await request(app)
      .get('/api/recruiter/analytics')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('funnel');
    expect(res.body).toHaveProperty('jobPerformance');
    expect(res.body.summary.totalApplicants).toBeGreaterThan(0);
    expect(Array.isArray(res.body.funnel)).toBe(true);
  });

  test('POST /api/recruiter/jobs/:id/duplicate - Should duplicate job as a draft with (Copy) title', async () => {
    const list = await request(app)
      .get('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`);
    const jobId = list.body.jobs[0].id;

    const res = await request(app)
      .post(`/api/recruiter/jobs/${jobId}/duplicate`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('jobId');
    expect(res.body.message).toContain('duplicated successfully');
  });

  test('POST /api/recruiter/jobs/:id/clone - Should clone job as a draft with (Clone) title', async () => {
    const list = await request(app)
      .get('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`);
    const jobId = list.body.jobs[0].id;

    const res = await request(app)
      .post(`/api/recruiter/jobs/${jobId}/clone`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('jobId');
    expect(res.body.message).toContain('cloned successfully');
  });

  test('PUT /api/recruiter/jobs/:id/archive - Should mark status as Archived', async () => {
    const list = await request(app)
      .get('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`);
    const jobId = list.body.jobs[0].id;

    const res = await request(app)
      .put(`/api/recruiter/jobs/${jobId}/archive`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('archived successfully');
  });

  test('POST /api/recruiter/jobs/bulk-publish and bulk-delete - Should perform batch updates', async () => {
    // 1. Publish 2 jobs (one duplicated, one cloned)
    const list = await request(app)
      .get('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`);

    // Pick draft/copied jobs
    const idsToPublish = list.body.jobs.filter(j => j.status === 'Draft').map(j => j.id);

    if (idsToPublish.length > 0) {
      const resPub = await request(app)
        .post('/api/recruiter/jobs/bulk-publish')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ jobIds: idsToPublish });

      expect(resPub.statusCode).toEqual(200);
      expect(resPub.body.message).toContain('Successfully published');

      // 2. Delete those same jobs in bulk
      const resDel = await request(app)
        .post('/api/recruiter/jobs/bulk-delete')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ jobIds: idsToPublish });

      expect(resDel.statusCode).toEqual(200);
      expect(resDel.body.message).toContain('Successfully deleted');
    }
  });
});
