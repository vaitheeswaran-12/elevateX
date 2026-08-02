import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Sparkles, Mail, Lock, User, Briefcase, GraduationCap, ShieldAlert, AlertCircle, ArrowRight, Chrome } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { register, googleLogin, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all standard inputs');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await register(name, email, password, role);
      // Redirect based on selected roles
      if (loggedUser.role === 'student') navigate('/student-dashboard');
      else if (loggedUser.role === 'instructor') navigate('/instructor-dashboard');
      else if (loggedUser.role === 'recruiter') navigate('/recruiter-dashboard');
      else if (loggedUser.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      // Create user under Google auth with the selected role! This is elegant!
      const loggedUser = await googleLogin('google_user@gmail.com', 'Google User', role);
      if (loggedUser.role === 'student') navigate('/student-dashboard');
      else if (loggedUser.role === 'instructor') navigate('/instructor-dashboard');
      else if (loggedUser.role === 'recruiter') navigate('/recruiter-dashboard');
      else if (loggedUser.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-2xl mb-4 dark:bg-primary/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            One platform. Unlimited learning and career acceleration.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* User Role Selection - Premium Card Grid */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                Choose your role on ElevateX
              </label>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {/* Student */}
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                    role === 'student'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-xs font-bold">Student</span>
                </button>

                {/* Instructor */}
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                    role === 'instructor'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="text-xs font-bold">Instructor</span>
                </button>

                {/* Recruiter */}
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                    role === 'recruiter'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="text-xs font-bold">Recruiter</span>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                    role === 'admin'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <ShieldAlert className="w-6 h-6" />
                  <span className="text-xs font-bold">Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-2xl shadow-premium hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 font-semibold uppercase tracking-wider">
              Or Register via
            </span>
          </div>
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3 px-4 flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm rounded-2xl transition-all"
        >
          <Chrome className="w-4 h-4 text-red-500" />
          <span>Register with Google as <span className="capitalize font-bold text-primary">{role}</span></span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:text-primary-dark dark:hover:text-primary-light"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
