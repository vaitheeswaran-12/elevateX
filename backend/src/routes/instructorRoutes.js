import express from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  createLesson,
  updateLessonsOrder
} from '../controllers/instructorCourseController.js';
import {
  createQuiz,
  createQuizQuestion,
  createAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentsList,
  getAnalytics,
  getReviews,
  replyToReview
} from '../controllers/instructorAssessmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce standard instructor credentials protection
router.use(authenticate);
router.use(authorize('instructor'));

// 1. Course management routes
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Modules and lessons curriculum builder
router.post('/modules', createModule);
router.post('/lessons', createLesson);
router.put('/lessons/sort', updateLessonsOrder);

// 2. Quiz Builders
router.post('/quizzes', createQuiz);
router.post('/quizzes/questions', createQuizQuestion);

// 3. Assignment configurations and evaluations
router.post('/assignments', createAssignment);
router.get('/assignments/submissions', getAssignmentSubmissions);
router.put('/assignments/submissions/:submissionId/grade', gradeSubmission);

// 4. Students analytics trackers
router.get('/students', getStudentsList);

// 5. Earnings and enrollments metrics
router.get('/analytics', getAnalytics);

// 6. Interactive student feedback replies
router.get('/reviews', getReviews);
router.post('/reviews/reply', replyToReview);

export default router;
