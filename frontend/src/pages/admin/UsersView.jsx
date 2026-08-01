import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  UserMinus,
  Trash2,
  Key,
  Edit2,
  Lock,
  Unlock,
  Power,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals state
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    let url = `/api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${roleFilter}`;
    if (activeFilter !== '') url += `&is_active=${activeFilter}`;
    if (bannedFilter !== '') url += `&is_banned=${bannedFilter}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve system user accounts.');
        return res.json();
      })
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, activeFilter, bannedFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateUser = (updated) => {
    fetch(`/api/admin/users/${updated.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updated)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to execute user account update.');
        return res.json();
      })
      .then(() => {
        showToast('User profile updated successfully!');
        setEditUser(null);
        fetchUsers();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleResetPassword = (userId) => {
    if (!resetPasswordVal || resetPasswordVal.length < 6) {
      showToast('Password must consist of 6+ characters.', 'error');
      return;
    }
    fetch(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ password: resetPasswordVal })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to force password update.');
        return res.json();
      })
      .then(() => {
        showToast('Account password reset completed successfully!');
        setResetUser(null);
        setResetPasswordVal('');
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('CRITICAL ACTION: Are you completely sure you want to permanently delete this user account? This cannot be undone.')) return;

    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.message || 'Deletion failed'); });
        }
        return res.json();
      })
      .then(() => {
        showToast('User account successfully purged.');
        fetchUsers();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  return (
    <div className="space-y-8">

      {/* Toast Notification */}
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
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">User Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Audit, modify permissions, verify identity tokens, and secure the platforms population.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Dynamic Search & Filtering Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="1">Active</option>
            <option value="0">Deactivated</option>
          </select>
        </div>

        <div>
          <select
            value={bannedFilter}
            onChange={(e) => setBannedFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">Security Ban State</option>
            <option value="0">Unbanned</option>
            <option value="1">Banned Only</option>
          </select>
        </div>
      </div>

      {/* User Table Grid */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-800/40 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <th className="p-5">User Details</th>
                <th className="p-5">Role Category</th>
                <th className="p-5">Verification State</th>
                <th className="p-5">Active Status</th>
                <th className="p-5">Security Ban</th>
                <th className="p-5 text-right">Actions Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm font-medium text-gray-700 dark:text-gray-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                  <td className="p-5">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{u.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-5">
                    {u.is_verified === 1 ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold">
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    {u.is_active === 1 ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">Active</span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs font-bold">Inactive</span>
                    )}
                  </td>
                  <td className="p-5">
                    {u.is_banned === 1 ? (
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">Banned</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">Clear</span>
                    )}
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button
                      onClick={() => setEditUser(u)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 rounded-xl transition-colors inline-flex"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setResetUser(u)}
                      className="p-2 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500 rounded-xl transition-colors inline-flex"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors inline-flex"
                      title="Purge User Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                    No matching user registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {total > limit && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">Showing {users.length} of {total} registered users</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors text-gray-700 dark:text-gray-200"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors text-gray-700 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal Drawer */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-black text-lg text-gray-950 dark:text-white">Modify Profile Properties</h3>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(editUser);
            }} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">User Identity Name</label>
                <input
                  type="text"
                  required
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Email Coordinates</label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Role Type</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Email Identity</label>
                  <select
                    value={editUser.is_verified}
                    onChange={(e) => setEditUser({ ...editUser, is_verified: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="1">Verified</option>
                    <option value="0">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <Power className={`w-5 h-5 ${editUser.is_active === 1 ? 'text-emerald-500' : 'text-gray-400'}`} />
                  <div>
                    <span className="block text-xs font-black">Active Status</span>
                    <button
                      type="button"
                      onClick={() => setEditUser({ ...editUser, is_active: editUser.is_active === 1 ? 0 : 1 })}
                      className="text-[10px] uppercase font-extrabold text-indigo-600 hover:underline mt-0.5"
                    >
                      {editUser.is_active === 1 ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <Lock className={`w-5 h-5 ${editUser.is_banned === 1 ? 'text-rose-500' : 'text-emerald-500'}`} />
                  <div>
                    <span className="block text-xs font-black">Ban Restrictions</span>
                    <button
                      type="button"
                      onClick={() => setEditUser({ ...editUser, is_banned: editUser.is_banned === 1 ? 0 : 1 })}
                      className="text-[10px] uppercase font-extrabold text-rose-500 hover:underline mt-0.5"
                    >
                      {editUser.is_banned === 1 ? 'Lift Access Ban' : 'Apply Security Ban'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-bold rounded-xl transition-all text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl transition-all shadow-md"
                >
                  Save Properties
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Force Password Reset Modal */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-black text-lg text-gray-950 dark:text-white">Force Reset Password</h3>
              <button onClick={() => setResetUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-400 font-bold">This will override the user's password immediately. Ensure the new credential is securely provided to the user.</p>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters long..."
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetPassword(resetUser.id)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-sm font-bold text-white rounded-xl shadow-md"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
