import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, AlertCircle, ArrowLeft, CheckCircle2, Clipboard } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  // For password reset simulation after receiving token
  const [newPassword, setNewPassword] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setSuccess(true);
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter your new password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Reset failed');
      }

      setResetComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-2xl mb-4 dark:bg-primary/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {resetComplete ? 'Reset Successful!' : success ? 'Simulated Inbox' : 'Reset password'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {resetComplete
              ? 'Your password has been securely updated!'
              : success
              ? 'We have intercepted the simulated reset request.'
              : 'Enter your email to request a simulated authentication token.'}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {resetComplete ? (
          /* Step 3: Success Confirmation */
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can now proceed to log in with your freshly configured security password!
            </p>
            <Link
              to="/login"
              className="w-full py-3 px-4 flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-2xl shadow-premium transition-all"
            >
              Back to Sign In
            </Link>
          </div>
        ) : success ? (
          /* Step 2: Simulated Reset Token Input */
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-sm space-y-2.5 text-blue-800 dark:text-blue-300">
              <p className="font-semibold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0 text-blue-500" />
                Token intercepted successfully!
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                Copy this secure cryptographic verification token to verify and apply your password reset.
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-blue-200/50 mt-2 font-mono text-xs text-gray-800 dark:text-gray-200 break-all select-all">
                <span>{resetToken}</span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
              {copied && <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold text-right">Copied!</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                New Secure Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-2xl shadow-premium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Reset Security Password</span>
              )}
            </button>
          </form>
        ) : (
          /* Step 1: Initial Email Request Form */
          <form onSubmit={handleRequestToken} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-2xl shadow-premium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Request Verification Link</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation Back */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Login screen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
