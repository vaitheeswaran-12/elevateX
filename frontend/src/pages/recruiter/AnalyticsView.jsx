import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsView() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!token) return;
      try {
        const res = await fetch('/api/recruiter/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    activeJobs: 3,
    draftJobs: 0,
    totalApplicants: 1,
    shortlistedCount: 0,
    interviewingCount: 0,
    hiredCount: 0,
    rejectedCount: 0
  };

  const funnel = data?.funnel || [
    { stage: 'Applied', count: summary.totalApplicants },
    { stage: 'Shortlisted', count: summary.shortlistedCount },
    { stage: 'Interviewing', count: summary.interviewingCount },
    { stage: 'Hired', count: summary.hiredCount }
  ];

  const performance = data?.jobPerformance || [];

  const colors = ['#2563EB', '#06B6D4', '#EAB308', '#10B981'];

  // Calculate metrics ratios
  const conversionRate = summary.totalApplicants > 0 ? Math.round((summary.hiredCount / summary.totalApplicants) * 100) : 0;
  const shortlistRate = summary.totalApplicants > 0 ? Math.round((summary.shortlistedCount / summary.totalApplicants) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Hiring Insights</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed applicant recruitment funnel breakdown, job performance ratings, and conversion matrices.</p>
      </div>

      {/* Analytics Ratios Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hiring Conversion Rate</p>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{conversionRate}%</h3>
            <p className="text-[10px] text-gray-400 font-bold">Applications successfully hired</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-4 bg-accent/10 rounded-2xl text-accent shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Shortlist Conversion</p>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{shortlistRate}%</h3>
            <p className="text-[10px] text-gray-400 font-bold">Qualified screening passed ratio</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex items-center space-x-4">
          <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Average Days to Hire</p>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">12 Days</h3>
            <p className="text-[10px] text-gray-400 font-bold">Exceeding market speed index</p>
          </div>
        </div>
      </div>

      {/* Funnel Graph vs Job Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Applicant Funnel */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <PieChart className="w-4.5 h-4.5 text-primary" />
              <span>ATS Funnel Breakdown</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">Hiring progression pipeline counts</p>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#1f2937' : '#f1f5f9'} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Performance applicant count */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-4.5 h-4.5 text-accent" />
              <span>Active Job Response Volume</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">Applicants registered per published opportunity</p>
          </div>

          <div className="h-[260px]">
            {performance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1f2937' : '#f1f5f9'} />
                  <XAxis dataKey="title" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                      borderRadius: '12px',
                      border: 'none'
                    }}
                  />
                  <Area type="monotone" dataKey="applicants" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorApplicants)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p>No active job performance metrics recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
