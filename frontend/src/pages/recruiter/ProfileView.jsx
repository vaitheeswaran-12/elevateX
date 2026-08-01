import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Building2,
  Globe,
  Users,
  MapPin,
  Linkedin,
  Twitter,
  AlertCircle,
  CheckCircle,
  FileText,
  Sparkles
} from 'lucide-react';

export default function ProfileView() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [about, setAbout] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/recruiter/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setProfile(d);
        setName(d.company_name || '');
        setLogoUrl(d.logo_url || '');
        setWebsite(d.website || '');
        setAbout(d.about || '');
        setIndustry(d.industry || '');
        setSize(d.company_size || '1-10 employees');
        setHeadquarters(d.headquarters || 'San Francisco, CA');
        setLinkedinUrl(d.linkedin_url || '');
        setTwitterUrl(d.twitter_url || '');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve company profile information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/recruiter/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: name,
          logo_url: logoUrl,
          website,
          about,
          industry,
          company_size: size,
          headquarters,
          linkedin_url: linkedinUrl,
          twitter_url: twitterUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Company profile updated successfully!');
        loadProfile();
      } else {
        setError(data.message || 'Error occurred while saving profile changes');
      }
    } catch (err) {
      console.error(err);
      setError('Network communication failed');
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
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Company Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure company profiles, metadata, logo, and social accounts seen by prospective candidates.</p>
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

      <form onSubmit={handleUpdate} className="space-y-8">

        {/* Company Overview Block */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-6">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Profile Identity</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Company Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NeuralCorp Systems"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Logo Image URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or absolute link"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">About Company</label>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell prospective developers about the company's core mission, stack, research targets, and growth prospects..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Company Attributes Block */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-6">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
            <Globe className="w-4 h-4 text-accent" />
            <span>HQ & Attributes</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://neuralcorp.systems"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Industry Sector</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. AI & Machine Learning labs"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Company Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              >
                <option value="1-10 employees">1-10 employees (Sartup)</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="500+ employees">500+ employees (Enterprise)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Headquarters Location</label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Corporate social handles Block */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-6">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Corporate Social Links</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <Linkedin className="w-3.5 h-3.5 text-primary" />
                <span>LinkedIn Corporate URL</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/neuralcorp"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <Twitter className="w-3.5 h-3.5 text-accent" />
                <span>Twitter / X Profile URL</span>
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/neuralcorp"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white text-sm font-black rounded-2xl shadow-premium transition-all hover:-translate-y-0.5"
        >
          Save Profile Updates
        </button>

      </form>
    </div>
  );
}
