import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle,
  X,
  ChevronRight,
  Filter,
  ArrowUpDown,
  FileText,
  UserCheck
} from 'lucide-react';

export default function JobsCatalogPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Core Listings State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Sorting State
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [sortBy, setSortBy] = useState('newest');

  // Filter Values metadata
  const [filtersMeta, setFiltersMeta] = useState({
    companies: [],
    industries: [],
    locations: [],
    categories: ['All', 'Job', 'Internship'],
    experienceLevels: ['All', 'Entry Level', 'Intermediate', 'Senior', 'Lead'],
    employmentTypes: ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'],
    workplaceTypes: ['All', 'Remote', 'Hybrid', 'Onsite']
  });

  // Active User Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedWorkplace, setSelectedWorkplace] = useState('All');
  const [selectedEmployment, setSelectedEmployment] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [postedWithin, setPostedWithin] = useState('All'); // 'All', 'today', '7days', '30days'
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  // Selected Detail Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Resume submission overlay modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // Loaded saved state
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Filters Metadata
  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch('/api/jobs/filters-meta');
        if (res.ok) {
          const data = await res.json();
          setFiltersMeta(data);
        }
      } catch (err) {
        console.error('Error loading filters metadata:', err);
      }
    }
    fetchMeta();
  }, []);

  // Fetch Jobs Catalog
  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        sortBy,
        search: searchQuery,
        category: selectedCategory,
        industry: selectedIndustry,
        experience_level: selectedExperience,
        employment_type: selectedEmployment,
        workplace_type: selectedWorkplace,
        remote_only: remoteOnly ? 'true' : 'false'
      });

      if (postedWithin !== 'All') {
        queryParams.append('posted_within', postedWithin);
      }
      if (salaryMin) queryParams.append('salary_min', salaryMin);
      if (salaryMax) queryParams.append('salary_max', salaryMax);

      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve job listings.');

      const data = await res.json();
      setJobs(data.jobs || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run initial or state changed fetch
  useEffect(() => {
    fetchJobs(1);
  }, [
    sortBy,
    selectedCategory,
    selectedIndustry,
    selectedExperience,
    selectedEmployment,
    selectedWorkplace,
    remoteOnly,
    postedWithin
  ]);

  // Load Saved/Applied Job tracking list for active Student User
  useEffect(() => {
    async function loadUserJobTracking() {
      if (!token || user?.role !== 'student') return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [savedRes, appliedRes] = await Promise.all([
          fetch('/api/student/jobs/saved', { headers }),
          fetch('/api/student/jobs/applied', { headers })
        ]);

        if (savedRes.ok) {
          const savedList = await savedRes.json();
          setSavedJobIds(new Set(savedList.map(j => j.job_id)));
        }
        if (appliedRes.ok) {
          const appliedList = await appliedRes.json();
          setAppliedJobIds(new Set(appliedList.map(j => j.job_id)));
        }
      } catch (err) {
        console.error('Failed to load student dashboard career tracking details:', err);
      }
    }
    loadUserJobTracking();
  }, [token, user]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedIndustry('All');
    setSelectedExperience('All');
    setSelectedWorkplace('All');
    setSelectedEmployment('All');
    setRemoteOnly(false);
    setPostedWithin('All');
    setSalaryMin('');
    setSalaryMax('');
    fetchJobs(1);
  };

  // Toggle Save Job
  const handleToggleSave = async (jobId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'student') {
      alert('Only student accounts can save and apply to career opportunities.');
      return;
    }

    try {
      const res = await fetch('/api/student/jobs/save-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      });

      if (res.ok) {
        const data = await res.json();
        const updated = new Set(savedJobIds);
        if (data.saved) {
          updated.add(jobId);
        } else {
          updated.delete(jobId);
        }
        setSavedJobIds(updated);
      }
    } catch (err) {
      console.error('Error toggling saved state:', err);
    }
  };

  // Share Job Clipboard Action
  const handleShareJob = (job) => {
    const url = `${window.location.origin}/jobs?jobId=${job.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Submit Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    if (!resumeUrl.trim()) {
      setApplyError('Please provide a valid online resume URL (e.g. Supabase bucket, Google Drive link).');
      return;
    }

    try {
      const res = await fetch('/api/student/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          resumeUrl: resumeUrl.trim()
        })
      });

      if (res.ok) {
        setApplySuccess('Your placement application was submitted successfully!');
        const updated = new Set(appliedJobIds);
        updated.add(selectedJob.id);
        setAppliedJobIds(updated);
        setTimeout(() => {
          setShowApplyModal(false);
          setResumeUrl('');
          setApplySuccess('');
        }, 2000);
      } else {
        const errorData = await res.json();
        setApplyError(errorData.message || 'Failed to submit application.');
      }
    } catch (err) {
      setApplyError('Server connection issue. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-10">

      {/* Dynamic Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
          <span>Verified Career Opportunities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Find Your Next <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dream Placement</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Search verified corporate roles, paid internships, and global tech tracks. Build credentials, pass milestones, and get instantly pre-vetted.
        </p>
      </div>

      {/* Advanced Global Search & Sorting Controls */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, company name, skills (e.g., React, CUDA), or industry..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-850 rounded-2xl text-sm font-medium border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => fetchJobs(1)}
            className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-2xl shadow-premium transition-all"
          >
            Search Now
          </button>

          <div className="flex items-center bg-gray-50 dark:bg-gray-850 px-3 py-2 rounded-2xl border border-gray-100 dark:border-gray-800">
            <ArrowUpDown className="w-4 h-4 text-gray-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold border-none text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"
            >
              <option value="newest">Newest Roles</option>
              <option value="salary_high">Highest Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* =======================================================
            SIDEBAR FILTERS
            ======================================================= */}
        <aside className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft h-fit space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-primary" />
              <span>Catalog Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:underline font-bold"
            >
              Reset All
            </button>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Position Category</label>
            <div className="flex flex-wrap gap-1.5">
              {filtersMeta.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Filter dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Industry Sector</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full text-xs font-medium py-2.5 px-3 bg-gray-50 dark:bg-gray-850 rounded-xl border-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/10"
            >
              <option value="All">All Industries</option>
              {filtersMeta.industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Experience Level Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Experience Requirement</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full text-xs font-medium py-2.5 px-3 bg-gray-50 dark:bg-gray-850 rounded-xl border-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/10"
            >
              <option value="All">All Levels</option>
              {filtersMeta.experienceLevels.filter(x => x !== 'All').map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

          {/* Employment Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Employment Type</label>
            <select
              value={selectedEmployment}
              onChange={(e) => setSelectedEmployment(e.target.value)}
              className="w-full text-xs font-medium py-2.5 px-3 bg-gray-50 dark:bg-gray-850 rounded-xl border-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/10"
            >
              <option value="All">All Types</option>
              {filtersMeta.employmentTypes.filter(x => x !== 'All').map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Workplace Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Workplace Setup</label>
            <select
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
              className="w-full text-xs font-medium py-2.5 px-3 bg-gray-50 dark:bg-gray-850 rounded-xl border-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/10"
            >
              <option value="All">All Setups</option>
              {filtersMeta.workplaceTypes.filter(x => x !== 'All').map(wp => (
                <option key={wp} value={wp}>{wp}</option>
              ))}
            </select>
          </div>

          {/* Date Posted Time-window */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Date Posted</label>
            <select
              value={postedWithin}
              onChange={(e) => setPostedWithin(e.target.value)}
              className="w-full text-xs font-medium py-2.5 px-3 bg-gray-50 dark:bg-gray-850 rounded-xl border-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/10"
            >
              <option value="All">Any Time</option>
              <option value="today">Posted Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Interactive Numerical Salary sliders / input ranges */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Salary Bounds (Numeric)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Min ($)"
                className="w-full text-xs py-2 px-2.5 bg-gray-50 dark:bg-gray-850 rounded-lg text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-primary/10"
              />
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Max ($)"
                className="w-full text-xs py-2 px-2.5 bg-gray-50 dark:bg-gray-850 rounded-lg text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            {(salaryMin || salaryMax) && (
              <button
                onClick={() => { setSalaryMin(''); setSalaryMax(''); }}
                className="text-[10px] text-red-500 hover:underline font-bold block pt-1"
              >
                Clear Salary Filter
              </button>
            )}
          </div>

          {/* Remote Only Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Remote Only</span>
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
            />
          </div>
        </aside>

        {/* =======================================================
            JOB CARDS GRID
            ======================================================= */}
        <section className="lg:col-span-3 space-y-6">

          {loading ? (
            // Custom high-fidelity loading skeletons
            <div className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-50 dark:border-gray-800 animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-3 w-32 bg-gray-100 dark:bg-gray-850 rounded"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-50 dark:bg-gray-850 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-950/20 text-red-500 space-y-2">
              <p className="font-semibold">{error}</p>
              <button onClick={() => fetchJobs(1)} className="text-xs font-bold text-primary hover:underline">Retry Loading</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-gray-500 font-bold text-base">No Matching Career Opportunities Found</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">Try refining your filter bounds, deleting advanced text keywords, or broadening categories.</p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => {
                const isSaved = savedJobIds.has(job.id);
                const isApplied = appliedJobIds.has(job.id);

                return (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center relative"
                  >
                    {/* Core description block */}
                    <div className="flex items-start gap-4 flex-grow">
                      <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl rounded-2xl shrink-0">
                        {job.company_logo || '⚡'}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-400 font-semibold">{job.company_name} • {job.industry}</p>
                        </div>

                        {/* Badges / indicators */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded-lg text-[10px] uppercase">
                            {job.job_type}
                          </span>
                          <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg text-[10px]">
                            {job.experience_level}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg text-[10px]">
                            {job.employment_type}
                          </span>
                        </div>

                        {/* Location / Salary */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{job.location} ({job.workplace_type})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{job.salary_range}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Actions panel */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 dark:border-gray-850 gap-3">

                      {/* Interactive Triggers */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSave(job.id)}
                          className={`p-2 rounded-xl transition-all ${
                            isSaved
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'
                          }`}
                          title={isSaved ? 'Remove from saves' : 'Save opportunity'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleShareJob(job)}
                          className={`p-2 rounded-xl transition-all ${
                            copiedId === job.id
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'
                          }`}
                          title="Share placement link"
                        >
                          {copiedId === job.id ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Display detail drawer trigger */}
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4.5 py-2.5 bg-gray-900 hover:bg-black dark:bg-gray-850 dark:hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>
                );
              })}

              {/* Robust Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center pt-6">
                  <span className="text-xs font-bold text-gray-400">
                    Showing {jobs.length} of {pagination.total} opportunities
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => fetchJobs(pagination.page - 1)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-500 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-black px-3 py-1 bg-primary text-white rounded-lg">
                      {pagination.page}
                    </span>
                    <button
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => fetchJobs(pagination.page + 1)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-500 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </section>
      </div>

      {/* =======================================================
          SLIDE-OVER DRAWER / MODAL FOR JOB DETAILS
          ======================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-950 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft">

            {/* Header / Brand info */}
            <div>
              <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold text-xl rounded-xl">
                    {selectedJob.company_logo || '⚡'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">
                      {selectedJob.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold">{selectedJob.company_name} • {selectedJob.location}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Main Content Workspace */}
              <div className="p-6 space-y-6">

                {/* Meta details cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Category</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">{selectedJob.job_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Workplace</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">{selectedJob.workplace_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Experience</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">{selectedJob.experience_level}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Salary Range</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate block">{selectedJob.salary_range || 'Competitive'}</span>
                  </div>
                </div>

                {/* Requirements & Description */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Position Description</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Core Competencies / Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills_required.split(',').map(skill => (
                        <span key={skill} className="px-3 py-1 bg-primary/5 dark:bg-primary/25 rounded-lg text-xs text-primary font-bold">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* High Fidelity SaaS Details Expansion */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Responsibilities & Impact</h4>
                    <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1.5 leading-relaxed">
                      <li>Collaborate directly with cross-functional leadership on critical project deliverables.</li>
                      <li>Write robust, modular, and optimized production components aligned with clean code architecture.</li>
                      <li>Integrate continuous delivery operations, security compliance checks, and regression audits.</li>
                      <li>Leverage matching credentials from the AscendIQ ecosystem to boost engineering efficiency.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Perks & Benefits</h4>
                    <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1.5 leading-relaxed">
                      <li>Competitive medical, dental, vision coverage, and 401(k) matching benefits.</li>
                      <li>Flexible work-life balances, wellness allowances, and immediate PTO structure.</li>
                      <li>Full home-office setup stipend and dynamic learning pathway incentives.</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-850 flex gap-4 items-center bg-gray-50 dark:bg-gray-900 shrink-0">
              <button
                onClick={() => handleToggleSave(selectedJob.id)}
                className={`w-1/3 py-3 border rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-all ${
                  savedJobIds.has(selectedJob.id)
                    ? 'bg-amber-100 border-amber-200 text-amber-600'
                    : 'bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${savedJobIds.has(selectedJob.id) ? 'fill-current' : ''}`} />
                <span>{savedJobIds.has(selectedJob.id) ? 'Saved' : 'Save Role'}</span>
              </button>

              {appliedJobIds.has(selectedJob.id) ? (
                <div className="w-2/3 py-3 bg-green-500/10 text-green-500 border border-green-500/20 text-center font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Applied Successfully</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!token) { navigate('/login'); return; }
                    setShowApplyModal(true);
                  }}
                  className="w-2/3 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-premium transition-colors"
                >
                  Apply Online Now
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =======================================================
          RESUME SUBMISSION OVERLAY MODAL
          ======================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-950 max-w-md w-full rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xl relative space-y-6 animate-zoomIn">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Apply with Resume URL</h3>
              <p className="text-xs text-gray-400">
                You are applying to <strong className="text-gray-700 dark:text-gray-200">{selectedJob?.title}</strong> at <strong className="text-gray-700 dark:text-gray-200">{selectedJob?.company_name}</strong>.
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Resume File Link / Storage URL</label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://supabase-bucket.com/jane-resume.pdf"
                  className="w-full text-xs py-2.5 px-3 bg-gray-50 dark:bg-gray-850 rounded-xl text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {applyError && <p className="text-xs font-semibold text-red-500 text-center">{applyError}</p>}
              {applySuccess && <p className="text-xs font-semibold text-green-500 text-center">{applySuccess}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-1/2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium"
                >
                  Dispatch Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
