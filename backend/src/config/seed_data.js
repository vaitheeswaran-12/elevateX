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
    await db.run('DELETE FROM audit_logs');
    await db.run('DELETE FROM system_settings');
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

    // 5. Seed Lessons with notes and resources
    const lessons = [
      {
        id: 'l_1',
        module_id: 'm_1',
        title: 'The Self-Attention Mechanism Exploded',
        duration: '15:30',
        sort: 1,
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        resources: JSON.stringify([{ title: 'Transformer Paper PDF', url: 'https://arxiv.org/pdf/1706.03762' }]),
        notes: '# Self-Attention Mechanism\n\nAttention is all you need! In this lesson, we break down Q, K, and V vectors.'
      },
      {
        id: 'l_2',
        module_id: 'm_1',
        title: 'Positional Encodings & Tokens',
        duration: '12:15',
        sort: 2,
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        resources: JSON.stringify([{ title: 'Positional Encoding Viz', url: 'https://example.com/pos-encoding' }]),
        notes: '# Positional Encoding\n\nHow do transformers understand sequence order? By adding wave frequencies to embeddings!'
      },
      {
        id: 'l_3',
        module_id: 'm_2',
        title: 'LoRA Parameter Optimization',
        duration: '22:45',
        sort: 1,
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        resources: JSON.stringify([{ title: 'LoRA Research PDF', url: 'https://arxiv.org/pdf/2106.09685' }]),
        notes: '# Low-Rank Adaptation (LoRA)\n\nLearn to fine-tune billions of parameters by updating only a small adapter matrix.'
      }
    ];

    for (const l of lessons) {
      await db.run(
        `INSERT INTO lessons (id, module_id, title, duration, sort_order, video_url, resources, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [l.id, l.module_id, l.title, l.duration, l.sort, l.video_url, l.resources, l.notes]
      );
    }
    console.log(' - Lessons seeded');

    // 5b. Seed Quizzes, Quiz Questions, and Assignments
    await db.run('DELETE FROM quiz_questions');
    await db.run('DELETE FROM quiz_attempts');
    await db.run('DELETE FROM quizzes');
    await db.run('DELETE FROM assignment_submissions');
    await db.run('DELETE FROM assignments');

    // Seed Quiz
    await db.run(
      'INSERT INTO quizzes (id, course_id, title, timer_minutes, passing_percentage, randomize_questions) VALUES (?, ?, ?, ?, ?, ?)',
      ['q_1', 'c_1', 'Attention Block Assessment', 10, 70, 0]
    );

    const questions = [
      { id: 'qq_1', quiz_id: 'q_1', text: 'What does RAG stand for in Generative AI?', opts: ['Role-Assigned Generation', 'Retrieval-Augmented Generation', 'Randomized Attention Gate', 'Recurrent Auxiliary Gradient'], correct: 1 },
      { id: 'qq_2', quiz_id: 'q_1', text: 'Which parameter-efficient fine-tuning technique leverages low-rank adapter updates?', opts: ['LoRA', 'SGD', 'AdamW', 'MinMax Scaler'], correct: 0 },
      { id: 'qq_3', quiz_id: 'q_1', text: 'Which mathematical function scales attention logits into standard probabilities?', opts: ['ReLU', 'Sigmoid', 'Softmax', 'Tanh'], correct: 2 }
    ];

    for (const q of questions) {
      await db.run(
        'INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_option_index) VALUES (?, ?, ?, ?, ?)',
        [q.id, q.quiz_id, q.text, JSON.stringify(q.opts), q.correct]
      );
    }
    console.log(' - Quizzes & Questions seeded');

    // Seed Assignment
    await db.run(
      'INSERT INTO assignments (id, course_id, title, description, deadline) VALUES (?, ?, ?, ?, ?)',
      ['asg_1', 'c_1', 'Transformer Decoder Coding Assignment', 'Implement a scaled dot-product attention block from scratch in PyTorch.', '2026-12-31 23:59:59']
    );
    console.log(' - Assignments seeded');

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

    // 8a. Seed Company Profile
    await db.run(
      `INSERT INTO company_profiles (id, user_id, company_name, logo_url, website, about, industry, location, company_size, headquarters, linkedin_url, twitter_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'cp_recruiter_1',
        'u_recruiter_1',
        'NeuralCorp Systems',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        'https://neuralcorp.systems',
        'Pioneering sovereign intelligence networks, next-generation deep learning platforms, and decentralized autonomous cognitive loops.',
        'AI & Deep Learning Labs',
        'San Francisco, CA',
        '51-200 employees',
        'San Francisco, CA',
        'https://linkedin.com/company/neuralcorp',
        'https://twitter.com/neuralcorp'
      ]
    );
    console.log(' - Company Profile seeded');

    // 8b. Seed Jobs
    const jobs = [
      { id: 'j_1', recruiter_id: 'u_recruiter_1', company: 'NeuralCorp Systems', logo: '⚡', title: 'AI Resident Engineer (LLM Tuning)', desc: 'Develop deep learning architectures, leverage PyTorch and HuggingFace Transformers, and implement sovereign AI models.', location: 'San Francisco, CA', skills: 'Python, PyTorch, Transformers, LLMs', salary: '$140,000 - $180,000', type: 'Job', exp: 'Mid Level', emp: 'Full-time', workplace: 'Remote', deadline: '2026-09-01 00:00:00', status: 'Published' },
      { id: 'j_2', recruiter_id: 'u_recruiter_1', company: 'SaaSify Platforms', logo: '🪐', title: 'React / Frontend Developer Intern', desc: 'Collaborate with design and product teams to implement beautiful responsive interfaces with React, Tailwind CSS, and Vite.', location: 'Austin, TX', skills: 'React, Tailwind CSS, JavaScript, Vite', salary: '$40 - $55 / hour', type: 'Internship', exp: 'Entry Level', emp: 'Full-time', workplace: 'Onsite', deadline: '2026-08-30 00:00:00', status: 'Published' },
      { id: 'j_3', recruiter_id: 'u_recruiter_1', company: 'NimbusScale Systems', logo: '❄️', title: 'Senior Cloud Solution Architect', desc: 'Design scalable multi-cloud deployments, secure container configurations with Kubernetes, and provision Terraform structures.', location: 'Seattle, WA', skills: 'AWS, Kubernetes, Terraform, Docker', salary: '$160,000 - $210,000', type: 'Job', exp: 'Senior Level', emp: 'Full-time', workplace: 'Hybrid', deadline: '2026-09-15 00:00:00', status: 'Published' }
    ];

    for (const j of jobs) {
      await db.run(
        `INSERT INTO jobs (id, recruiter_id, company_name, company_logo, title, description, location, skills_required, salary_range, job_type, experience_level, employment_type, workplace_type, application_deadline, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [j.id, j.recruiter_id, j.company, j.logo, j.title, j.desc, j.location, j.skills, j.salary, j.type, j.exp, j.emp, j.workplace, j.deadline, j.status]
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

    // 11. Seed Audit Logs
    const auditLogs = [
      { id: 'al_1', user_id: 'u_admin_1', email: 'admin@ascendiq.com', action: 'LOGIN', desc: 'Admin logged into system control panel.', ip: '127.0.0.1' },
      { id: 'al_2', user_id: 'u_admin_1', email: 'admin@ascendiq.com', action: 'COURSE_APPROVE', desc: 'Approved course Generative AI & LLM Architecture.', ip: '127.0.0.1' },
      { id: 'al_3', user_id: 'u_instructor_1', email: 'sarah@ascendiq.com', action: 'LOGIN', desc: 'Instructor session started.', ip: '192.168.1.15' },
      { id: 'al_4', user_id: 'u_student_1', email: 'student@ascendiq.com', action: 'LOGIN', desc: 'Student user logged in.', ip: '192.168.1.100' }
    ];

    for (const al of auditLogs) {
      await db.run(
        'INSERT INTO audit_logs (id, user_id, user_email, action_type, description, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
        [al.id, al.user_id, al.email, al.action, al.desc, al.ip]
      );
    }
    console.log(' - Audit Logs seeded');

    // 12. Seed System Settings
    const settings = [
      { key: 'platform_name', value: 'AscendIQ' },
      { key: 'support_email', value: 'support@ascendiq.com' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'commission_rate', value: '15' },
      { key: 'email_template_verification', value: 'Hello {{name}}, please verify your AscendIQ email using code {{code}}.' },
      { key: 'email_template_welcome', value: 'Welcome to AscendIQ, {{name}}! Learn, build and get hired with us.' },
      { key: 'email_template_reset', value: 'Hi {{name}}, reset your password using the link: {{link}}.' }
    ];

    for (const s of settings) {
      await db.run(
        'INSERT INTO system_settings (key, value) VALUES (?, ?)',
        [s.key, s.value]
      );
    }
    console.log(' - System Settings seeded');

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
