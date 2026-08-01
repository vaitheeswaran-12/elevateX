import express from 'express';
import {
  getProfile,
  updateProfile,
  getEnrolledCourses,
  getSavedJobs,
  getAppliedJobs,
  toggleSaveJob,
  applyToJob,
  getCertificates,
  getNotifications,
  markNotificationRead,
  updateSettings
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply student-specific middleware protection
router.use(authenticate);
router.use(authorize('student'));

// Profile APIs
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Course Tracking APIs
router.get('/courses', getEnrolledCourses);

// Job Portal interactions
router.get('/jobs/saved', getSavedJobs);
router.get('/jobs/applied', getAppliedJobs);
router.post('/jobs/save-toggle', toggleSaveJob);
router.post('/jobs/apply', applyToJob);

// Verifiable Certificates
router.get('/certificates', getCertificates);

// Notifications System
router.get('/notifications', getNotifications);
router.post('/notifications/read', markNotificationRead);

// Personal Account Security Settings
router.put('/settings', updateSettings);

export default router;
