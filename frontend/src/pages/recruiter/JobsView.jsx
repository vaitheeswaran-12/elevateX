import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  X,
  CheckCircle,
  Copy,
  FolderArchive,
  Square,
  CheckSquare,
  Check
} from 'lucide-react';

export default function JobsView() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk Selection state
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());

  // Drawer / Form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // If null, we are creating

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState('Job');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [industry, setIndustry] = useState('Technology');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Published');

  const loadJobs = async (page = 1) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/recruiter/jobs?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve job list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [token]);

  // Checkbox interactions
  const toggleSelectJob = (id) => {
    const next = new Set(selectedJobIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedJobIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.size === jobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(jobs.map(j => j.id)));
    }
  };

  // Single Job Actions: Duplicate, Clone, Archive
  const handleDuplicateJob = async (id) => {
    try {
      const res = await fetch(`/api/recruiter/jobs/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Job posting duplicated successfully as a draft!');
        loadJobs(pagination.page);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to duplicate job');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloneJob = async (id) => {
    try {
      const res = await fetch(`/api/recruiter/jobs/${id}/clone`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Job posting cloned successfully as a draft!');
        loadJobs(pagination.page);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to clone job');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveJob = async (id) => {
    if (!confirm('Are you sure you want to archive this job posting?')) return;
    try {
      const res = await fetch(`/api/recruiter/jobs/${id}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Job posting archived successfully!');
        loadJobs(pagination.page);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to archive job');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Actions
  const handleBulkPublish = async () => {
    if (selectedJobIds.size === 0) return;
    try {
      const res = await fetch('/api/recruiter/jobs/bulk-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobIds: Array.from(selectedJobIds) })
      });
      if (res.ok) {
        setSuccess(`Successfully published ${selectedJobIds.size} jobs in bulk!`);
        setSelectedJobIds(new Set());
        loadJobs(pagination.page);
      } else {
        const data = await res.json();
        setError(data.message || 'Bulk publish operation failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.size === 0) return;
    if (!confirm(`Are you absolutely sure you want to delete all ${selectedJobIds.size} selected job postings? This is irreversible.`)) return;
    try {
      const res = await fetch('/api/recruiter/jobs/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobIds: Array.from(selectedJobIds) })
      });
      if (res.ok) {
        setSuccess(`Successfully deleted ${selectedJobIds.size} jobs in bulk!`);
        setSelectedJobIds(new Set());
        loadJobs(pagination.page);
      } else {
        const data = await res.json();
        setError(data.message || 'Bulk delete operation failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateDrawer = () => {
    setEditingJob(null);
    setTitle('');
    setDescription('');
    setLocation('San Francisco, CA');
    setSkillsRequired('Python, React, AWS');
    setSalaryRange('$100,000 - $140,000');
    setJobType('Job');
    setExperienceLevel('Entry Level');
    setEmploymentType('Full-time');
    setWorkplaceType('Remote');
    setIndustry('Technology');
    setDeadline('2026-12-31');
    setStatus('Published');
    setDrawerOpen(true);
  };

  const openEditDrawer = (job) => {
    setEditingJob(job);
    setTitle(job.title || '');
    setDescription(job.description || '');
    setLocation(job.location || '');
    setSkillsRequired(job.skills_required || '');
    setSalaryRange(job.salary_range || '');
    setJobType(job.job_type || 'Job');
    setExperienceLevel(job.experience_level || 'Entry Level');
    setEmploymentType(job.employment_type || 'Full-time');
    setWorkplaceType(job.workplace_type || 'Remote');
    setIndustry(job.industry || 'Technology');
    setDeadline(job.application_deadline ? job.application_deadline.split('T')[0] : '');
    setStatus(job.status || 'Published');
    setDrawerOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      title,
      description,
      location,
      skills_required: skillsRequired,
      salary_range: salaryRange,
      job_type: jobType,
      experience_level: experienceLevel,
      employment_type: employmentType,
      workplace_type: workplaceType,
      industry,
      application_deadline: deadline ? `${deadline} 00:00:00` : null,
      status
    };

    try {
      const url = editingJob ? `/api/recruiter/jobs/${editingJob.id}` : '/api/recruiter/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingJob ? 'Job opportunity updated successfully!' : 'New job published successfully!');
        setDrawerOpen(false);
        loadJobs(pagination.page);
      } else {
        setError(data.message || 'Error occurred while saving job post');
      }
    } catch (err) {
      console.error(err);
      setError('Network communication failed');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Job posting deleted successfully!');
        loadJobs(pagination.page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (job) => {
    const nextStatus = job.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await fetch(`/api/recruiter/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setSuccess(`Job status toggled to ${nextStatus}`);
        loadJobs(pagination.page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Active Job Openings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Publish new career tracks, view applicant response ratios, and edit active parameters.</p>
        </div>
        <button
          onClick={openCreateDrawer}
          className="flex items-center space-x-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-2xl shadow-premium transition-all shrink-0 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Opportunity</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/10 text-rose-500 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/10 text-green-500 dark:text-green-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Bulk Management Bar Panel */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="p-1 text-gray-400 hover:text-primary transition-all shrink-0"
            title="Toggle Select All"
          >
            {selectedJobIds.size === jobs.length && jobs.length > 0 ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {selectedJobIds.size} of {jobs.length} postings selected
          </span>
        </div>

        {selectedJobIds.size > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleBulkPublish}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Bulk Publish</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="w-full sm:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bulk Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Jobs grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => {
          const isSelected = selectedJobIds.has(job.id);
          return (
            <div
              key={job.id}
              className={`bg-white dark:bg-[#111827] p-6 rounded-3xl border hover:shadow-premium transition-all duration-200 flex flex-col justify-between space-y-6 ${
                isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSelectJob(job.id)}
                        className="text-gray-400 hover:text-primary transition-all shrink-0 mr-1"
                      >
                        {isSelected ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                      </button>
                      <span className="bg-primary/5 text-primary dark:bg-primary/10 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {job.job_type}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        job.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600' :
                        job.status === 'Archived' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white pt-1">{job.title}</h3>
                    <p className="text-xs text-gray-400 font-bold">{job.company_name} • {job.industry}</p>
                  </div>
                  <div className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/80 px-2.5 py-1.5 rounded-xl flex items-center space-x-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{job.applicant_count || 0} applicants</span>
                  </div>
                </div>

                {/* Skills required tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(job.skills_required || '').split(',').map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                {/* Attributes line */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 pt-2 font-bold border-t border-gray-50 dark:border-gray-800/40">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span className="truncate">{job.location} ({job.workplace_type})</span>
                  </div>
                  <div className="flex items-center space-x-1 justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">{job.salary_range || 'Competitive'}</span>
                  </div>
                  <div className="flex items-center space-x-1 justify-end">
                    <Briefcase className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="truncate">{job.experience_level}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel with Duplicate, Clone, Archive */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800/30 gap-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePublish(job)}
                    disabled={job.status === 'Archived'}
                    className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      job.status === 'Published'
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                    }`}
                  >
                    {job.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDuplicateJob(job.id)}
                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg transition-colors"
                    title="Duplicate Post"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCloneJob(job.id)}
                    className="px-2 py-1 text-[10px] font-bold border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg transition-colors"
                    title="Clone Post"
                  >
                    Clone
                  </button>

                  {job.status !== 'Archived' && (
                    <button
                      onClick={() => handleArchiveJob(job.id)}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg transition-colors"
                      title="Archive Post"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditDrawer(job)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-lg transition-colors"
                    title="Edit Parameters"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg transition-colors"
                    title="Delete Posting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-6">
          <button
            disabled={pagination.page === 1}
            onClick={() => loadJobs(pagination.page - 1)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-xl disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs font-bold text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => loadJobs(pagination.page + 1)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ==========================================
          JOB DRAWER / SIDE OVERLAY MODAL FORM
          ========================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white dark:bg-[#111827] max-w-xl w-full h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 dark:border-gray-800 animate-slideOver">

            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-primary to-accent text-white">
              <div>
                <h3 className="text-lg font-black">{editingJob ? 'Refine Posting' : 'Publish New Track'}</h3>
                <p className="text-xs text-white/80 mt-0.5">Specify job parameters and required capabilities</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveJob} className="flex-1 overflow-y-auto p-6 space-y-6">

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Core Software Engineer"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  >
                    <option value="Job">Job</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Workplace Type</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $140,000 - $180,000"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Industry</label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Required Skills * (Comma-separated)</label>
                <input
                  type="text"
                  required
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="e.g. Python, PyTorch, Transformers, LLMs"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Publishing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
                >
                  <option value="Published">Published (Active)</option>
                  <option value="Draft">Draft (Invisible)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain candidate tasks, expectations, technologies, research targets, etc..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-1/2 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl shadow-premium"
                >
                  Save Posting
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
