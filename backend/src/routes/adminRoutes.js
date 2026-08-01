import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getOverview,
  getAnalytics,
  getUsers,
  updateUser,
  resetPassword,
  deleteUser,
  getCourses,
  updateCourseStatus,
  toggleCourseFeatured,
  updateCourse,
  deleteCourse,
  getJobs,
  updateJobStatus,
  toggleJobFlag,
  deleteJob,
  getCertificates,
  verifyCertificate,
  toggleRevokeCertificate,
  getAuditLogs,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';

const router = express.Router();

// All administrative endpoints require valid JWT credentials with 'admin' privileges
router.use(authenticate);
router.use(authorize(['admin']));

// 1. Analytics & High-level overview
router.get('/overview', getOverview);
router.get('/analytics', getAnalytics);

// 2. User Accounts Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/users/:id/reset-password', resetPassword);
router.delete('/users/:id', deleteUser);

// 3. Courses Moderation & Management
router.get('/courses', getCourses);
router.put('/courses/:id/status', updateCourseStatus);
router.put('/courses/:id/feature', toggleCourseFeatured);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// 4. Jobs Board Audit & Management
router.get('/jobs', getJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.put('/jobs/:id/flag', toggleJobFlag);
router.delete('/jobs/:id', deleteJob);

// 5. Credentials Verification & History
router.get('/certificates', getCertificates);
router.get('/certificates/verify', verifyCertificate);
router.put('/certificates/:id/revoke', toggleRevokeCertificate);

// 6. Security & Administrative Audit Logs
router.get('/logs', getAuditLogs);

// 7. System & SaaS Configurations
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
