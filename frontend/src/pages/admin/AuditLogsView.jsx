import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCw, Clock } from 'lucide-react';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    const url = `/api/admin/logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&action_type=${actionFilter}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load system audit trails.');
        return res.json();
      })
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, actionFilter]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Security & Audit Trails</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Immutable trace logs of platform events, staff operations, credentials mutations, and access controls.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm hover:shadow-md text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs by email, IP or description text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">All Action Types</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGIN_BANNED">LOGIN_BANNED</option>
            <option value="LOGIN_INACTIVE">LOGIN_INACTIVE</option>
            <option value="USER_UPDATE">USER_UPDATE</option>
            <option value="USER_DELETE">USER_DELETE</option>
            <option value="COURSE_MODERATION">COURSE_MODERATION</option>
            <option value="JOB_MODERATION">JOB_MODERATION</option>
            <option value="CERTIFICATE_REVOCATION_TOGGLE">CERTIFICATE_REVOCATION_TOGGLE</option>
            <option value="PLATFORM_SETTINGS_UPDATE">PLATFORM_SETTINGS_UPDATE</option>
          </select>
        </div>
      </div>

      {/* Logs Listing Grid */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <th className="p-5">Timestamp</th>
                <th className="p-5">User Account</th>
                <th className="p-5">Audit Action</th>
                <th className="p-5">Description</th>
                <th className="p-5">IP Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm font-medium text-gray-700 dark:text-gray-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all text-xs">
                  <td className="p-5 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1.5 text-gray-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="font-bold text-gray-950 dark:text-white">{log.user_email || 'System'}</span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      log.action_type.includes('BANNED') || log.action_type.includes('DELETE')
                        ? 'bg-rose-500/10 text-rose-500'
                        : log.action_type.includes('UPDATE') || log.action_type.includes('MODERATION')
                          ? 'bg-indigo-500/10 text-indigo-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-5 max-w-xs md:max-w-md truncate" title={log.description}>
                    <span className="text-gray-600 dark:text-gray-300 font-bold">{log.description}</span>
                  </td>
                  <td className="p-5 font-mono text-gray-400">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 font-bold">
                    No matching security trace records inside active log buffers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">Showing {logs.length} of {total} logs</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
