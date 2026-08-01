import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  FileText,
  CheckCircle,
  Search,
  Filter,
  Check,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function HomeView() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [analyticsRes, applicantsRes] = await Promise.all([
        fetch('/api/recruiter/analytics', { headers }),
        fetch('/api/recruiter/applicants?limit=4', { headers })
      ]);

      if (analyticsRes.ok) {
        const d = await analyticsRes.json();
        setAnalytics(d);
      }
      if (applicantsRes.ok) {
        const d = await applicantsRes.json();
        setCandidates(d.candidates || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch real-time recruiter analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleUpdateStatus = async (appId, nextStatus) => {
    try {
      const res = await fetch('/api/recruiter/applicants/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_id: appId,
          status: nextStatus
        })
      });
      if (res.ok) {
        // Reload to update stats dynamically
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {
    activeJobs: 3,
    draftJobs: 0,
    totalApplicants: 1,
    shortlistedCount: 0,
    interviewingCount: 0,
    hiredCount: 0
  };

  const funnelData = analytics?.funnel || [
    { stage: 'Applied', count: summary.totalApplicants },
    { stage: 'Shortlisted', count: summary.shortlistedCount },
    { stage: 'Interviewing', count: summary.interviewingCount },
    { stage: 'Hired', count: summary.hiredCount }
  ];

  const colors = ['#2563EB', '#06B6D4', '#EAB308', '#10B981'];

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ==========================================
          RECRUITER HERO GREETING CARD
          ========================================== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-white p-8 rounded-3xl shadow-premium">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
              <Sparkles className="w-7 h-7 text-yellow-300 animate-spin" />
              <span>Recruiter ATS Studio</span>
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              Track active applications, edit job postings, view candidates skill scores, and transition talent smoothly through interview pipelines.
            </p>
          </div>
          <Link
            to="/recruiter-dashboard/jobs"
            className="px-6 py-3 bg-white text-primary text-xs font-black rounded-2xl shadow-md hover:bg-gray-50 shrink-0 transition-colors"
          >
            Construct New Job Opening
          </Link>
        </div>
      </div>

      {/* ==========================================
          AGGREGATED ANALYTICS STATS CARDS
          ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{summary.activeJobs}</p>
          <p className="text-[10px] text-gray-400 font-bold">{summary.draftJobs} jobs currently in drafts</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Resumes</span>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{summary.totalApplicants}</p>
          <p className="text-[10px] text-gray-400 font-bold">Applications across all published paths</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Interviewing</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{summary.interviewingCount}</p>
          <p className="text-[10px] text-gray-400 font-bold">{summary.shortlistedCount} candidates in Shortlist stage</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Hires</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{summary.hiredCount}</p>
          <p className="text-[10px] text-gray-400 font-bold">Target achieved ratio: {summary.hiredCount > 0 ? 'Excellent' : 'No Hires Yet'}</p>
        </div>
      </div>

      {/* ==========================================
          FUNNEL GRAPH & CANDIDATE TABLE PIPELINE
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recharts Funnel visualization */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>ATS Funnel Breakdown</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">Real-time candidate progression metrics</p>
          </div>

          <div className="h-[220px] w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1f2937' : '#f1f5f9'} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Link
            to="/recruiter-dashboard/analytics"
            className="py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-xs font-bold text-center text-gray-700 dark:text-gray-200 rounded-xl transition-colors border border-gray-100 dark:border-gray-800"
          >
            Detailed Analytics Reports
          </Link>
        </div>

        {/* Recent Applicants Pipeline list */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-accent" />
                <span>Recent Candidates Activity</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Instantly shortlist, interview, or hire talent from your active job listings</p>
            </div>
            <Link
              to="/recruiter-dashboard/candidates"
              className="text-xs font-bold text-primary hover:underline"
            >
              Pipeline View
            </Link>
          </div>

          <div className="flex-grow overflow-x-auto">
            {candidates.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800 text-xs text-gray-400 font-extrabold uppercase">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Applied For</th>
                    <th className="pb-3">Skills Match</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                  {candidates.map((cand) => (
                    <tr key={cand.application_id} className="text-sm">
                      <td className="py-4 font-bold text-gray-900 dark:text-white">
                        <div>
                          <p>{cand.candidate_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{cand.candidate_email}</p>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-gray-500 dark:text-gray-300">
                        {cand.job_title}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            cand.matchScore >= 80 ? 'bg-emerald-500' : cand.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs font-bold">{cand.matchScore}% match</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          cand.status === 'Hired'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : cand.status === 'Interviewing'
                            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                            : cand.status === 'Shortlisted'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : cand.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center space-x-1">
                          {cand.status === 'Applied' && (
                            <button
                              onClick={() => handleUpdateStatus(cand.application_id, 'Shortlisted')}
                              className="p-1 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 rounded-lg text-xs font-black"
                              title="Shortlist"
                            >
                              <Check className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {cand.status === 'Shortlisted' && (
                            <button
                              onClick={() => handleUpdateStatus(cand.application_id, 'Interviewing')}
                              className="p-1 hover:bg-yellow-50 dark:hover:bg-yellow-950 text-yellow-500 rounded-lg text-xs font-black"
                              title="Move to Interview"
                            >
                              <Clock className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {cand.status === 'Interviewing' && (
                            <button
                              onClick={() => handleUpdateStatus(cand.application_id, 'Hired')}
                              className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-500 rounded-lg text-xs font-black"
                              title="Hire Candidate"
                            >
                              <CheckCircle className="w-4.5 h-4.5" />
                            </button>
                          )}
                          {cand.status !== 'Hired' && cand.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(cand.application_id, 'Rejected')}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded-lg text-xs font-black"
                              title="Reject Candidate"
                            >
                              <XCircle className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No candidates have applied to your active postings yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
