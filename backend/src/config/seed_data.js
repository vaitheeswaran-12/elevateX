import db from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Seeding PostgreSQL database with high-fidelity records...');
  try {
    const pwHash = await bcrypt.hash('securepassword', 10);

    // Clear old tables to allow deterministic re-runs without Conflict errors
    await db.run('DELETE FROM reviews');
    await db.run('DELETE FROM notifications');
    await db.run('DELETE FROM saved_jobs');
    await db.run('DELETE FROM applications');
    await db.run('DELETE FROM jobs');
    await db.run('DELETE FROM certificates');
    await db.run('DELETE FROM enrollments');
    await db.run('DELETE FROM lessons');
    await db.run('DELETE FROM course_modules');
    await db.run('DELETE FROM courses');
    await db.run('DELETE FROM profiles');
    await db.run('DELETE FROM company_profiles');
    await db.run('DELETE FROM users');

    // 1. Seed Users
    const users = [
      { id: 'u_student_1', name: 'Jane Learner', email: 'student@ascendiq.com', password_hash: pwHash, role: 'student', is_verified: 1 },
      { id: 'u_instructor_1', name: 'Dr. Sarah Jenkins', email: 'sarah@ascendiq.com', password_hash: pwHash, role: 'instructor', is_verified: 1 },
      { id: 'u_recruiter_1', name: 'Jonathan Wright', email: 'recruiter@ascendiq.com', password_hash: pwHash, role: 'recruiter', is_verified: 1 },
      { id: 'u_admin_1', name: 'System Administrator', email: 'admin@ascendiq.com', password_hash: pwHash, role: 'admin', is_verified: 1 }
    ];

    for (const u of users) {
      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, u.password_hash, u.role, u.is_verified]
      );
    }
    console.log(' - Users seeded');

    // 2. Seed Student Profile
    const skills = JSON.stringify(["Python", "PyTorch", "React", "Next.js", "Tailwind CSS", "Kubernetes"]);
    const education = JSON.stringify([{ institution: "Stanford University", degree: "B.S. Computer Science", year: "2023 - 2026" }]);
    const experience = JSON.stringify([{ company: "SaaSify Platforms", role: "Full-Stack Intern", year: "Summer 2025", desc: "Implemented key visual assets and responsive UI elements using React and Tailwind CSS." }]);
    const projects = JSON.stringify([{ title: "NeuralScribe: Transformer-based Text Engine", desc: "Trained an 85M parameter model from scratch on Shakespeare datasets.", link: "https://github.com/student/neural-scribe" }]);

    await db.run(
      `INSERT INTO profiles (id, user_id, about, skills, education, experience, projects, resume_url, github_url, linkedin_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'p_student_1',
        'u_student_1',
        'Senior Computer Science major specializing in AI/ML neural architecture and modern React design.',
        skills,
        education,
        experience,
        projects,
        'https://example.com/mock-resume.pdf',
        'https://github.com/student',
        'https://linkedin.com/in/student'
      ]
    );
    console.log(' - Student Profile seeded');

    // 3. Seed Courses
    const courses = [
      { id: 'c_1', title: 'Generative AI & LLM Architecture', desc: 'Learn LLMs, transformers, fine-tuning, and RAG pipelines.', thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80', category: 'AI & Machine Learning', difficulty: 'Advanced', duration: '18 Hours', rating: 4.9, count: 1240 },
      { id: 'c_2', title: 'Next.js 14 Enterprise Full-Stack Masterclass', desc: 'Master Next.js server actions, routing, rendering, and Tailwind integration.', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', category: 'Web Development', difficulty: 'Intermediate', duration: '24 Hours', rating: 4.8, count: 3102 },
      { id: 'c_3', title: 'Kubernetes Orchestration & Multi-Cloud DevOps', desc: 'Build scalable cloud structures, Docker networks, and automated CI/CD pipelines.', thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80', category: 'Cloud Computing', difficulty: 'Advanced', duration: '15 Hours', rating: 4.9, count: 890 }
    ];

    for (const c of courses) {
      await db.run(
        `INSERT INTO courses (id, title, description, thumbnail_url, instructor_id, category, difficulty, duration, rating, reviews_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.title, c.desc, c.thumbnail, 'u_instructor_1', c.category, c.difficulty, c.duration, c.rating, c.count]
      );
    }
    console.log(' - Courses seeded');

    // 4. Seed Course Modules
    const modules = [
      { id: 'm_1', course_id: 'c_1', title: 'Introduction to Transformer Architecture', sort: 1 },
      { id: 'm_2', course_id: 'c_1', title: 'Fine-Tuning Techniques & LoRA', sort: 2 },
      { id: 'm_3', course_id: 'c_2', title: 'Next.js Routing and Server Actions', sort: 1 }
    ];

    for (const m of modules) {
      await db.run(
        'INSERT INTO course_modules (id, course_id, title, sort_order) VALUES (?, ?, ?, ?)',
        [m.id, m.course_id, m.title, m.sort]
      );
    }
    console.log(' - Course Modules seeded');

    // 5. Seed Lessons
    const lessons = [
      { id: 'l_1', module_id: 'm_1', title: 'The Self-Attention Mechanism Exploded', duration: '15:30', sort: 1 },
      { id: 'l_2', module_id: 'm_1', title: 'Positional Encodings & Tokens', duration: '12:15', sort: 2 },
      { id: 'l_3', module_id: 'm_2', title: 'LoRA Parameter Optimization', duration: '22:45', sort: 1 }
    ];

    for (const l of lessons) {
      await db.run(
        'INSERT INTO lessons (id, module_id, title, duration, sort_order) VALUES (?, ?, ?, ?, ?)',
        [l.id, l.module_id, l.title, l.duration, l.sort]
      );
    }
    console.log(' - Lessons seeded');

    // 6. Seed Enrollments
    await db.run(
      'INSERT INTO enrollments (id, student_id, course_id, completed_lessons, quiz_score, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['e_1', 'u_student_1', 'c_1', JSON.stringify(['l_1']), 85, '2026-07-28 10:00:00']
    );
    await db.run(
      'INSERT INTO enrollments (id, student_id, course_id, completed_lessons, quiz_score, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['e_2', 'u_student_1', 'c_2', JSON.stringify([]), null, null]
    );
    console.log(' - Enrollments seeded');

    // 7. Seed Certificates
    await db.run(
      `INSERT INTO certificates (id, student_name, course_name, instructor_name, student_id, course_id, completion_date, certificate_id, qr_code_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['cert_1', 'Jane Learner', 'Generative AI & LLM Architecture', 'Dr. Sarah Jenkins', 'u_student_1', 'c_1', '2026-07-28 10:00:00', 'AI-CERT-98234-2026', 'https://ascendiq.com/verify/AI-CERT-98234-2026']
    );
    console.log(' - Certificates seeded');

    // 8. Seed Jobs
    const jobs = [
      { id: 'j_1', recruiter_id: 'u_recruiter_1', company: 'NeuralCorp Systems', logo: '⚡', title: 'AI Resident Engineer (LLM Tuning)', desc: 'Develop deep learning architectures, leverage PyTorch and HuggingFace Transformers, and implement sovereign AI models.', location: 'San Francisco, CA (Remote)', skills: 'Python, PyTorch, Transformers, LLMs', salary: '$140,000 - $180,000', type: 'Job' },
      { id: 'j_2', recruiter_id: 'u_recruiter_1', company: 'SaaSify Platforms', logo: '🪐', title: 'React / Frontend Developer Intern', desc: 'Collaborate with design and product teams to implement beautiful responsive interfaces with React, Tailwind CSS, and Vite.', location: 'Austin, TX (Onsite)', skills: 'React, Tailwind CSS, JavaScript, Vite', salary: '$40 - $55 / hour', type: 'Internship' },
      { id: 'j_3', recruiter_id: 'u_recruiter_1', company: 'NimbusScale Systems', logo: '❄️', title: 'Senior Cloud Solution Architect', desc: 'Design scalable multi-cloud deployments, secure container configurations with Kubernetes, and provision Terraform structures.', location: 'Seattle, WA (Hybrid)', skills: 'AWS, Kubernetes, Terraform, Docker', salary: '$160,000 - $210,000', type: 'Job' }
    ];

    for (const j of jobs) {
      await db.run(
        `INSERT INTO jobs (id, recruiter_id, company_name, company_logo, title, description, location, skills_required, salary_range, job_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [j.id, j.recruiter_id, j.company, j.logo, j.title, j.desc, j.location, j.skills, j.salary, j.type]
      );
    }
    console.log(' - Jobs seeded');

    // 9. Seed Saved Jobs & Applications
    await db.run('INSERT INTO saved_jobs (id, student_id, job_id) VALUES (?, ?, ?)', ['sj_1', 'u_student_1', 'j_3']);
    await db.run('INSERT INTO applications (id, job_id, student_id, resume_url, status) VALUES (?, ?, ?, ?, ?)', ['app_1', 'j_1', 'u_student_1', 'https://example.com/jane-resume.pdf', 'Applied']);
    console.log(' - Saved Jobs & Applications seeded');

    // 10. Seed Notifications
    const notifications = [
      { id: 'n_1', title: 'Certificate Ready', msg: 'Your Certificate for Generative AI & LLM Architecture is now available!', type: 'Certificate Ready', read: 0 },
      { id: 'n_2', title: 'New Internship Available', msg: 'SaaSify Platforms has posted a new React/Frontend Intern role.', type: 'New Job', read: 0 },
      { id: 'n_3', title: 'Upcoming Quiz Reminder', msg: 'Complete your Next.js Routing assessment quiz to lock in scores!', type: 'Quiz Reminder', read: 1 }
    ];

    for (const n of notifications) {
      await db.run(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)',
        [n.id, 'u_student_1', n.title, n.msg, n.type, n.read]
      );
    }
    console.log(' - Notifications seeded');

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding Error:', err);
  }
}

// Support direct node script executions
if (process.argv[1].endsWith('seed_data.js')) {
  seed().then(() => db.close());
}

export default seed;
