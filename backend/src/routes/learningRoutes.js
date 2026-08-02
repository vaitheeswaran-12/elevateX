import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getCoursePlayerDetails,
  markLessonComplete,
  getLessonNotes,
  saveLessonNotes,
  getQuizQuestions,
  submitQuizAnswers,
  submitAssignment,
  getAssignmentHistory,
  verifyCertificateById
} from '../controllers/learningController.js';

const router = express.Router();

// 1. Cryptographic certificates verification ledger is PUBLIC (does not require login)
router.get('/certificates/verify/:id', verifyCertificateById);

// Every other progress tracking endpoint requires secure JWT login and student roles
router.use(authenticate);
router.use(authorize('student'));

// Course progress map details
router.get('/course/:courseId', getCoursePlayerDetails);
router.post('/lesson/:lessonId/complete', markLessonComplete);

// Notes manager
router.get('/lesson/:lessonId/notes', getLessonNotes);
router.post('/lesson/:lessonId/notes', saveLessonNotes);

// Quiz Player engine
router.get('/quiz/:quizId', getQuizQuestions);
router.post('/quiz/:quizId/submit', submitQuizAnswers);

// Assignments Submissions Panel
router.post('/assignment/:assignmentId/submit', submitAssignment);
router.get('/assignment/:assignmentId/history', getAssignmentHistory);

export default router;
