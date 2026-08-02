import express from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  listRecruiterJobs,
  createJob,
  updateJob,
  deleteJob,
  getApplicants,
  updateCandidateStatus,
  getHiringAnalytics,
  duplicateJob,
  cloneJob,
  archiveJob,
  bulkPublishJobs,
  bulkDeleteJobs
} from '../controllers/recruiterController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Recruiter Protection layer
router.use(authenticate);
router.use(authorize('recruiter'));

// 1. Company Profiles
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

// 2. Job Listings Management
router.get('/jobs', listRecruiterJobs);
router.post('/jobs', createJob);
router.post('/jobs/bulk-publish', bulkPublishJobs);
router.post('/jobs/bulk-delete', bulkDeleteJobs);
router.post('/jobs/:jobId/duplicate', duplicateJob);
router.post('/jobs/:jobId/clone', cloneJob);
router.put('/jobs/:jobId/archive', archiveJob);
router.put('/jobs/:jobId', updateJob);
router.delete('/jobs/:jobId', deleteJob);

// 3. Applicants pipeline
router.get('/applicants', getApplicants);
router.post('/applicants/status', updateCandidateStatus);

// 4. Hiring Analytics
router.get('/analytics', getHiringAnalytics);

export default router;
