import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Github,
  Linkedin,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function CandidatesView() {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [expFilter, setExperienceFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const loadCandidates = async () => {
    if (!token) return;
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (skillsFilter) queryParams.append('skills', skillsFilter);
      if (expFilter) queryParams.append('experience', expFilter);
      if (locationFilter) queryParams.append('location', locationFilter);

      const res = await fetch(`/api/recruiter/applicants?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.candidates || [];
        setCandidates(list);

        // Retain or select active candidate
        if (list.length > 0) {
          if (activeCandidate) {
            const updatedActive = list.find(c => c.application_id === activeCandidate.application_id);
            setActiveCandidate(updatedActive || list[0]);
          } else {
            setActiveCandidate(list[0]);
          }
        } else {
          setActiveCandidate(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [token, search, skillsFilter, expFilter, locationFilter]);

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
        loadCandidates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Candidate Pipeline</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review verified profile portfolios, resume skills match indexes, and manage stages.</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            placeholder="Filter by skills (e.g. React)..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="relative">
          <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={expFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            placeholder="Filter by experience (e.g. Lead)..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter by location (e.g. Austin)..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-soft">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-500 font-medium">No candidates match your active pipeline filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Candidates list panel (1/3 width) */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {candidates.map((cand) => (
              <div
                key={cand.application_id}
                onClick={() => setActiveCandidate(cand)}
                className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                  activeCandidate?.application_id === cand.application_id
                    ? 'bg-primary/5 border-primary shadow-sm dark:bg-primary/10'
                    : 'bg-white dark:bg-[#111827] border-gray-100 dark:border-gray-800 hover:shadow-soft'
                }`}
              >
                <div className="space-y-1 truncate">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{cand.candidate_name}</h4>
                  <p className="text-xs text-gray-400 font-bold truncate">{cand.job_title}</p>

                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mt-1 ${
                    cand.status === 'Hired'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : cand.status === 'Interviewing'
                      ? 'bg-yellow-500/10 text-yellow-600'
                      : cand.status === 'Shortlisted'
                      ? 'bg-blue-500/10 text-blue-600'
                      : cand.status === 'Rejected'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {cand.status}
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                    cand.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' : cand.matchScore >= 50 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-red-500/10 text-red-600'
                  }`}>
                    {cand.matchScore}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Candidate Detailed Resume portfolio viewer (2/3 width) */}
          {activeCandidate && (
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">

              {/* Profile Card Header */}
              <div className="p-6 bg-gradient-to-r from-primary to-accent text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-black">{activeCandidate.candidate_name}</h2>
                  <p className="text-sm text-white/80 font-semibold mt-1">Applying for: <span className="font-extrabold">{activeCandidate.job_title}</span></p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {activeCandidate.github_url && (
                      <a href={activeCandidate.github_url} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-all">
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {activeCandidate.linkedin_url && (
                      <a href={activeCandidate.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-all">
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    <a href={activeCandidate.resume_url} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 px-3 py-1 bg-white/20 rounded-lg text-xs font-black hover:bg-white/30 transition-all">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume PDF</span>
                    </a>
                  </div>
                </div>

                {/* ATS Scoring Match ratio indicator */}
                <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-2xl text-center shrink-0 border border-white/10">
                  <p className="text-3xl font-black">{activeCandidate.matchScore}%</p>
                  <p className="text-[10px] text-white/80 uppercase font-bold tracking-wider mt-0.5">Resume Score Match</p>
                </div>
              </div>

              {/* Status workflow action bar */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-50 dark:border-gray-800/40 flex flex-wrap gap-2 justify-between items-center px-6">
                <span className="text-xs text-gray-400 font-bold">Advance pipeline:</span>

                <div className="flex gap-2">
                  {activeCandidate.status === 'Applied' && (
                    <button
                      onClick={() => handleUpdateStatus(activeCandidate.application_id, 'Shortlisted')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                    >
                      Shortlist Candidate
                    </button>
                  )}
                  {(activeCandidate.status === 'Applied' || activeCandidate.status === 'Shortlisted') && (
                    <button
                      onClick={() => handleUpdateStatus(activeCandidate.application_id, 'Interviewing')}
                      className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xl"
                    >
                      Schedule Interview
                    </button>
                  )}
                  {activeCandidate.status === 'Interviewing' && (
                    <button
                      onClick={() => handleUpdateStatus(activeCandidate.application_id, 'Hired')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                    >
                      Hire Candidate
                    </button>
                  )}
                  {activeCandidate.status !== 'Hired' && activeCandidate.status !== 'Rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(activeCandidate.application_id, 'Rejected')}
                      className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl"
                    >
                      Reject Candidate
                    </button>
                  )}
                  {(activeCandidate.status === 'Hired' || activeCandidate.status === 'Rejected') && (
                    <span className="text-xs font-bold text-gray-400 italic">Candidate terminal state reached</span>
                  )}
                </div>
              </div>

              {/* Profile/Resume Body content */}
              <div className="p-6 space-y-8 max-h-[480px] overflow-y-auto">

                {/* Skills match check */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Capability Assessment</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      We compared {activeCandidate.candidate_name}'s skills with the role requirements.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCandidate.skills.map((skill, index) => {
                        const isMatch = activeCandidate.matchDetails?.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                        return (
                          <span
                            key={index}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                              isMatch
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}
                          >
                            <span>{skill}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* About Profile */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Candidate Bio</h4>
                  <p className="text-sm font-bold leading-relaxed text-gray-700 dark:text-gray-200">
                    {activeCandidate.about || "No biography provided by candidate."}
                  </p>
                </div>

                {/* Education list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    <span>Education</span>
                  </h4>
                  <div className="space-y-3">
                    {activeCandidate.education && activeCandidate.education.length > 0 ? (
                      activeCandidate.education.map((edu, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-gray-900 dark:text-white">{edu.degree}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{edu.institution}</p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{edu.year}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No education details parsed.</p>
                    )}
                  </div>
                </div>

                {/* Experience items */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <Briefcase className="w-4 h-4 text-yellow-500" />
                    <span>Experience History</span>
                  </h4>
                  <div className="space-y-3">
                    {activeCandidate.experience && activeCandidate.experience.length > 0 ? (
                      activeCandidate.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                          <div className="flex justify-between">
                            <p className="text-xs font-extrabold text-gray-900 dark:text-white">{exp.role}</p>
                            <span className="text-[10px] font-bold text-gray-400">{exp.year}</span>
                          </div>
                          <p className="text-[10px] text-primary dark:text-primary-light font-bold">{exp.company}</p>
                          <p className="text-xs text-gray-400 leading-relaxed font-semibold pt-1">{exp.desc}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No work history details parsed.</p>
                    )}
                  </div>
                </div>

                {/* Custom timeline tracking status change */}
                <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-800/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Workflow Timeline Tracker</h4>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                    <div className="relative flex items-start space-x-3">
                      <div className="absolute -left-6 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#111827]"></div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-white">Applied successfully</p>
                        <p className="text-[10px] text-gray-400 font-bold">Resumes scanned & registered natively inside ElevateX ATS</p>
                      </div>
                    </div>

                    {activeCandidate.status !== 'Applied' && (
                      <div className="relative flex items-start space-x-3">
                        <div className="absolute -left-6 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-[#111827]"></div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white">Shortlist passed</p>
                          <p className="text-[10px] text-gray-400 font-bold">Skills mismatch criteria evaluated by recruiting lead</p>
                        </div>
                      </div>
                    )}

                    {activeCandidate.status === 'Interviewing' && (
                      <div className="relative flex items-start space-x-3">
                        <div className="absolute -left-6 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white dark:border-[#111827]"></div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white">Interview Scheduled</p>
                          <p className="text-[10px] text-gray-400 font-bold">Interactive screening loop conducted in high fidelity</p>
                        </div>
                      </div>
                    )}

                    {activeCandidate.status === 'Hired' && (
                      <div className="relative flex items-start space-x-3">
                        <div className="absolute -left-6 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#111827]"></div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white">Contract Hired</p>
                          <p className="text-[10px] text-gray-400 font-bold">Welcome letter sent! Verified credentials locked in student profile</p>
                        </div>
                      </div>
                    )}

                    {activeCandidate.status === 'Rejected' && (
                      <div className="relative flex items-start space-x-3">
                        <div className="absolute -left-6 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-[#111827]"></div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white">Application Rejected</p>
                          <p className="text-[10px] text-gray-400 font-bold">Talent pool status archived for alternative prospective openings</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
