import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Briefcase,
  DollarSign,
  Activity,
  History,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HomeView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/overview', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard overview data.');
        return res.json();
      })
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const simulatedRevenueData = [
    { name: 'Mon', revenue: 99 },
    { name: 'Tue', revenue: 198 },
    { name: 'Wed', revenue: 198 },
    { name: 'Thu', revenue: 297 },
    { name: 'Fri', revenue: 396 },
    { name: 'Sat', revenue: 495 },
    { name: 'Sun', revenue: 594 }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
        <p className="font-bold">Error loading administrative details</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const kpis = [
    { name: 'Total Accounts', value: metrics.totalUsers, sub: 'All users registered', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Active Students', value: metrics.activeStudents, sub: 'Learners enrolled', icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Active Instructors', value: metrics.activeInstructors, sub: 'Verified educators', icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Recruiters Pool', value: metrics.recruiters, sub: 'Hiring partners', icon: Briefcase, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Total Courses', value: metrics.totalCourses, sub: 'Approved curriculums', icon: BookOpen, color: 'text-violet-500 bg-violet-500/10' },
    { name: 'Total Job Listings', value: metrics.totalJobs, sub: 'Jobs & internships', icon: Briefcase, color: 'text-pink-500 bg-pink-500/10' },
    { name: 'Gross Revenue', value: `$${metrics.revenueOverview}`, sub: '15% commission model', icon: DollarSign, color: 'text-cyan-500 bg-cyan-500/10' },
    { name: 'System Logs Activity', value: metrics.dailyActivity, sub: 'Active audit markers', icon: Activity, color: 'text-teal-500 bg-teal-500/10' }
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Enterprise Admin Center</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time system statistics, safety logs, global moderation, and analytics panel.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">{kpi.name}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">{kpi.value}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-bold">{kpi.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics and Activity Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Revenue Ingestion Dynamics</h3>
            <p className="text-xs text-gray-400 font-bold">Consolidated sales through course commissions and verified credentials verification payments.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Log / Recent Action Lists */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Security Event Feed</h3>
              <p className="text-xs text-gray-400 font-bold">Latest administrative log trace records.</p>
            </div>
            <History className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {metrics.recentLogs?.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800/60 rounded-xl flex items-start space-x-3 text-xs">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-extrabold text-gray-900 dark:text-white truncate max-w-[120px]">{log.user_email}</span>
                    <span className="text-[10px] text-gray-400 font-extrabold tracking-widest">{log.action_type}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed truncate">{log.description}</p>
                </div>
              </div>
            ))}
            {metrics.recentLogs?.length === 0 && (
              <p className="text-xs text-center text-gray-400 py-10 font-bold">No recent security logging events detected.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
