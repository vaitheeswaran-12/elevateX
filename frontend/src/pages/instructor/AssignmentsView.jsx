import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Plus,
  Trash,
  CheckCircle,
  Calendar,
  FileText,
  X,
  Briefcase,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function AssignmentsView() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // New assignment form fields
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  // Grading states
  const [activeGradingSubmission, setActiveGradingSubmission] = useState(null);
  const [grade, setGrade] = useState('');

  useEffect(() => {
    loadSubmissionsData();
  }, [token]);

  const loadSubmissionsData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load Courses and Student Submissions in parallel
      const [coursesRes, subsRes] = await Promise.all([
        fetch('/api/instructor/courses', { headers }),
        fetch('/api/instructor/assignments/submissions', { headers })
      ]);

      if (coursesRes.ok) {
        const d = await coursesRes.json();
        setCourses(d.courses || []);
        if (d.courses && d.courses.length > 0) {
          setCourseId(d.courses[0].id);
        }
      }

      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubmissions(d || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!courseId || !title) {
      setError('Course selection and assignment title are required');
      return;
    }

    try {
      const res = await fetch('/api/instructor/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          title,
          description,
          deadline: deadline || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Creation failed');

      setSuccess('Assignment prompt successfully dispatched!');
      setTitle('');
      setDescription('');
      setDeadline('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!grade) return;

    try {
      const res = await fetch(`/api/instructor/assignments/submissions/${activeGradingSubmission.submission_id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Evaluated',
          grade
        })
      });

      if (res.ok) {
        setSuccess('Submission graded successfully!');
        setGrade('');
        setActiveGradingSubmission(null);
        loadSubmissionsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header description */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Assignment Studio</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Design homework guidelines, specify deadlines, and evaluate student submission files.</p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">Please create a Course draft first.</p>
          <Link to="/instructor-dashboard/courses" className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-premium">Construct Course Path</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMN 1: CREATE FORM */}
          <div className="space-y-6">
            <form onSubmit={handleCreateAssignment} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-primary" />
                <span>Create Assignment</span>
              </h3>

              <div className="space-y-3.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                {/* Course Select */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Select Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Implementing LoRA from Scratch"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Description Guidelines</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Write a custom training loop to adapter parameters..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-2xl shadow-premium hover:shadow-lg transition-all"
              >
                Dispatch Assignment
              </button>
            </form>
          </div>

          {/* COLUMN 2: SUBMISSIONS */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Pending Student Submissions ({submissions.length})</h3>

            {submissions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
                <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 font-semibold text-sm">No files uploaded by students yet.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {submissions.map((sub) => (
                  <div key={sub.submission_id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-semibold hover:shadow-soft transition-all">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">{sub.course_title}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                          sub.status === 'Evaluated' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>{sub.status}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{sub.assignment_title}</h4>
                      <p className="text-gray-400">Student: <span className="text-gray-800 dark:text-gray-200 font-bold">{sub.student_name}</span> ({sub.student_email})</p>

                      {sub.grade && (
                        <p className="text-[10px] text-green-600 font-bold">Grade Evaluated: <span className="font-mono bg-green-50 px-1.5 py-0.5 rounded">{sub.grade}</span></p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-4">
                      {/* View document */}
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-gray-400 hover:text-primary rounded-xl"
                        title="View Submitted Code/File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {sub.status !== 'Evaluated' && (
                        <button
                          type="button"
                          onClick={() => setActiveGradingSubmission(sub)}
                          className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                        >
                          Grade File
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* GRADING ACTION MODAL */}
      {activeGradingSubmission && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleGradeSubmission} className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Grade: {activeGradingSubmission.student_name}</h3>
              <button type="button" onClick={() => setActiveGradingSubmission(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-400 mb-1.5">Assign Grade Score</label>
                <select
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-primary"
                >
                  <option value="">-- Choose Grade --</option>
                  <option value="A+">A+ (Pristine execution)</option>
                  <option value="A">A (Excellent implementation)</option>
                  <option value="B">B (Satisfactory results)</option>
                  <option value="C">C (Needs review)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveGradingSubmission(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-premium"
              >
                Submit Score
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
