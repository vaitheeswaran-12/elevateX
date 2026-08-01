import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function CertificatesView() {
  const [certs, setCerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifiedResult, setVerifiedResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchCerts = () => {
    setLoading(true);
    let url = `/api/admin/certificates?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve certificates history.');
        return res.json();
      })
      .then((data) => {
        setCerts(data.certificates);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCerts();
  }, [page, search]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;

    fetch(`/api/admin/certificates/verify?code=${encodeURIComponent(verifyCode.trim())}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('No certificates found matching that code.');
        return res.json();
      })
      .then((data) => {
        setVerifiedResult(data.certificate);
        showToast('Certificate successfully located and verified!');
      })
      .catch((err) => {
        setVerifiedResult({ error: err.message });
        showToast(err.message, 'error');
      });
  };

  const handleToggleRevocation = (certId, currentRevoked) => {
    fetch(`/api/admin/certificates/${certId}/revoke`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ is_revoked: !currentRevoked })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to alter revocation state.');
        return res.json();
      })
      .then(() => {
        showToast(currentRevoked ? 'Certificate has been fully restored.' : 'Certificate successfully revoked!');
        fetchCerts();
        if (verifiedResult && verifiedResult.id === certId) {
          setVerifiedResult({ ...verifiedResult, is_revoked: currentRevoked ? 0 : 1 });
        }
      })
      .catch((err) => showToast(err.message, 'error'));
  };

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Credentials Ledger</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Audit academic certificates, verify cryptographic keys, and manage revocations.</p>
        </div>
        <button
          onClick={fetchCerts}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm hover:shadow-md text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Ledger split screen: Cert Search vs Database listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Certificate Verification input card */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 self-start">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Verify Cryptographic Code</span>
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-1">Input certificate UUID or ID hash to verify validity.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              placeholder="e.g. AI-CERT-98234-2026"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl shadow-md transition-all"
            >
              Verify Credential
            </button>
          </form>

          {/* Verification result card */}
          {verifiedResult && (
            <div className={`p-5 rounded-2xl border ${
              verifiedResult.error
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                : verifiedResult.is_revoked === 1
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              {verifiedResult.error ? (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest">Verification Failed</h4>
                  <p className="text-sm mt-1">{verifiedResult.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-xs uppercase tracking-widest">
                      {verifiedResult.is_revoked === 1 ? 'REVOKED LEDGER' : 'VERIFIED GENUINE'}
                    </h4>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Student: <span className="text-gray-900 dark:text-white">{verifiedResult.student_name}</span></p>
                    <p className="font-bold">Course: <span className="text-gray-900 dark:text-white">{verifiedResult.course_name}</span></p>
                    <p className="font-bold">Instructor: <span className="text-gray-900 dark:text-white">{verifiedResult.instructor_name}</span></p>
                    <p className="font-bold">Date: <span className="text-gray-900 dark:text-white">{new Date(verifiedResult.completion_date).toLocaleDateString()}</span></p>
                  </div>
                  {verifiedResult.is_revoked === 1 ? (
                    <button
                      onClick={() => handleToggleRevocation(verifiedResult.id, true)}
                      className="w-full py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg mt-2"
                    >
                      Restore Credential
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleRevocation(verifiedResult.id, false)}
                      className="w-full py-2 bg-rose-500 text-white text-xs font-bold rounded-lg mt-2"
                    >
                      Revoke Credential
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificate listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history by candidate or course name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800/80 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-gray-900 dark:text-white shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                    <th className="p-5">Credential ID / Student</th>
                    <th className="p-5">Course</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Revocation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {certs.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                      <td className="p-5">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{c.certificate_id}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{c.student_name}</p>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{c.course_name}</span>
                      </td>
                      <td className="p-5">
                        {c.is_revoked === 1 ? (
                          <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">Revoked</span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">Valid Ledger</span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        {c.is_revoked === 1 ? (
                          <button
                            onClick={() => handleToggleRevocation(c.id, true)}
                            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 rounded-lg inline-flex"
                            title="Restore Credential"
                          >
                            <RotateCcw className="w-4.5 h-4.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleRevocation(c.id, false)}
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-lg inline-flex"
                            title="Revoke Credential"
                          >
                            <XCircle className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {certs.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-gray-400 font-bold">
                        No certificates issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
