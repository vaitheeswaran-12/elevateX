import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  User,
  Github,
  Linkedin,
  Save,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function ProfileView() {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');

  // Local state form fields
  const [bio, setBio] = useState('Assistant professor of Neural Systems engineering and sovereign learning path structures.');
  const [skills, setSkills] = useState('Machine Learning, PyTorch, React, Python');
  const [github, setGithub] = useState('https://github.com/jenkins-sarah');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/sarah-jenkins');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccess('Instructor profile details successfully updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header and description */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Studio Bio</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage instructor credentials, portfolios, and social accounts.</p>
      </div>

      {success && (
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Profile Details</span>
          </h3>

          <div className="space-y-4 text-xs font-medium text-gray-600 dark:text-gray-300">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Biography Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Core Tech Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Portfolios and socials */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            <span>Socials & Networks</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 flex items-center"><Github className="w-3.5 h-3.5 mr-1" /> Github</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 flex items-center"><Linkedin className="w-3.5 h-3.5 mr-1" /> LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Biography Details</span>
          </button>
        </div>
      </form>
    </div>
  );
}
