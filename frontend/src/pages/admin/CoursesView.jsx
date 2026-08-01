import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';

export default function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals state
  const [editCourse, setEditCourse] = useState(null);

  const fetchCourses = () => {
    setLoading(true);
    let url = `/api/admin/courses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&approval_status=${statusFilter}`;
    if (featuredFilter !== '') url += `&is_featured=${featuredFilter}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve systems courses.');
        return res.json();
      })
      .then((data) => {
        setCourses(data.courses);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, statusFilter, featuredFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateStatus = (courseId, status) => {
    fetch(`/api/admin/courses/${courseId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ approval_status: status })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update course approval status.');
        return res.json();
      })
      .then(() => {
        showToast(`Course successfully ${status.toLowerCase()}!`);
        fetchCourses();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleToggleFeatured = (courseId, currentFeatured) => {
    fetch(`/api/admin/courses/${courseId}/feature`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ is_featured: !currentFeatured })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to toggle featured state.');
        return res.json();
      })
      .then(() => {
        showToast('Course featured state updated!');
        fetchCourses();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/admin/courses/${editCourse.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editCourse)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save course changes.');
        return res.json();
      })
      .then(() => {
        showToast('Course details saved successfully!');
        setEditCourse(null);
        fetchCourses();
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleDeleteCourse = (courseId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this course from the platform? All lessons and resources will be deleted.')) return;

    fetch(`/api/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete course.');
        return res.json();
      })
      .then(() => {
        showToast('Course successfully deleted.');
        fetchCourses();
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
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Curriculum Controls</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Audit academic submissions, approve modules, and spotlight featured courses on the student directory.</p>
        </div>
        <button
          onClick={fetchCourses}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm hover:shadow-md text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">All Moderation States</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending Audit</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="">Featured Status</option>
            <option value="1">Featured Only</option>
            <option value="0">Standard Directory Only</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <th className="p-5">Course Title</th>
                <th className="p-5">Educator / Instructor</th>
                <th className="p-5">Category & Difficulty</th>
                <th className="p-5">Status</th>
                <th className="p-5">Spotlight</th>
                <th className="p-5 text-right">Moderation Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm font-medium text-gray-700 dark:text-gray-300">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                  <td className="p-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                        <img src={c.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{c.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{c.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{c.instructor_name}</span>
                  </td>
                  <td className="p-5">
                    <div>
                      <span className="text-xs font-bold text-gray-500">{c.category}</span>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase mt-0.5">{c.difficulty}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    {c.approval_status === 'Approved' && (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">Approved</span>
                    )}
                    {c.approval_status === 'Pending' && (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold">Pending Audit</span>
                    )}
                    {c.approval_status === 'Rejected' && (
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">Rejected</span>
                    )}
                  </td>
                  <td className="p-5">
                    <button
                      onClick={() => handleToggleFeatured(c.id, c.is_featured === 1)}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        c.is_featured === 1
                          ? 'bg-indigo-600 text-white shadow-premium'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{c.is_featured === 1 ? 'Featured' : 'Spotlight'}</span>
                    </button>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'Approved')}
                      disabled={c.approval_status === 'Approved'}
                      className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 disabled:opacity-40 rounded-lg inline-flex"
                      title="Approve Course"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'Rejected')}
                      disabled={c.approval_status === 'Rejected'}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 disabled:opacity-40 rounded-lg inline-flex"
                      title="Reject Course"
                    >
                      <XCircle className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setEditCourse(c)}
                      className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-500 rounded-lg inline-flex"
                      title="Edit Fields"
                    >
                      <Edit className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-lg inline-flex"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                    No matching courses in directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Course Details Modal */}
      {editCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-black text-lg text-gray-950 dark:text-white">Edit Course Specifications</h3>
              <button onClick={() => setEditCourse(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Course Title</label>
                <input
                  type="text"
                  required
                  value={editCourse.title}
                  onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Course Description</label>
                <textarea
                  required
                  rows="4"
                  value={editCourse.description}
                  onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
                  <input
                    type="text"
                    required
                    value={editCourse.category}
                    onChange={(e) => setEditCourse({ ...editCourse, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Duration</label>
                  <input
                    type="text"
                    required
                    value={editCourse.duration}
                    onChange={(e) => setEditCourse({ ...editCourse, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Difficulty Level</label>
                <select
                  value={editCourse.difficulty}
                  onChange={(e) => setEditCourse({ ...editCourse, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setEditCourse(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl shadow-md"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
