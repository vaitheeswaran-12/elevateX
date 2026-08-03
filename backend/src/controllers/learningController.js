import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// 1. COURSE PLAYER & PROGRESS CONTROLLERS
// ==========================================

export async function getCoursePlayerDetails(req, res, next) {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Check if enrolled
    const enrollment = await db.get(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (!enrollment) {
      return res.status(403).json({ message: 'Forbidden: You must enroll in this course to access the Learning Player.' });
    }

    // Fetch course details
    const course = await db.get(
      `SELECT c.*, u.name as instructor_name
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.id = ?`,
      [courseId]
    );

    // Fetch modules
    const modules = await db.all(
      'SELECT * FROM course_modules WHERE course_id = ? ORDER BY sort_order ASC',
      [courseId]
    );

    // Fetch lessons for these modules
    const moduleIds = modules.map(m => m.id);
    let lessons = [];
    if (moduleIds.length > 0) {
      lessons = await db.all(
        `SELECT * FROM lessons
         WHERE module_id IN (${moduleIds.map(() => '?').join(',')})
         ORDER BY sort_order ASC`,
        moduleIds
      );
    }

    // Fetch Quizzes and Assignments for the course
    const quizzes = await db.all(
      'SELECT id, title, timer_minutes, passing_percentage FROM quizzes WHERE course_id = ?',
      [courseId]
    );

    const assignments = await db.all(
      'SELECT id, title, description, deadline FROM assignments WHERE course_id = ?',
      [courseId]
    );

    // Format module-lesson tree
    const formattedModules = modules.map(m => {
      return {
        ...m,
        lessons: lessons.filter(l => l.module_id === m.id).map(l => {
          return {
            ...l,
            resources: JSON.parse(l.resources || '[]')
          };
        })
      };
    });

    res.status(200).json({
      course,
      enrollment: {
        id: enrollment.id,
        completed_lessons: JSON.parse(enrollment.completed_lessons || '[]'),
        quiz_score: enrollment.quiz_score,
        completed_at: enrollment.completed_at
      },
      modules: formattedModules,
      quizzes,
      assignments
    });
  } catch (err) {
    next(err);
  }
}

export async function markLessonComplete(req, res, next) {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.params;

    // Resolve course_id from lesson module hierarchy
    const lesson = await db.get(
      `SELECT l.id, m.course_id
       FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE l.id = ?`,
      [lessonId]
    );

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson record not found.' });
    }

    const { course_id } = lesson;

    // Check enrollment
    const enrollment = await db.get(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to mark progress.' });
    }

    let completedList = JSON.parse(enrollment.completed_lessons || '[]');
    if (!completedList.includes(lessonId)) {
      completedList.push(lessonId);
    }

    await db.run(
      'UPDATE enrollments SET completed_lessons = ? WHERE id = ?',
      [JSON.stringify(completedList), enrollment.id]
    );

    res.status(200).json({
      message: 'Lesson marked as complete successfully!',
      completed_lessons: completedList
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. LESSON NOTES CONTROLLERS
// ==========================================

export async function getLessonNotes(req, res, next) {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.params;

    const note = await db.get(
      'SELECT * FROM student_notes WHERE student_id = ? AND lesson_id = ?',
      [studentId, lessonId]
    );

    res.status(200).json({ notes: note ? note.note_text : '' });
  } catch (err) {
    next(err);
  }
}

export async function saveLessonNotes(req, res, next) {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.params;
    const { note_text } = req.body;

    if (note_text === undefined) {
      return res.status(400).json({ message: 'note_text body parameter is required.' });
    }

    // Insert or update note text
    const exists = await db.get(
      'SELECT id FROM student_notes WHERE student_id = ? AND lesson_id = ?',
      [studentId, lessonId]
    );

    if (exists) {
      await db.run(
        'UPDATE student_notes SET note_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [note_text, exists.id]
      );
    } else {
      await db.run(
        'INSERT INTO student_notes (id, student_id, lesson_id, note_text) VALUES (?, ?, ?, ?)',
        [uuidv4(), studentId, lessonId, note_text]
      );
    }

    res.status(200).json({ message: 'Personal lesson notes updated successfully!' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. QUIZ ENGINE CONTROLLERS
// ==========================================

export async function getQuizQuestions(req, res, next) {
  try {
    const { quizId } = req.params;

    const quiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz record not found.' });
    }

    // Fetch quiz questions
    const questions = await db.all(
      'SELECT id, question_text, options FROM quiz_questions WHERE quiz_id = ?',
      [quizId]
    );

    const formattedQuestions = questions.map(q => {
      return {
        id: q.id,
        question_text: q.question_text,
        options: JSON.parse(q.options || '[]')
      };
    });

    res.status(200).json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        timer_minutes: quiz.timer_minutes,
        passing_percentage: quiz.passing_percentage
      },
      questions: formattedQuestions
    });
  } catch (err) {
    next(err);
  }
}

export async function submitQuizAnswers(req, res, next) {
  try {
    const studentId = req.user.id;
    const { quizId } = req.params;
    const { answers } = req.body; // e.g. { "qq_1": 1, "qq_2": 0, "qq_3": 2 }

    if (!answers) {
      return res.status(400).json({ message: 'Answers object is required' });
    }

    const quiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz record not found.' });
    }

    // Fetch questions to evaluate correctness
    const questions = await db.all(
      'SELECT id, correct_option_index FROM quiz_questions WHERE quiz_id = ?',
      [quizId]
    );

    let score = 0;
    const totalQuestions = questions.length;
    const answersReviewList = [];

    questions.forEach(q => {
      const studentAnswer = answers[q.id];
      const correctAnswer = q.correct_option_index;
      const isCorrect = studentAnswer === correctAnswer;

      if (isCorrect) {
        score++;
      }

      answersReviewList.push({
        questionId: q.id,
        studentAnswer,
        correctAnswer,
        isCorrect
      });
    });

    // Score percentage
    const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= (quiz.passing_percentage || 70) ? 1 : 0;

    // Log the quiz attempt
    const attemptId = uuidv4();
    await db.run(
      `INSERT INTO quiz_attempts (id, student_id, quiz_id, score, total_questions, answers, passed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [attemptId, studentId, quizId, scorePercentage, totalQuestions, JSON.stringify(answers), passed]
    );

    // Update enrollment with score
    const enrollment = await db.get(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, quiz.course_id]
    );

    if (enrollment) {
      await db.run(
        'UPDATE enrollments SET quiz_score = ? WHERE id = ?',
        [scorePercentage, enrollment.id]
      );

      // Generate verified certificate automatically if passed
      if (passed === 1 && !enrollment.completed_at) {
        const timestamp = new Date().toISOString();
        await db.run(
          'UPDATE enrollments SET completed_at = ? WHERE id = ?',
          [timestamp, enrollment.id]
        );

        // Fetch instructor name
        const course = await db.get(
          `SELECT c.title, u.name as instructor_name
           FROM courses c
           JOIN users u ON c.instructor_id = u.id
           WHERE c.id = ?`,
          [quiz.course_id]
        );

        const student = await db.get('SELECT name FROM users WHERE id = ?', [studentId]);

        const certificateId = `AI-CERT-${Math.floor(100000 + Math.random() * 900000)}-2026`;
        const certId = uuidv4();

        await db.run(
          `INSERT INTO certificates (id, student_name, course_name, instructor_name, student_id, course_id, completion_date, certificate_id, qr_code_data)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`,
          [
            certId,
            student?.name || 'Jane Learner',
            course?.title || 'Course Player Master',
            course?.instructor_name || 'Dr. Sarah Jenkins',
            studentId,
            quiz.course_id,
            certificateId,
            `https://ascendiq.com/verify/${certificateId}`
          ]
        );

        // Trigger notification
        await db.run(
          'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
          [
            uuidv4(),
            studentId,
            'Certificate Ready',
            `Congratulations! Your Certificate for ${course.title} is now generated. Check your student profile.`,
            'Certificate Ready'
          ]
        );
      }
    }

    res.status(200).json({
      score: scorePercentage,
      totalQuestions,
      passed: passed === 1,
      passing_percentage: quiz.passing_percentage,
      reviews: answersReviewList
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. ASSIGNMENT CONTROLLERS
// ==========================================

export async function submitAssignment(req, res, next) {
  try {
    const studentId = req.user.id;
    const { assignmentId } = req.params;
    const { fileUrl, submissionText } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: 'fileUrl body parameter is required for submission.' });
    }

    const assignment = await db.get('SELECT id FROM assignments WHERE id = ?', [assignmentId]);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment record not found.' });
    }

    // Check if submission already exists, if so overwrite/update
    const exists = await db.get(
      'SELECT id FROM assignment_submissions WHERE student_id = ? AND assignment_id = ?',
      [studentId, assignmentId]
    );

    if (exists) {
      await db.run(
        `UPDATE assignment_submissions
         SET file_url = ?, status = 'Submitted', grade = NULL, feedback = NULL, submitted_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [fileUrl, exists.id]
      );
    } else {
      await db.run(
        `INSERT INTO assignment_submissions (id, assignment_id, student_id, file_url, status)
         VALUES (?, ?, ?, ?, 'Submitted')`,
        [uuidv4(), assignmentId, studentId, fileUrl]
      );
    }

    res.status(200).json({ message: 'Assignment submitted successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentHistory(req, res, next) {
  try {
    const studentId = req.user.id;
    const { assignmentId } = req.params;

    const submissions = await db.all(
      `SELECT s.*, a.title as assignment_title
       FROM assignment_submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.student_id = ? AND s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [studentId, assignmentId]
    );

    res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 5. PUBLIC CERTIFICATE VERIFICATION CONTROLLER
// ==========================================

export async function verifyCertificateById(req, res, next) {
  try {
    const { id } = req.params; // Certificate ID e.g. AI-CERT-98234-2026

    const certificate = await db.get(
      'SELECT * FROM certificates WHERE certificate_id = ? AND is_revoked = 0',
      [id]
    );

    if (!certificate) {
      return res.status(404).json({
        verified: false,
        message: 'No active, authentic credential could be verified with the provided ID code.'
      });
    }

    res.status(200).json({
      verified: true,
      certificate
    });
  } catch (err) {
    next(err);
  }
}
