import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  User,
  Plus,
  X,
  Link as LinkIcon,
  FileText,
  Github,
  Linkedin,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Save
} from 'lucide-react';

export default function ProfileView() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Core Editable Form States
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Form Adding states
  const [newSkill, setNewSkill] = useState('');
  const [eduInst, setEduInst] = useState('');
  const [eduDeg, setEduDeg] = useState('');
  const [eduYear, setEduYear] = useState('');

  const [expComp, setExpComp] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expYear, setExpYear] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');

  // Simulated resume upload states
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        const res = await fetch('/api/student/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.user.name);
          if (data.profile) {
            setProfile(data.profile);
            setAbout(data.profile.about || '');
            setSkills(data.profile.skills || []);
            setEducation(data.profile.education || []);
            setExperience(data.profile.experience || []);
            setProjects(data.profile.projects || []);
            setGithubUrl(data.profile.github_url || '');
            setLinkedinUrl(data.profile.linkedin_url || '');
            setAvatarUrl(data.profile.avatar_url || '');
            setResumeUrl(data.profile.resume_url || '');
            if (data.profile.resume_url) {
              setResumeFileName(data.profile.resume_url.split('/').pop());
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  // Handle updates to server
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaveLoading(true);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          about,
          skills,
          education,
          experience,
          projects,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          avatar_url: avatarUrl,
          resume_url: resumeUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setSuccess('Profile successfully updated!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // ==========================================
  // DYNAMIC ADD/REMOVE ACTIONS
  // ==========================================

  // Skills
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Education
  const handleAddEdu = (e) => {
    e.preventDefault();
    if (!eduInst.trim() || !eduDeg.trim()) return;
    const item = { institution: eduInst, degree: eduDeg, year: eduYear || 'Ongoing' };
    setEducation([...education, item]);
    setEduInst('');
    setEduDeg('');
    setEduYear('');
  };

  const handleRemoveEdu = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  // Experience
  const handleAddExp = (e) => {
    e.preventDefault();
    if (!expComp.trim() || !expRole.trim()) return;
    const item = { company: expComp, role: expRole, year: expYear || 'Ongoing', desc: expDesc };
    setExperience([...experience, item]);
    setExpComp('');
    setExpRole('');
    setExpYear('');
    setExpDesc('');
  };

  const handleRemoveExp = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  // Projects
  const handleAddProj = (e) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const item = { title: projTitle, desc: projDesc, link: projLink };
    setProjects([...projects, item]);
    setProjTitle('');
    setProjDesc('');
    setProjLink('');
  };

  const handleRemoveProj = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  // Simulated Resume upload
  const handleSimulateResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setResumeFileName(file.name);

    setTimeout(() => {
      setUploadingResume(false);
      setResumeUrl(`https://ascendiq.storage/resumes/${file.name}`);
      setSuccess('Resume simulated upload complete! Save changes to sync profile.');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn">

      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Student Portfolio</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Populate details representing your technical competencies and career achievements.</p>
      </div>

      {/* Success/Error Toast alerts */}
      {success && (
        <div className="flex items-center space-x-2.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ==========================================
            COLUMN 1: METADATA & LINKS
            ========================================== */}
        <div className="space-y-6">

          {/* Avatar and Primary Details card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-accent mx-auto flex items-center justify-center text-white text-3xl font-black shadow-premium">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{name}</h3>
              <p className="text-xs text-gray-400 capitalize">{user?.role} Account</p>
            </div>

            {/* Avatar URL text input */}
            <div className="text-left pt-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Social and Repository anchors */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Social Connections</h4>

            <div className="space-y-3.5">
              {/* GitHub */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center"><Github className="w-3.5 h-3.5 mr-1" /> GitHub Link</label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center"><Linkedin className="w-3.5 h-3.5 mr-1" /> LinkedIn Profile</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Simulated Resume Upload Panel */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Verifiable Resume</h4>

            {uploadingResume ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 font-medium">Encrypting and uploading document...</p>
              </div>
            ) : resumeUrl ? (
              <div className="p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <FileCheck className="w-8 h-8 text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{resumeFileName || 'Uploaded Resume'}</p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">Simulated in Storage</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setResumeUrl(''); setResumeFileName(''); }}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary/40 dark:hover:border-primary/40 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Choose resume file</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Supports PDF or DOCX up to 5MB</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleSimulateResumeUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* ==========================================
            COLUMN 2: BIO, SKILLS, EXPERIENCE, PROJECTS
            ========================================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bio Description textarea */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Professional Summary</h4>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">About Me</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Detail your professional aspirations, active specialties, or previous coding triumphs..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Interactive Skills Inventory */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Interactive Skills Inventory</h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Type a skill (e.g., PyTorch, Figma)"
                className="flex-grow px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Render active skill tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary-light rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-primary/10"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-primary/20 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Education History */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Education Details</h4>

            {/* Adding education nested form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <input
                type="text"
                placeholder="Institution (e.g., Stanford)"
                value={eduInst}
                onChange={(e) => setEduInst(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Degree (e.g., B.S. CS)"
                value={eduDeg}
                onChange={(e) => setEduDeg(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Years (e.g., 2023 - 2026)"
                  value={eduYear}
                  onChange={(e) => setEduYear(e.target.value)}
                  className="flex-grow px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddEdu}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Render Education History */}
            <div className="space-y-3 pt-2">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">{edu.degree}</h5>
                      <p className="text-xs text-gray-500">{edu.institution} • {edu.year}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEdu(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Experience */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Professional Experience</h4>

            {/* Adding experience nested form */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Company (e.g., Stripe)"
                  value={expComp}
                  onChange={(e) => setExpComp(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Role (e.g., Frontend Intern)"
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Year (e.g., Summer 2025)"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quick Description of your work..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="flex-grow px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddExp}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Render Experience list */}
            <div className="space-y-3 pt-2">
              {experience.map((exp, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">{exp.role}</h5>
                      <p className="text-xs text-gray-500">{exp.company} • {exp.year}</p>
                      {exp.desc && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{exp.desc}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExp(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Portfolio */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Featured Projects</h4>

            {/* Adding project nested form */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Name (e.g., NeuralScribe)"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Repository/Demo Link URL"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Description of architecture and frameworks..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="flex-grow px-3 py-2 bg-white dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddProj}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Render Projects list */}
            <div className="space-y-3 pt-2">
              {projects.map((proj, idx) => (
                <div key={idx} className="flex justify-between items-start p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="space-y-1.5 min-w-0">
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">{proj.title}</h5>
                    {proj.desc && <p className="text-xs text-gray-400 leading-relaxed truncate">{proj.desc}</p>}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center"
                      >
                        <LinkIcon className="w-3.5 h-3.5 mr-1" />
                        <span>View Project Hub</span>
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProj(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submission and Save actions */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-2xl shadow-premium hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {saveLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Portfolio Changes</span>
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
