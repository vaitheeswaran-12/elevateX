import db from './db.js';

async function run() {
  console.log('Running advanced job portal migrations with full union set...');
  try {
    // 1. Extend jobs status constraint to allow Archived
    await db.run("ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;");
    await db.run("ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('Draft', 'Published', 'Archived'));");

    // Add industry column to jobs table
    await db.run("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Technology';");

    // 2. Extend applications status check for timeline tracker & backward compatibility
    await db.run("ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;");
    await db.run("ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('Applied', 'Viewed', 'Shortlisted', 'Interviewing', 'Interview Scheduled', 'Hired', 'Offer', 'Rejected'));");

    console.log('Advanced Job Portal Migrations executed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await db.close();
  }
}

run();
