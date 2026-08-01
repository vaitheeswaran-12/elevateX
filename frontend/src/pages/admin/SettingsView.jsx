import React, { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    platform_name: '',
    support_email: '',
    maintenance_mode: 'false',
    commission_rate: '15',
    email_template_verification: '',
    email_template_welcome: '',
    email_template_reset: ''
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchSettings = () => {
    setLoading(true);
    fetch('/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load system settings.');
        return res.json();
      })
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          ...data.settings
        }));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setUpdating(true);

    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(settings)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save system configurations.');
        return res.json();
      })
      .then(() => {
        showToast('SaaS parameters and settings updated successfully!');
        setUpdating(false);
      })
      .catch((err) => {
        showToast(err.message, 'error');
        setUpdating(false);
      });
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading global settings details...</div>;
  }

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
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global parameters, SaaS commission, identity verification rules, and automated mailers.</p>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Core Configurations */}
        <div className="lg:col-span-2 space-y-8">

          {/* SaaS settings */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2 border-b border-gray-50 dark:border-gray-800/80 pb-4">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">General SaaS Setup</h3>
                <p className="text-xs text-gray-400 font-bold">Configure branding variables and operational variables.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Platform Brand Name</label>
                <input
                  type="text"
                  required
                  value={settings.platform_name}
                  onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Support Desk Coordinates (Email)</label>
                <input
                  type="email"
                  required
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Commission Retention Percentage (%)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs text-gray-400 font-bold">%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={settings.commission_rate}
                    onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Maintenance Mode Restrictions</label>
                <select
                  value={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="false">Online (Standard Operation)</option>
                  <option value="true">Lock System (Maintenance Screen)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Templates configurations */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-50 dark:border-gray-800 pb-4">
              <Mail className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Communication Templates</h3>
                <p className="text-xs text-gray-400 font-bold">Standard automated transactional mail systems using dynamic tags.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Email Identity Verification Template</label>
                <textarea
                  rows="3"
                  value={settings.email_template_verification}
                  onChange={(e) => setSettings({ ...settings, email_template_verification: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">New Account Welcome Template</label>
                <textarea
                  rows="3"
                  value={settings.email_template_welcome}
                  onChange={(e) => setSettings({ ...settings, email_template_welcome: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Password Reset Template</label>
                <textarea
                  rows="3"
                  value={settings.email_template_reset}
                  onChange={(e) => setSettings({ ...settings, email_template_reset: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none font-mono text-xs"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Security policies and Submit */}
        <div className="space-y-8 self-start">

          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2 border-b border-gray-50 dark:border-gray-800/80 pb-4">
              <Shield className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Security Controls</h3>
                <p className="text-xs text-gray-400 font-bold">Standard security configuration settings.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-gray-700 dark:text-gray-300">Minimum Password Complexity</span>
                <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md font-bold">6+ Chars</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-gray-700 dark:text-gray-300">Force Multi-Factor (Admin Only)</span>
                <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md font-bold">Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-gray-700 dark:text-gray-300">Session Lockout Threshold</span>
                <span className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md font-bold">5 Attempts</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-sm font-black text-white rounded-2xl shadow-premium hover:shadow-premium-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            <span>{updating ? 'Saving Global Settings...' : 'Save Global Parameters'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
