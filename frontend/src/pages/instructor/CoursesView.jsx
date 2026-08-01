import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Plus,
  Trash,
  Edit,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Star,
  Settings,
  ArrowRight
} from 'lucide-react';

export default function CoursesView() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course create modal form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI & Machine Learning');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('10 Hours');

  useEffect(() => {
    loadCourses();
  }, [token]);

  const loadCourses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/instructor/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description) {
      setError('Please fill in course title and description');
      return;
    }

    try {
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category, difficulty, duration })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Creation failed');

      setSuccess('Course draft created successfully!');
      setTitle('');
      setDescription('');
      setModalOpen(false);
      loadCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this course and all its modules?')) return;
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Course deleted successfully!');
        loadCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (course) => {
    const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccess(`Course status set to ${newStatus}!`);
        loadCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-52 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-52 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header detailing catalog controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Course Catalogue</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage draft lessons, prices, parameters, and publish direct paths.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl shadow-premium flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Construct Course Path</span>
        </button>
      </div>

      {/* Success / Error alerts */}
      {success && (
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs font-bold">
          <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid catalogue */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">No courses authored yet.</p>
          <p className="text-xs text-gray-400">Click the upper-right button to create your first draft path.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft hover:shadow-premium transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {c.category}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2 leading-tight">
                      {c.title}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    c.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{c.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-700 dark:text-gray-300">{c.price}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{c.rating}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                    title="Delete Course"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(c)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                      c.status === 'Published' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {c.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>

                <Link
                  to={`/instructor-dashboard/course-builder/${c.id}`}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium flex items-center space-x-1.5"
                >
                  <span>Build Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE COURSE PATH MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCourse} className="bg-white dark:bg-gray-900 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-fadeIn p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Create Course Path</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Generative AI Fundamentals"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Course Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Deep dive into LLM fine-tuning techniques..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold"
                  >
                    <option>AI & Machine Learning</option>
                    <option>Web Development</option>
                    <option>Cloud Computing</option>
                    <option>UI/UX</option>
                    <option>Cyber Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wide mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-premium"
              >
                Create Draft
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
