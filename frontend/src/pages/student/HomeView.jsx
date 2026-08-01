import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Sparkles,
  BookOpen,
  Award,
  Clock,
  Calendar,
  Star,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Recharts Weekly study hours mock dataset
const STUDY_ANALYTICS = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 4.0 },
  { day: 'Wed', hours: 3.5 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 1.5 },
  { day: 'Sat', hours: 6.0 },
  { day: 'Sun', hours: 4.5 }
];

export default function HomeView() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [profileData, setProfileData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      if (!token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [profileRes, coursesRes, certRes, notifyRes] = await Promise.all([
          fetch('/api/student/profile', { headers }),
          fetch('/api/student/courses', { headers }),
          fetch('/api/student/certificates', { headers }),
          fetch('/api/student/notifications', { headers })
        ]);

        if (profileRes.ok) {
          const d = await profileRes.json();
          setProfileData(d);
        }
        if (coursesRes.ok) {
          const d = await coursesRes.json();
          setEnrolledCourses(d);
        }
        if (certRes.ok) {
          const d = await certRes.json();
          setCertificates(d);
        }
        if (notifyRes.ok) {
          const d = await notifyRes.json();
          setNotifications(d);
        }
      } catch (err) {
        console.error('API Load error, showing mock fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Skeleton */}
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        {/* Analytics & Sidebar Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Calculate completed courses count based on completed_at field
  const enrollmentsArray = enrolledCourses?.enrollments || [];
  const completedCount = enrollmentsArray.filter(c => c.completed_at).length;
  const inProgressCount = enrollmentsArray.length - completedCount;

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ==========================================
          WELCOME SAAS HERO CARD
          ========================================== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-white p-8 rounded-3xl shadow-premium">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Developer'}!
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              You're currently enrolled in <span className="font-bold">{enrollmentsArray.length} paths</span>. Your progress puts you in the top 5% of active learners this week. Keep ascending!
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center">
              <p className="text-2xl font-black">{enrollmentsArray.length}</p>
              <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Enrolled</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center">
              <p className="text-2xl font-black">{completedCount}</p>
              <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          ANALYTICS CHART & RECENT ACTIVITY
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Learning Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-6 flex flex-col">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Learning Analytics</span>
              </h2>
              <p className="text-xs text-gray-400">Weekly study duration metrics (Hours)</p>
            </div>
            <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-3 py-1 rounded-xl text-xs font-bold">
              Total: 28 Hours
            </span>
          </div>

          {/* Recharts Area Chart container */}
          <div className="flex-grow min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={STUDY_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    borderRadius: '12px'
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Continue Learning sidebar list */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
              <BookOpen className="w-5 h-5 text-accent" />
              <span>Continue Learning</span>
            </h2>
            <p className="text-xs text-gray-400">Pick up exactly where you left off</p>
          </div>

          <div className="space-y-4 flex-grow">
            {enrolledCourses && enrolledCourses.enrollments && enrolledCourses.enrollments.length > 0 ? (
              enrolledCourses.enrollments.slice(0, 2).map((item) => {
                const totalLessons = item.total_lessons || 3;
                const completedCount = item.completed_lessons?.length || 0;
                const progressPercentage = Math.round((completedCount / totalLessons) * 100) || 5;

                return (
                  <div key={item.course.id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 hover:shadow-sm transition-all">
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wide">{item.course.category}</p>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{item.course.title}</h4>
                    </div>

                    {/* Linear Slider Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                        <span>{completedCount} / {totalLessons} Lessons</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No active courses found.</p>
                <Link to="/" className="text-xs font-bold text-primary hover:underline mt-1 inline-block">Catalog</Link>
              </div>
            )}
          </div>

          <Link
            to="/student-dashboard/courses"
            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-center text-xs font-bold text-gray-700 dark:text-gray-200 rounded-xl block border border-gray-100 dark:border-gray-700 transition-colors"
          >
            Manage Enrolled Paths
          </Link>
        </div>
      </div>

      {/* ==========================================
          UPCOMING QUIZZES & CERTIFICATES
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Quizzes List */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span>Upcoming Quizzes</span>
          </h2>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <div className="py-3.5 flex justify-between items-center first:pt-0">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-primary uppercase">AI & Machine Learning</p>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Generative AI Assessment</h4>
                <p className="text-[10px] text-gray-400 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Due: Aug 15, 2026</p>
              </div>
              <Link to="/student-dashboard/courses" className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-xl hover:bg-yellow-100">
                Attempt
              </Link>
            </div>
            <div className="py-3.5 flex justify-between items-center last:pb-0">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-accent uppercase">Web Development</p>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Next.js Routing and Contexts</h4>
                <p className="text-[10px] text-gray-400 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Due: Aug 20, 2026</p>
              </div>
              <span className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-400 text-xs font-bold rounded-xl">
                Locked
              </span>
            </div>
          </div>
        </div>

        {/* Certificates Badge List */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
            <Award className="w-5 h-5 text-green-500" />
            <span>Recent Certificates</span>
          </h2>
          {certificates.length > 0 ? (
            certificates.slice(0, 1).map((cert) => (
              <div key={cert.id} className="p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/10 dark:from-green-500/10 dark:to-emerald-500/20 rounded-2xl border border-green-500/10 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center space-x-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Verified Cryptographic ID</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{cert.course_name}</h4>
                  <p className="text-xs text-gray-400">ID: <span className="font-mono">{cert.certificate_id}</span></p>
                </div>
                <Link to="/student-dashboard/certificates" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm">
                  View
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Complete any course path to earn credentials.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
