import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Circle,
  FileText,
  Download,
  Notebook,
  Video,
  Award,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Sliders,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader
} from 'lucide-react';

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Player configurations
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setUpdatingNotes] = useState(false);

  // Assignment submissions
  const [submittingAsg, setSubmittingAsg] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [asgHistory, setAsgHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchPlayerDetails = () => {
    fetch(`/api/learning/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve course player materials.');
        return res.json();
      })
      .then((data) => {
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setModules(data.modules);
        setQuizzes(data.quizzes);
        setAssignments(data.assignments);

        // Find active lesson (first uncompleted, or first absolute)
        const completed = data.enrollment.completed_lessons || [];
        let firstLesson = null;
        const expandedMap = {};

        data.modules.forEach((m, idx) => {
          expandedMap[m.id] = idx === 0; // expand first by default
          m.lessons.forEach((l) => {
            if (!firstLesson) firstLesson = l;
            if (!completed.includes(l.id) && !firstLesson) {
              firstLesson = l;
              expandedMap[m.id] = true;
            }
          });
        });

        if (firstLesson) {
          setActiveLesson(firstLesson);
        }

        setExpandedModules(expandedMap);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlayerDetails();
  }, [courseId]);

  // Fetch lesson notes
  useEffect(() => {
    if (!activeLesson) return;

    fetch(`/api/learning/lesson/${activeLesson.id}/notes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => res.json())
      .then((data) => setNotesText(data.notes || ''))
      .catch(() => setNotesText(''));
  }, [activeLesson]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleModule = (moduleId) => {
    setExpandedModules({
      ...expandedModules,
      [moduleId]: !expandedModules[moduleId]
    });
  };

  const handleMarkLessonComplete = (lessonId) => {
    fetch(`/api/learning/lesson/${lessonId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to complete lesson.');
        return res.json();
      })
      .then((data) => {
        setEnrollment({
          ...enrollment,
          completed_lessons: data.completed_lessons
        });
        showToast('Lesson progress recorded successfully!');
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  const handleSaveNotes = () => {
    if (!activeLesson) return;
    setUpdatingNotes(true);

    fetch(`/api/learning/lesson/${activeLesson.id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ note_text: notesText })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to persist notes.');
        return res.json();
      })
      .then(() => {
        showToast('Personal notes saved successfully!');
        setUpdatingNotes(false);
      })
      .catch((err) => {
        showToast(err.message, 'error');
        setUpdatingNotes(false);
      });
  };

  // Submission handler
  const handleOpenAssignment = (asg) => {
    setSubmittingAsg(asg);
    setFileUrl('');
    setSubmissionText('');

    // Fetch history
    fetch(`/api/learning/assignment/${asg.id}/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => res.json())
      .then((data) => setAsgHistory(data))
      .catch(() => setAsgHistory([]));
  };

  const handleSubmitAsg = (e) => {
    e.preventDefault();
    if (!fileUrl.trim()) return;

    fetch(`/api/learning/assignment/${submittingAsg.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ fileUrl, submissionText })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Submission failed.');
        return res.json();
      })
      .then(() => {
        showToast('Assignment submitted successfully!');
        setSubmittingAsg(null);
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading Learning Player environment...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl max-w-2xl mx-auto my-12 text-center">
        <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-4" />
        <p className="font-bold text-lg">Encountered Access Restrictions</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/student-dashboard/courses" className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
          Go back to my courses
        </Link>
      </div>
    );
  }

  const completedCount = enrollment?.completed_lessons?.length || 0;
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0) || 1;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold z-50 transition-all flex items-center space-x-3 ${
          toast.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        }`}>
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center space-x-4">
          <Link to="/student-dashboard/courses" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-950 dark:text-white line-clamp-1">{course.title}</h1>
            <p className="text-xs text-gray-400 font-bold">{course.instructor_name} • {course.category}</p>
          </div>
        </div>

        {/* Dynamic certificate indicator */}
        {enrollment.completed_at ? (
          <span className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Graduated</span>
          </span>
        ) : (
          <div className="text-right">
            <span className="text-xs font-extrabold text-indigo-600">{progressPercent}% Progress</span>
            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Video Player, Notes, PDF Viewer */}
        <div className="lg:col-span-2 space-y-8">

          {/* Main Video Frame panel */}
          {activeLesson ? (
            <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-lg group">
              <video
                key={activeLesson.id}
                src={activeLesson.video_url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                style={{ filter: `contrast(1.05)` }}
              />

              {/* Overlay speed custom control */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-extrabold text-white opacity-0 group-hover:opacity-100 transition-all flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <button onClick={() => setPlaybackSpeed(1)} className={`hover:text-indigo-400 ${playbackSpeed === 1 ? 'text-indigo-400' : ''}`}>1x</button>
                <button onClick={() => setPlaybackSpeed(1.5)} className={`hover:text-indigo-400 ${playbackSpeed === 1.5 ? 'text-indigo-400' : ''}`}>1.5x</button>
                <button onClick={() => setPlaybackSpeed(2)} className={`hover:text-indigo-400 ${playbackSpeed === 2 ? 'text-indigo-400' : ''}`}>2x</button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl aspect-video flex items-center justify-center font-bold text-gray-400">
              Select a lesson from the syllabus timeline to begin learning.
            </div>
          )}

          {/* Player controls */}
          {activeLesson && (
            <div className="flex justify-between items-center bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm text-gray-950 dark:text-white">{activeLesson.title}</h3>
              </div>
              <button
                onClick={() => handleMarkLessonComplete(activeLesson.id)}
                disabled={enrollment?.completed_lessons?.includes(activeLesson.id)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-500/10 disabled:text-emerald-500 disabled:opacity-100 text-xs font-black uppercase tracking-wider text-white rounded-xl transition-all shadow-md"
              >
                {enrollment?.completed_lessons?.includes(activeLesson.id) ? 'Completed ✔' : 'Mark Complete'}
              </button>
            </div>
          )}

          {/* Notes and resources tab panes split */}
          {activeLesson && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Lesson Notes */}
              <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-3">
                  <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center space-x-2">
                    <Notebook className="w-4 h-4 text-indigo-500" />
                    <span>Personal Notes</span>
                  </h3>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest disabled:opacity-50"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  rows="6"
                  placeholder="Draft your thoughts, key formulas, code segments..."
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Lesson attachments and reference resources list */}
              <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center space-x-2 border-b border-gray-50 dark:border-gray-800 pb-3">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Lesson Resources</span>
                </h3>

                <div className="space-y-3">
                  {activeLesson.resources?.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 border border-gray-100 dark:border-gray-800/80 rounded-xl flex items-center justify-between transition-all"
                    >
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{res.title}</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                  {(!activeLesson.resources || activeLesson.resources.length === 0) && (
                    <p className="text-xs text-center text-gray-400 py-10 font-bold">No resource download materials loaded for this lesson.</p>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Modules list, Quiz and Homework launcher links */}
        <div className="space-y-8">

          {/* Modules Syllabus Tracker Accordion */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-gray-950 dark:text-white">Syllabus Curriculum</h3>

            <div className="space-y-4">
              {modules.map((m) => (
                <div key={m.id} className="border border-gray-50 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => handleToggleModule(m.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 font-bold text-xs text-gray-800 dark:text-gray-200"
                  >
                    <span>{m.title}</span>
                    {expandedModules[m.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {expandedModules[m.id] && (
                    <div className="p-3 space-y-2 bg-white dark:bg-[#111827] border-t border-gray-50 dark:border-gray-800/60">
                      {m.lessons.map((l) => {
                        const isCompleted = enrollment?.completed_lessons?.includes(l.id);
                        const isActive = activeLesson?.id === l.id;
                        return (
                          <button
                            key={l.id}
                            onClick={() => setActiveLesson(l)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                              isActive
                                ? 'bg-indigo-600/5 text-indigo-600 font-extrabold border border-indigo-600/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                              )}
                              <span className="text-xs truncate">{l.title}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">{l.duration}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quizzes Milestone and Homework submission triggers */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-gray-950 dark:text-white">Milestones Assessment</h3>

            <div className="space-y-3">
              {/* Quizzes list */}
              {quizzes.map((q) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{q.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">Passing threshold: {q.passing_percentage}%</p>
                  </div>
                  {enrollment.quiz_score >= q.passing_percentage ? (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-extrabold">Passed ({enrollment.quiz_score}%)</span>
                  ) : (
                    <Link
                      to={`/student-dashboard/quiz/${q.id}`}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-sm"
                    >
                      Start
                    </Link>
                  )}
                </div>
              ))}

              {/* Assignments list */}
              {assignments.map((asg) => (
                <div key={asg.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{asg.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">Homework submissions</p>
                  </div>
                  <button
                    onClick={() => handleOpenAssignment(asg)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Assignment Submit Modal Drawer */}
      {submittingAsg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-black text-lg text-gray-950 dark:text-white">Submit Homework Project</h3>
              <button onClick={() => setSubmittingAsg(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsg} className="p-6 space-y-5">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-xs leading-relaxed font-bold">
                <p className="font-extrabold text-xs mb-1">Project Instructions:</p>
                {submittingAsg.description || 'No instruction notes specified.'}
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Supabase Storage or Project File Link URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://supabase.storage.com/jane/my-code.py"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Written Explanation Notes (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Describe your architecture steps, constraints, and instructions..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
              </div>

              {asgHistory.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 space-y-3">
                  <h4 className="text-xs font-black text-gray-500">Submission History</h4>
                  {asgHistory.map((h, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] text-gray-400">{new Date(h.submitted_at).toLocaleDateString()}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          h.status === 'Evaluated' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-700 dark:text-gray-300 truncate">File: <a href={h.file_url} target="_blank" rel="noreferrer" className="text-indigo-500 underline">{h.file_url}</a></p>
                      {h.grade && <p className="font-black text-indigo-600 mt-1">Grade: {h.grade}</p>}
                      {h.feedback && <p className="text-gray-400 italic mt-0.5">Feedback: {h.feedback}</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSubmittingAsg(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white rounded-xl shadow-md"
                >
                  Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
