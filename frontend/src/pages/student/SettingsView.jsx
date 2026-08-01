import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Settings,
  Mail,
  Lock,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save
} from 'lucide-react';

export default function SettingsView() {
  const { token, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Form Fields
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field-level confirmation validation
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update settings');

      setSuccess('Configurations saved successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header description */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Account Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage private verification addresses, security credentials, and interface themes.</p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="flex items-center space-x-2.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitSettings} className="space-y-6">

        {/* Core Account Info */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>Core Account Info</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Registered Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Security and Credentials updates */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>Security & Passwords</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Dark Mode selector block */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center space-x-2">
            <Sun className="w-5 h-5 text-primary" />
            <span>Theme Preferences</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Sovereign Dark Mode</p>
              <p className="text-xs text-gray-400">Enhance battery and contrast performance in dim workspaces.</p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`w-14 h-7.5 rounded-full p-1 transition-colors focus:outline-none flex items-center ${
                theme === 'dark' ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                theme === 'dark' ? 'translate-x-6.5' : 'translate-x-0'
              } flex items-center justify-center text-xs`}>
                {theme === 'dark' ? <Moon className="w-3 h-3 text-primary" /> : <Sun className="w-3 h-3 text-yellow-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* Submit setting change action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-2xl shadow-premium hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configurations</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
