-- Migration script for Recruiter Dashboard ATS features (Phase 4)

-- 1. Extend Jobs Table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Entry Level';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workplace_type TEXT DEFAULT 'Remote';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published' CHECK(status IN ('Draft', 'Published'));

-- 2. Extend Company Profiles Table
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '1-10 employees';
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS headquarters TEXT DEFAULT 'San Francisco, CA';
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- 3. Extend Applications Table with Interviewing and Hired statuses
-- We will drop the old status check constraint and apply the new broad one
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('Applied', 'Shortlisted', 'Interviewing', 'Hired', 'Rejected'));

-- 4. Create indexes to speed up Recruiter Searches and Filter queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
