import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Trash2,
  RefreshCw,
  X,
  Briefcase
} from 'lucide-react';

export default function JobsView() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [flagFilter, setFlagFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Flag Modal state
  const [flaggingJob, setFlaggingJob] = useState(null);
  const [flagReasonVal, setFlagReasonVal] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    let url = `/api/admin/jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&approval_status=${statusFilter}`;
    if (flagFilter !== '') url += `&is_flagged=${flagFilter}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve system jobs queue.');
        return res.json();
      })
      .then((data) => {
        setJobs(data.jobs);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search, statusFilter, flagFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateStatus = (jobId, status) => {
    fetch(`/api/admin/jobs/${jobId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ approval_status: status })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update job approval status.');
        return res.json();
      })
      .then(() => {
        showToast(`Job posting successfully set to ${status}!`);
        fetchJobs();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleToggleFlag = () => {
    if (!flaggingJob) return;

    // If already flagged, we toggle off, otherwise toggle on with reason
    const isCurrentlyFlagged = flaggingJob.is_flagged === 1;
    const isFlaggedParam = !isCurrentlyFlagged;

    fetch(`/api/admin/jobs/${flaggingJob.id}/flag`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        is_flagged: isFlaggedParam,
        flag_reason: isFlaggedParam ? flagReasonVal : ''
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to toggle flag configuration.');
        return res.json();
      })
      .then(() => {
        showToast(isFlaggedParam ? 'Job has been flagged for safety audit.' : 'Job flag successfully lifted.');
        setFlaggingJob(null);
        setFlagReasonVal('');
        fetchJobs();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleDeleteJob = (jobId) => {
    if (!window.confirm('Delete this job listing from ElevateX? All active student applications will be discarded.')) return;

    fetch(`/api/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete job posting.');
        return res.json();
      })
      .then(() => {
        showToast('Job listing purged successfully.');
        fetchJobs();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  return (
    <div className="space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold z-50 transition-all flex items-center space-x-3 ${
          toast.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Career Board Audits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Audit recruiter openings, monitor job safety flags, and prevent fraudulent postings.</p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm hover:shadow-md text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search job title or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">Moderation Approvals</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending Audit</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">Safety Flags State</option>
            <option value="1">Flagged Violations</option>
            <option value="0">Verified Clean Only</option>
          </select>
        </div>
      </div>

      {/* Jobs Queue Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <th className="p-5">Job Opening Details</th>
                <th className="p-5">Corporate Hub</th>
                <th className="p-5">Type & Salary</th>
                <th className="p-5">Moderation</th>
                <th className="p-5">Safety Status</th>
                <th className="p-5 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm font-medium text-gray-700 dark:text-gray-300">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                  <td className="p-5">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 flex items-center justify-center font-bold text-sm text-indigo-500">
                        {j.company_logo || <Briefcase className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{j.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{j.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{j.company_name}</span>
                  </td>
                  <td className="p-5">
                    <div>
                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md">{j.job_type}</span>
                      <p className="text-xs text-gray-400 mt-1.5 font-bold">{j.salary_range || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    {j.approval_status === 'Approved' && (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">Approved</span>
                    )}
                    {j.approval_status === 'Pending' && (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold">Pending Audit</span>
                    )}
                    {j.approval_status === 'Rejected' && (
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">Rejected</span>
                    )}
                  </td>
                  <td className="p-5">
                    {j.is_flagged === 1 ? (
                      <div>
                        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">
                          <Flag className="w-3 h-3 fill-rose-500" />
                          <span>Flagged</span>
                        </span>
                        <p className="text-[10px] text-rose-500 mt-1 truncate max-w-[150px] font-bold" title={j.flag_reason}>
                          {j.flag_reason}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                        <span>Verified Safe</span>
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right space-x-1.5">
                    <button
                      onClick={() => handleUpdateStatus(j.id, 'Approved')}
                      disabled={j.approval_status === 'Approved'}
                      className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 disabled:opacity-40 rounded-lg inline-flex"
                      title="Approve Listing"
                    >
                      <CheckCircle className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(j.id, 'Rejected')}
                      disabled={j.approval_status === 'Rejected'}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 disabled:opacity-40 rounded-lg inline-flex"
                      title="Reject Listing"
                    >
                      <XCircle className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => {
                        setFlaggingJob(j);
                        setFlagReasonVal(j.flag_reason || '');
                      }}
                      className={`p-1.5 rounded-lg inline-flex ${
                        j.is_flagged === 1
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500'
                      }`}
                      title="Toggle Violation Flag"
                    >
                      <Flag className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-lg inline-flex"
                      title="Purge Posting"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                    No active job audit requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flag Explanation Dialog */}
      {flaggingJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-black text-lg text-gray-950 dark:text-white">
                {flaggingJob.is_flagged === 1 ? 'Lift Violation Flag' : 'Flag Listing Violation'}
              </h3>
              <button onClick={() => setFlaggingJob(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {flaggingJob.is_flagged === 1 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This will resolve all safety flags and publish the job posting back into the active students search database list.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-rose-500 font-bold flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>This hides the listing from students and requires recruiter revision.</span>
                  </p>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Violation Explanation Reason</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Suspicious link redirections, unrealistic wage profiles, or copyright infringement..."
                      value={flagReasonVal}
                      onChange={(e) => setFlagReasonVal(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setFlaggingJob(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleFlag}
                  className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-md ${
                    flaggingJob.is_flagged === 1
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {flaggingJob.is_flagged === 1 ? 'Resolve Flag' : 'Apply Flag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
