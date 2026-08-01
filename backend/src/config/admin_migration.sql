-- Admin Dashboard Migrations for AscendIQ PostgreSQL Schema

-- 1. Alter Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1));
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned INTEGER DEFAULT 0 CHECK(is_banned IN (0, 1));

-- 2. Alter Courses Table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'Approved' CHECK(approval_status IN ('Pending', 'Approved', 'Rejected'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_featured INTEGER DEFAULT 0 CHECK(is_featured IN (0, 1));

-- 3. Alter Jobs Table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'Approved' CHECK(approval_status IN ('Pending', 'Approved', 'Rejected'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_flagged INTEGER DEFAULT 0 CHECK(is_flagged IN (0, 1));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- 4. Alter Certificates Table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_revoked INTEGER DEFAULT 0 CHECK(is_revoked IN (0, 1));

-- 5. Create Audit Logs Table
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

-- 6. Create System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Create index on audit logs action and user for analytics
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
