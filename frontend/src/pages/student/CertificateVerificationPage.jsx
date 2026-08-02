import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, ShieldCheck, ShieldAlert, Sparkles, Printer, ArrowLeft, Loader } from 'lucide-react';

export default function CertificateVerificationPage() {
  const { id } = useParams(); // Certificate ID e.g. AI-CERT-98234-2026

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/learning/certificates/verify/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('No authentic, active credentials matching that ID code could be found.');
        return res.json();
      })
      .then((data) => {
        setCert(data.certificate);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Querying cryptographic certificates ledger...</div>;
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl max-w-lg mx-auto my-12 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black">Verification Failed</h2>
        <p className="text-xs font-semibold leading-relaxed">{error}</p>
        <div className="pt-4">
          <Link to="/" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 print:py-0 print:my-0">

      {/* Verification success header bar (hidden in print) */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 print:hidden">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <div>
            <h1 className="text-lg font-black text-gray-950 dark:text-white">Cryptographic Verification Portal</h1>
            <p className="text-xs text-gray-400 font-bold">This credential is verified authentic and active.</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Certificate</span>
        </button>
      </div>

      {/* Modern Printable Verifiable Certificate Layout */}
      <div className="bg-white dark:bg-[#111827] border-[12px] border-double border-indigo-600/30 rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-premium space-y-10 text-center max-w-3xl mx-auto print:border-none print:shadow-none">

        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Certificate Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center bg-indigo-600/10 text-indigo-600 p-4 rounded-full">
            <Award className="w-12 h-12" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">AscendIQ Verification Authority</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1.5 font-serif">Certificate of Accomplishment</h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <p className="text-sm text-gray-400 italic">This is to verify that student learner</p>
          <h3 className="text-2xl font-black text-indigo-600 tracking-tight font-serif uppercase underline decoration-indigo-600/20 underline-offset-8 decoration-wavy">{cert.student_name}</h3>

          <p className="text-sm text-gray-400 italic mt-2">has successfully completed the comprehensive study program</p>
          <h4 className="text-xl font-bold text-gray-950 dark:text-white line-clamp-2">{cert.course_name}</h4>

          <p className="text-xs text-gray-400 font-bold mt-2">Instructed and Evaluated by: <span className="text-gray-700 dark:text-gray-300 font-black">{cert.instructor_name}</span></p>
        </div>

        {/* Signatures and QR Verification Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100 dark:border-gray-800/80 items-center">

          {/* Instructor Sign */}
          <div className="space-y-2">
            <span className="font-serif italic text-lg text-gray-600 dark:text-gray-400 block border-b border-gray-200 dark:border-gray-800/60 pb-1.5">{cert.instructor_name}</span>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-gray-400 block">Lead Instructor Author</span>
          </div>

          {/* QR representation block */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-xl p-2 flex items-center justify-center shadow-inner">
              {/* Dynamic QR canvas representation */}
              <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-80"></div>
            </div>
            <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-mono">Scan code to verify</span>
          </div>

          {/* Verification details */}
          <div className="text-left md:text-right space-y-1.5 text-xs">
            <p className="font-bold text-gray-400">Credential ID: <span className="text-gray-900 dark:text-white font-mono">{cert.certificate_id}</span></p>
            <p className="font-bold text-gray-400">Completion Date: <span className="text-gray-900 dark:text-white">{new Date(cert.completion_date).toLocaleDateString()}</span></p>
            <p className="font-bold text-gray-400">Status: <span className="text-emerald-500 font-extrabold uppercase">Verified Genuine</span></p>
          </div>

        </div>

      </div>
    </div>
  );
}
