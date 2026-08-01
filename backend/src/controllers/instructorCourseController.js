import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function getCourses(req, res, next) {
  try {
    const instructorId = req.user.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const sql = `
      SELECT * FROM courses
      WHERE instructor_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const courses = await db.all(sql, [instructorId, limit, offset]);

    const countResult = await db.get('SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?', [instructorId]);
    const total = countResult ? countResult.count : 0;

    res.status(200).json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const instructorId = req.user.id;
    const { title, description, category, difficulty, duration } = req.body;

    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({ message: 'Title, description, category, and difficulty are required' });
    }

    const id = uuidv4();
    const sql = `
      INSERT INTO courses (id, title, description, thumbnail_url, instructor_id, category, difficulty, duration, rating, reviews_count, price, banner_url, tags, outcomes, requirements, status)
      VALUES (?, ?, ?, '', ?, ?, ?, ?, 5.0, 0, '$0', '', '[]', '[]', '[]', 'Draft')
    `;

    await db.run(sql, [
      id,
      title,
      description,
      instructorId,
      category,
      difficulty,
      duration || '10 Hours'
    ]);

    res.status(201).json({ message: 'Course draft created successfully!', courseId: id });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const instructorId = req.user.id;
    const { courseId } = req.params;
    const { title, description, category, difficulty, duration, price, thumbnail_url, banner_url, tags, outcomes, requirements, status } = req.body;

    const course = await db.get('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor_id !== instructorId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this course' });
    }

    const sql = `
      UPDATE courses
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          difficulty = COALESCE(?, difficulty),
          duration = COALESCE(?, duration),
          price = COALESCE(?, price),
          thumbnail_url = COALESCE(?, thumbnail_url),
          banner_url = COALESCE(?, banner_url),
          tags = COALESCE(?, tags),
          outcomes = COALESCE(?, outcomes),
          requirements = COALESCE(?, requirements),
          status = COALESCE(?, status)
      WHERE id = ?
    `;

    await db.run(sql, [
      title || null,
      description || null,
      category || null,
      difficulty || null,
      duration || null,
      price || null,
      thumbnail_url || null,
      banner_url || null,
      Array.isArray(tags) ? JSON.stringify(tags) : tags || null,
      Array.isArray(outcomes) ? JSON.stringify(outcomes) : outcomes || null,
      Array.isArray(requirements) ? JSON.stringify(requirements) : requirements || null,
      status || null,
      courseId
    ]);

    res.status(200).json({ message: 'Course updated successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const instructorId = req.user.id;
    const { courseId } = req.params;

    const course = await db.get('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor_id !== instructorId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.run('DELETE FROM courses WHERE id = ?', [courseId]);
    res.status(200).json({ message: 'Course deleted successfully!' });
  } catch (err) {
    next(err);
  }
}

// Curriculum modules
export async function createModule(req, res, next) {
  try {
    const { courseId, title, sort_order } = req.body;
    if (!courseId || !title) {
      return res.status(400).json({ message: 'courseId and title are required' });
    }

    const id = uuidv4();
    await db.run(
      'INSERT INTO course_modules (id, course_id, title, sort_order) VALUES (?, ?, ?, ?)',
      [id, courseId, title, sort_order || 1]
    );

    res.status(201).json({ message: 'Module created successfully!', moduleId: id });
  } catch (err) {
    next(err);
  }
}

export async function createLesson(req, res, next) {
  try {
    const { module_id, title, video_url, pdf_url, duration, sort_order, is_preview } = req.body;
    if (!module_id || !title) {
      return res.status(400).json({ message: 'module_id and title are required' });
    }

    const id = uuidv4();
    await db.run(
      `INSERT INTO lessons (id, module_id, title, video_url, pdf_url, duration, sort_order, is_preview, resources, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '')`,
      [
        id,
        module_id,
        title,
        video_url || '',
        pdf_url || '',
        duration || '10:00',
        sort_order || 1,
        is_preview ? 1 : 0
      ]
    );

    res.status(201).json({ message: 'Lesson added successfully!', lessonId: id });
  } catch (err) {
    next(err);
  }
}

export async function updateLessonsOrder(req, res, next) {
  try {
    const { orders } = req.body; // Array of { lessonId, sort_order }
    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: 'orders list must be an array' });
    }

    for (const item of orders) {
      await db.run('UPDATE lessons SET sort_order = ? WHERE id = ?', [item.sort_order, item.lessonId]);
    }

    res.status(200).json({ message: 'Lessons sorted successfully!' });
  } catch (err) {
    next(err);
  }
}
