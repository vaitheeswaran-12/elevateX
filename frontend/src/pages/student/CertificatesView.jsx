import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Award,
  Calendar,
  User,
  ShieldCheck,
  QrCode,
  Share2,
  X,
  ExternalLink,
  Download
} from 'lucide-react';

export default function CertificatesView() {
  const { token, user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVerify, setActiveVerify] = useState(null); // modal preview active state

  useEffect(() => {
    async function loadCerts() {
      if (!token) return;
      try {
        const res = await fetch('/api/student/certificates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setCerts(d);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCerts();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Verified Achievements</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Access cryptographic credentials, share placement verified scores, and view certification files.</p>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3 shadow-soft">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">No certificates earned yet.</p>
          <p className="text-xs text-gray-400">Complete curriculum paths and score above 80% on assessment quizzes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-premium transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-1 bg-green-500/10 text-green-600 px-3 py-1 rounded-xl text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Cryptographic ID</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {item.course_name}
                  </h3>
                  <p className="text-xs text-gray-400">Authorized by instructor: {item.instructor_name}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="font-mono">ID: {item.certificate_id}</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Jul 28, 2026</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center">
                <button
                  onClick={() => alert('Initiating simulated secure PDF print stream...')}
                  className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => setActiveVerify(item)}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium"
                >
                  Verification Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VERIFICATION MODAL PREVIEW */}
      {activeVerify && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-fadeIn">
            {/* Header banner */}
            <div className="p-4 bg-gradient-to-r from-primary to-accent text-white flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> Certification Verification</span>
              <button
                onClick={() => setActiveVerify(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Visual credential */}
            <div className="p-8 text-center space-y-6">

              {/* ElevateX Stamp icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">ElevateX Verification Certificate</h4>
                <p className="text-xs text-gray-500 font-medium">This document certifies that</p>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{activeVerify.student_name}</h3>
              </div>

              <div className="space-y-1 py-3 border-y border-gray-50 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">has successfully completed curriculum for</p>
                <h4 className="text-sm font-extrabold text-primary">{activeVerify.course_name}</h4>
                <p className="text-[11px] text-gray-400">Authorized by {activeVerify.instructor_name}</p>
              </div>

              {/* QR Code illustration block */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 inline-flex flex-col items-center">
                <div className="w-24 h-24 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center">
                  {/* Simulated QR block layout */}
                  <div className="w-full h-full bg-[radial-gradient(#2563EB_20%,transparent_20%)] bg-[size:10px_10px] opacity-70"></div>
                </div>
                <span className="text-[10px] font-mono text-gray-400 mt-2">ID: {activeVerify.certificate_id}</span>
              </div>

              {/* Direct share actions */}
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={() => alert('Link copied to clipboard!')}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={`/verify/${activeVerify.certificate_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium transition-colors flex items-center space-x-1"
                >
                  <span>Verification Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
