-- PostgreSQL Database Schema for ElevateX (formerly AscendIQ)
-- Normalized production-ready schema for courses, quizzes, assignments, certificates, profiles, and job listings

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'recruiter', 'admin')),
    is_verified INTEGER DEFAULT 0 CHECK(is_verified IN (0, 1)),
    verification_token TEXT,
    reset_token TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    is_banned INTEGER DEFAULT 0 CHECK(is_banned IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table (Student / Professional)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    about TEXT,
    skills TEXT, -- Comma-separated or JSON list
    education TEXT, -- JSON structure
    experience TEXT, -- JSON structure
    projects TEXT, -- JSON structure
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Recruiter Company Profiles Table
CREATE TABLE IF NOT EXISTS company_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    about TEXT,
    industry TEXT,
    location TEXT,
    company_size TEXT DEFAULT '1-10 employees',
    headquarters TEXT DEFAULT 'San Francisco, CA',
    linkedin_url TEXT,
    twitter_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    instructor_id TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT NOT NULL, -- e.g., "12 Hours"
    rating REAL DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    approval_status TEXT DEFAULT 'Approved' CHECK(approval_status IN ('Pending', 'Approved', 'Rejected')),
    is_featured INTEGER DEFAULT 0 CHECK(is_featured IN (0, 1)),
    price TEXT DEFAULT '$0',
    banner_url TEXT,
    tags TEXT DEFAULT '[]', -- JSON string array
    outcomes TEXT DEFAULT '[]', -- JSON string array
    requirements TEXT DEFAULT '[]', -- JSON string array
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 6. Video Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    duration TEXT, -- e.g., "15:30"
    sort_order INTEGER NOT NULL,
    resources TEXT, -- JSON list of resources/links
    notes TEXT, -- MD content or text
    pdf_url TEXT,
    is_preview INTEGER DEFAULT 0 CHECK (is_preview IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

-- 7. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    timer_minutes INTEGER DEFAULT 15,
    passing_percentage INTEGER DEFAULT 80,
    randomize_questions INTEGER DEFAULT 0 CHECK (randomize_questions IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 8. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON string array
    correct_option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 9. Enrollments & Progress Table
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    completed_lessons TEXT DEFAULT '[]', -- JSON string array of completed lesson IDs
    quiz_score INTEGER, -- Nullable until quiz attempted
    completed_at TIMESTAMP, -- Nullable until course completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id)
);

-- 10. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_id TEXT NOT NULL UNIQUE,
    qr_code_data TEXT NOT NULL,
    is_revoked INTEGER DEFAULT 0 CHECK(is_revoked IN (0, 1)),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 11. Jobs Table (Jobs / Internships)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    recruiter_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    skills_required TEXT NOT NULL, -- Comma-separated list
    salary_range TEXT, -- e.g., "$80,000 - $100,000" or "$30/hr"
    job_type TEXT NOT NULL CHECK(job_type IN ('Job', 'Internship')),
    experience_level TEXT DEFAULT 'Entry Level',
    employment_type TEXT DEFAULT 'Full-time',
    workplace_type TEXT DEFAULT 'Remote',
    application_deadline TIMESTAMP,
    status TEXT DEFAULT 'Published' CHECK(status IN ('Draft', 'Published')),
    approval_status TEXT DEFAULT 'Approved' CHECK(approval_status IN ('Pending', 'Approved', 'Rejected')),
    is_flagged INTEGER DEFAULT 0 CHECK(is_flagged IN (0, 1)),
    flag_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK(status IN ('Applied', 'Shortlisted', 'Interviewing', 'Hired', 'Rejected')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(job_id, student_id)
);

-- 13. Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE(student_id, job_id)
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'New Course', 'New Job', 'Quiz Reminder', 'Certificate Ready'
    is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    reply_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    action_type TEXT NOT NULL, -- e.g. 'LOGIN', 'USER_BAN', 'COURSE_APPROVE', 'SYSTEM_UPDATE'
    description TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 17. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 18. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 19. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Evaluated', 'Pending')),
    grade TEXT,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(assignment_id, student_id)
);

-- 20. Student Lesson Notes Table
CREATE TABLE IF NOT EXISTS student_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(student_id, lesson_id)
);

-- 21. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers TEXT NOT NULL, -- JSON string representation
    passed INTEGER DEFAULT 0 CHECK(passed IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ==========================================
-- Database Indexes for Production Performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_lesson_id ON student_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
