import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token in URL path.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification token.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setMessage('Unable to communicate with verification server.');
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all">
        {/* Decorative Badge */}
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-2xl mb-6 dark:bg-primary/20">
          <Sparkles className="w-6 h-6" />
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we secure your account credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Account Verified!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}. Thank you for verifying your ElevateX account. Your digital workspace is now ready!
            </p>
            <div className="pt-3">
              <Link
                to="/login"
                className="w-full py-3 px-4 flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-2xl shadow-premium hover:shadow-lg transition-all"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Failed</h3>
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3.5 rounded-xl border border-red-100 dark:border-red-900/10 font-medium">
              {message}
            </p>
            <div className="pt-3 space-y-2">
              <Link
                to="/register"
                className="block w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-2xl shadow-premium transition-all"
              >
                Create a new account
              </Link>
              <Link
                to="/"
                className="block text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Return to home page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
