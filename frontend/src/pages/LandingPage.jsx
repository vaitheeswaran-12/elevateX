import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  BookOpen,
  Briefcase,
  Users,
  GraduationCap,
  Star,
  MapPin,
  DollarSign,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Layers
} from 'lucide-react';

// ==========================================
// MOCK DATASETS
// ==========================================

const MOCK_COURSES = [
  {
    id: 'c1',
    title: 'Generative AI & LLM Architecture',
    instructor: 'Dr. Sarah Jenkins',
    category: 'AI & Machine Learning',
    difficulty: 'Advanced',
    duration: '18 Hours',
    rating: 4.9,
    reviewsCount: 1240,
    price: '$89',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c2',
    title: 'Next.js 14 Enterprise Full-Stack Masterclass',
    instructor: 'Alex Rivera',
    category: 'Web Development',
    difficulty: 'Intermediate',
    duration: '24 Hours',
    rating: 4.8,
    reviewsCount: 3102,
    price: '$79',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c3',
    title: 'Kubernetes Orchestration & Multi-Cloud DevOps',
    instructor: 'Liam Chen',
    category: 'Cloud Computing',
    difficulty: 'Advanced',
    duration: '15 Hours',
    rating: 4.9,
    reviewsCount: 890,
    price: '$99',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c4',
    title: 'Figma to Code: High Fidelity UI/UX Bootcamp',
    instructor: 'Sophia Moretti',
    category: 'UI/UX',
    difficulty: 'Beginner',
    duration: '12 Hours',
    rating: 4.7,
    reviewsCount: 1540,
    price: '$49',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c5',
    title: 'Cybersecurity Penetration Testing Standard',
    instructor: 'Marcus Vance',
    category: 'Cyber Security',
    difficulty: 'Advanced',
    duration: '20 Hours',
    rating: 4.8,
    reviewsCount: 670,
    price: '$119',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'c6',
    title: 'Python for Deep Data Science Pipelines',
    instructor: 'Dr. Sarah Jenkins',
    category: 'Data Science',
    difficulty: 'Beginner',
    duration: '16 Hours',
    rating: 4.9,
    reviewsCount: 2200,
    price: '$59',
    thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80'
  }
];

const MOCK_JOBS = [
  {
    id: 'j1',
    title: 'AI Resident Engineer (LLM Tuning)',
    company: 'NeuralCorp Systems',
    logo: '⚡',
    location: 'San Francisco, CA (Remote)',
    skills: 'Python, PyTorch, Transformers, LLMs',
    salary: '$140,000 - $180,000',
    type: 'Job'
  },
  {
    id: 'j2',
    title: 'React / Frontend Developer Intern',
    company: 'SaaSify Platforms',
    logo: '🪐',
    location: 'Austin, TX (Onsite)',
    skills: 'React, Tailwind CSS, JavaScript, Vite',
    salary: '$40 - $55 / hour',
    type: 'Internship'
  },
  {
    id: 'j3',
    title: 'Senior Cloud Solution Architect',
    company: 'NimbusScale Systems',
    logo: '❄️',
    location: 'Seattle, WA (Hybrid)',
    skills: 'AWS, Kubernetes, Terraform, Docker',
    salary: '$160,000 - $210,000',
    type: 'Job'
  },
  {
    id: 'j4',
    title: 'UI/UX Product Design Intern',
    company: 'Studio Pixel',
    logo: '🎨',
    location: 'New York, NY (Remote)',
    skills: 'Figma, Prototyping, Design Systems, HTML/CSS',
    salary: '$35 - $48 / hour',
    type: 'Internship'
  }
];

const MOCK_TESTIMONIALS = [
  {
    id: 't1',
    quote: "AscendIQ completely restructured my career trajectory. I took the Generative AI Masterclass, earned my verified blockchain certificate, and was headhunted by a top recruiter directly on the platform within 3 weeks!",
    name: "Elena Rostova",
    role: "AI Developer at Tesla",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5
  },
  {
    id: 't2',
    quote: "The instructor studio is phenomenal, and the job board has a level of verified professional intent that beats out LinkedIn. Candidates' certificates are directly auditable. Hiring has never been so seamless.",
    name: "Jonathan Wright",
    role: "VP of Engineering at Stripe",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5
  },
  {
    id: 't3',
    quote: "I landed my Dream Internship at NeuralCorp. The dynamic dashboard verified my Figma scores instantly and gave recruiters direct, pre-vetted access to my Github projects list.",
    name: "Marcus Aurelius",
    role: "UI/UX Intern",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    rating: 5
  }
];

const FAQ_ITEMS = [
  {
    q: "How does the cryptographic certificate verification work?",
    a: "Every certificate issued on AscendIQ is generated with an immutable Certificate ID and corresponding QR code. This links back to our public verification endpoints, allowing recruiters to instantly verify the credential's authenticity in seconds."
  },
  {
    q: "Can I apply for internships directly from the platform?",
    a: "Absolutely! Once you build your student profile, upload your resume, and complete relevant courses, you can apply for jobs/internships with a single tap. Recruiters receive your verified course score history immediately."
  },
  {
    q: "Is there a charge for recruiters to post career listings?",
    a: "We offer both free standard job posts and premium sponsored candidate-boosting packages that grant access to advanced candidate matching analytics and candidate resume downloads."
  },
  {
    q: "What benefits are included in the Pro Membership plan?",
    a: "Pro members gain full access to all advanced course modules, premium video lessons, immediate verified certificates, interactive coding labs, mock interview preparation modules, and priority placement highlights on recruiter search feeds."
  }
];

export default function LandingPage() {
  // Global Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Filter Categories
  const categories = useMemo(() => {
    const list = new Set(MOCK_COURSES.map(c => c.category));
    return ['All', ...Array.from(list)];
  }, []);

  // Global Search Engine
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();

    const matchedCourses = MOCK_COURSES.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.instructor.toLowerCase().includes(query)
    );

    const matchedJobs = MOCK_JOBS.filter(j =>
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      j.skills.toLowerCase().includes(query)
    );

    return {
      courses: matchedCourses,
      jobs: matchedJobs
    };
  }, [searchQuery]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'All') return MOCK_COURSES;
    return MOCK_COURSES.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    if (selectedJobType === 'All') return MOCK_JOBS;
    return MOCK_JOBS.filter(j => j.type === selectedJobType);
  }, [selectedJobType]);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* ==========================================
          1. HERO SECTION
          ========================================== */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        {/* Glow Spheres decoration */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Unified EdTech + Placement Platform</span>
          </div>

          {/* Tagline Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-none mb-6">
            Learn. Build.{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Get Hired.
            </span>
          </h1>

          {/* Subheading text */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            AscendIQ unites premium professional training, auto-evaluated technical assignments, verified cryptographic credentials, and matching job pipelines under a singular modern portal.
          </p>

          {/* Call To Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-premium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center space-x-2"
            >
              <span>Explore Tech Paths</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>Recruiter Terminal</span>
            </Link>
          </div>

          {/* ==========================================
              GLOBAL SEARCH ENGINE UI
              ========================================== */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-2.5 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all">
            <div className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, job skills, or elite instructors..."
                className="w-full py-3 px-1 text-base bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Global Search Matches Render Box */}
            {searchResults && (
              <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 text-left max-h-[380px] overflow-y-auto space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Matches in Platform</p>

                {/* Matched Courses list */}
                {searchResults.courses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-primary dark:text-primary-light mb-1.5 px-2 flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Matching Courses ({searchResults.courses.length})</span>
                    </h4>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {searchResults.courses.map(c => (
                        <div key={c.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.title}</p>
                            <p className="text-xs text-gray-500">{c.category} • Instructor: {c.instructor}</p>
                          </div>
                          <Link to="/register" className="text-xs font-bold text-primary hover:underline">Enroll</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Jobs list */}
                {searchResults.jobs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-accent dark:text-accent-light mb-1.5 px-2 flex items-center space-x-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Matching Career Roles ({searchResults.jobs.length})</span>
                    </h4>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {searchResults.jobs.map(j => (
                        <div key={j.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{j.title}</p>
                            <p className="text-xs text-gray-500">{j.company} • {j.location}</p>
                          </div>
                          <Link to="/register" className="text-xs font-bold text-accent hover:underline">Apply</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.courses.length === 0 && searchResults.jobs.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No records matched "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          2. PLATFORM STATISTICS SECTION
          ========================================== */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-primary mb-1">50K+</p>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Tech Learners</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-accent mb-1">98%</p>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quiz Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-primary mb-1">300+</p>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hiring Corporates</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-accent mb-1">$140K</p>
              <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average Placed Salary</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. POPULAR COURSES SECTION (CATALOG)
          ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Popular Courses on AscendIQ
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Learn skills, pass auto-evaluated quizzes, and earn verifiable credentials.
            </p>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image & Price */}
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-sm font-bold text-primary shadow-soft">
                  {course.price}
                </span>
                <span className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                  {course.difficulty}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{course.category}</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">{course.instructor}</span>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Rating details & CTA */}
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{course.rating}</span>
                    <span className="text-[10px] text-gray-400">({course.reviewsCount})</span>
                  </div>
                  <Link
                    to="/register"
                    className="text-xs font-bold text-primary dark:text-primary-light flex items-center space-x-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Enroll Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          4. FEATURED JOBS SECTION
          ========================================== */}
      <section className="py-24 bg-gray-100/50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Featured Jobs & Internships
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Apply online with your unified portfolio and track progress in real-time.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center space-x-2 mt-6 md:mt-0">
              <button
                onClick={() => setSelectedJobType('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedJobType === 'All'
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                All Positions
              </button>
              <button
                onClick={() => setSelectedJobType('Job')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedJobType === 'Job'
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Full-Time Jobs
              </button>
              <button
                onClick={() => setSelectedJobType('Internship')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedJobType === 'Internship'
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Internships
              </button>
            </div>
          </div>

          {/* Job listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-soft transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header details */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-semibold">{job.company}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      job.type === 'Job' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    }`}>
                      {job.type}
                    </span>
                  </div>

                  {/* Core Tags (Location, Salary) */}
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {/* Required Competencies */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Competencies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.split(',').map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-300">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Actions */}
                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-gray-400">Apply with AscendIQ Credential</span>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium transition-all"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          5. TESTIMONIALS SECTION
          ========================================== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Ecosystem Success Stories
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
            See how high-fidelity verification and skill building accelerated placing our top students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_TESTIMONIALS.map(t => (
            <div
              key={t.id}
              className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Five Stars */}
                <div className="flex space-x-1 text-yellow-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              {/* Bio block */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-50 dark:border-gray-800/40">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t.name}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          6. PRICING SECTION
          ========================================== */}
      <section className="py-24 bg-gray-100/50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Transparent Membership Tiers
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Accelerate learning with flexible packages crafted for every tier of developer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Standard Free</h3>
                <p className="text-sm text-gray-400 mt-1">Perfect for exploration</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white my-6">$0 <span className="text-xs text-gray-400 font-semibold">/ lifetime</span></p>
                <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Access to introductory modules</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Unified student profile</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Apply to internship listings</span></li>
                </ul>
              </div>
              <Link to="/register" className="w-full text-center py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl mt-8 block hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Start Free Path
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-primary relative shadow-premium flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Accelerate Pro</h3>
                <p className="text-sm text-primary mt-1 font-semibold">High-octane placements</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white my-6">$29 <span className="text-xs text-gray-400 font-semibold">/ month</span></p>
                <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Access to all 11 skill categories</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Immediate verified certificates</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Priority highlighted candidate feeds</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Interactive assessment preparation</span></li>
                </ul>
              </div>
              <Link to="/register" className="w-full text-center py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl mt-8 block shadow-premium transition-colors">
                Acquire Pro Path
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Corporate Enterprise</h3>
                <p className="text-sm text-gray-400 mt-1">For corporate recruiters</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white my-6">$199 <span className="text-xs text-gray-400 font-semibold">/ month</span></p>
                <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Post unlimited jobs/internships</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Download verified candidate resumes</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-primary" /><span>Advanced skill match filters</span></li>
                </ul>
              </div>
              <Link to="/register" className="w-full text-center py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl mt-8 block hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Recruit Candidates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          7. FAQ INTERACTIVE ACCORDION
          ========================================== */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Have questions about the unified AscendIQ system? Let's clarify.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white pr-4">
                  {item.q}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${
                  expandedFaq === idx ? 'transform rotate-180' : ''
                }`} />
              </button>

              {expandedFaq === idx && (
                <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-50 dark:border-gray-800 pt-4 leading-relaxed animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
