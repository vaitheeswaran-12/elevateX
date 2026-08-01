import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  Star,
  DollarSign,
  Clock,
  Layers,
  MessageSquare,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function HomeView() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!token) return;
      try {
        const res = await fetch('/api/instructor/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalCourses: 3,
    totalStudents: 1,
    totalEarnings: '$13,700',
    completionRate: '78%'
  };

  const chartData = analytics?.charts?.monthlyData || [
    { month: 'Mar', earnings: 1200, enrollments: 15 },
    { month: 'Apr', earnings: 1800, enrollments: 24 },
    { month: 'May', earnings: 2400, enrollments: 32 },
    { month: 'Jun', earnings: 3800, enrollments: 45 },
    { month: 'Jul', earnings: 4500, enrollments: 58 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* WELCOME HERO CARD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-white p-8 rounded-3xl shadow-premium">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome to Instructor Studio, {user?.name}!
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              Track course performance, customize curricula, and view real-time student quiz metrics and reviews dynamically.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-6 py-4 rounded-2xl text-center shrink-0">
            <p className="text-2xl font-black">{summary.totalEarnings}</p>
            <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Gross Earning</p>
          </div>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">Total Students</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{summary.totalStudents}</h3>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-2xl shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">Total Courses</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{summary.totalCourses}</h3>
          </div>
        </div>

        {/* Average Completion Rate */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-2xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">Completion Rate</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{summary.completionRate}</h3>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 rounded-2xl shrink-0">
            <Star className="w-6 h-6 fill-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">Avg. Rating</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">4.9 / 5.0</h3>
          </div>
        </div>
      </div>

      {/* REVENUE & ENROLLMENT ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Revenue Overview</h3>
            <p className="text-xs text-gray-400">Monthly gross earnings simulation curves ($)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    borderRadius: '12px'
                  }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollments bar chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Enrollment Growth</h3>
            <p className="text-xs text-gray-400">Monthly student acquisition metrics</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="enrollments" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
