import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Briefcase,
  Bookmark,
  Send,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Search
} from 'lucide-react';

export default function JobsView() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'applied'
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobsData() {
      if (!token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [savedRes, appliedRes] = await Promise.all([
          fetch('/api/student/jobs/saved', { headers }),
          fetch('/api/student/jobs/applied', { headers })
        ]);

        if (savedRes.ok) {
          const d = await savedRes.json();
          setSavedJobs(d);
        }
        if (appliedRes.ok) {
          const d = await appliedRes.json();
          setAppliedJobs(d);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadJobsData();
  }, [token, activeTab]);

  // Remove saved job instantly in UI
  const handleRemoveSavedJob = async (jobId) => {
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
        setSavedJobs(savedJobs.filter(j => j.job_id !== jobId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Careers & Placement</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track saved roles, complete internships, and follow active placement progress.</p>
        </div>

        {/* Tab Switecher Controls */}
        <div className="bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl flex items-center shrink-0 border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'saved'
                ? 'bg-primary text-white shadow-soft'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            Saved Roles ({savedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'applied'
                ? 'bg-primary text-white shadow-soft'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            My Applications ({appliedJobs.length})
          </button>
        </div>
      </div>

      {/* SAVED ROLES VIEW */}
      {activeTab === 'saved' && (
        savedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
            <Bookmark className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 font-semibold text-sm">No saved job listings yet.</p>
            <p className="text-xs text-gray-400">Save internships or jobs from the home catalog to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((item) => (
              <div
                key={item.saved_id}
                className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-premium transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top detail banner */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 bg-primary/10 text-primary flex items-center justify-center font-bold text-lg rounded-xl shrink-0">
                        {item.company_logo}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{item.title}</h4>
                        <p className="text-xs text-gray-400 font-semibold">{item.company_name}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold">
                      {item.job_type}
                    </span>
                  </div>

                  {/* Location & Salary Tags */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.salary_range}</span>
                    </div>
                  </div>

                  {/* Skills tags list */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills_required.split(',').map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] text-gray-600 dark:text-gray-300">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Action buttons */}
                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center">
                  <button
                    onClick={() => handleRemoveSavedJob(item.job_id)}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Remove Save
                  </button>
                  <button
                    onClick={() => alert('Simulating instant digital resume dispatch...')}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium"
                  >
                    Apply with Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* APPLIED ROLES TRACKER VIEW */}
      {activeTab === 'applied' && (
        appliedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
            <Send className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 font-semibold text-sm">No applications submitted yet.</p>
            <p className="text-xs text-gray-400">Complete curriculum paths and apply to jobs directly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appliedJobs.map((item) => (
              <div
                key={item.application_id}
                className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-soft transition-all duration-200"
              >
                {/* Header detail */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 bg-primary/10 text-primary flex items-center justify-center font-bold text-lg rounded-xl shrink-0">
                    {item.company_logo}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{item.title}</h4>
                    <p className="text-xs text-gray-400 font-semibold">{item.company_name} • {item.location}</p>
                    <span className="text-[10px] text-gray-400">Submitted: Aug 01, 2026</span>
                  </div>
                </div>

                {/* Real-time status pipeline representation */}
                <div className="flex items-center space-x-8 w-full md:w-auto">
                  <div className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <span>Pipeline Progress:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      item.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                      item.status === 'Shortlisted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Visual status stepper */}
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" title="Applied"></div>
                    <div className="w-8 h-1 bg-green-500"></div>
                    <div className={`w-2.5 h-2.5 rounded-full ${item.status === 'Shortlisted' ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`} title="Shortlisted"></div>
                    <div className="w-8 h-1 bg-gray-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200" title="Interview"></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
