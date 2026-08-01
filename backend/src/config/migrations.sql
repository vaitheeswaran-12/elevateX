-- Migration file to add Instructor Dashboard columns and tables to AscendIQ

-- 1. Update Courses Table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price TEXT DEFAULT '$0';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS outcomes TEXT DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published'));

-- 2. Update Lessons Table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_preview INTEGER DEFAULT 0 CHECK (is_preview IN (0, 1));

-- 3. Update Quizzes Table
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passing_percentage INTEGER DEFAULT 80;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS randomize_questions INTEGER DEFAULT 0 CHECK (randomize_questions IN (0, 1));

-- 4. Create Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 5. Create Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Evaluated', 'Pending')),
    grade TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(assignment_id, student_id)
);

-- 6. Add Review Reply support
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_comment TEXT;
