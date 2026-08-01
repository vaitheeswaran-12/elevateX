import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  BookOpen,
  CheckCircle,
  Play,
  Clock,
  Star,
  Layers,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';

export default function CoursesView() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null); // Course detail modal state

  useEffect(() => {
    async function loadCourses() {
      if (!token) return;
      try {
        const res = await fetch('/api/student/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Learning Space</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track lessons completed, explore curricula, and attempt auto-evaluating quizzes.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-soft">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-500 font-medium">You have not enrolled in any courses yet.</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-premium">
            Explore Course Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((item) => {
            const completedCount = item.completed_lessons?.length || 0;
            const totalLessons = 3; // mock modules reference
            const progress = Math.round((completedCount / totalLessons) * 100) || 5;

            return (
              <div
                key={item.enrollment_id}
                className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-premium transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Category and details */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-primary/5 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {item.course.category}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2 leading-tight">
                        {item.course.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">Instructor: {item.course.instructor_name}</p>
                    </div>
                    <span className="text-xs font-extrabold text-primary">{item.course.duration}</span>
                  </div>

                  {/* Slider Progress Indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-gray-400 font-bold">
                      <span>Completed {completedCount} of {totalLessons} Modules</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Card footer details */}
                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.course.rating}</span>
                  </div>
                  <button
                    onClick={() => setActiveCourse(item)}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-premium transition-colors"
                  >
                    Open Curriculum
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Curriculum View Modal Details */}
      {activeCourse && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-fadeIn">
            {/* Header banner */}
            <div className="p-6 bg-gradient-to-r from-primary to-accent text-white flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">{activeCourse.course.category}</p>
                <h3 className="text-lg font-black mt-0.5">{activeCourse.course.title}</h3>
              </div>
              <button
                onClick={() => setActiveCourse(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modules / Lessons list inside modal */}
            <div className="p-6 space-y-6 max-h-[420px] overflow-y-auto">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Syllabus Overview</h4>
                <p className="text-xs text-gray-400">Track lessons currently parsed. Toggle checks to update learning records.</p>
              </div>

              <div className="space-y-3">
                {/* Simulated Curriculum Lessons */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">1. Transformer Core Exploded</p>
                      <p className="text-[10px] text-gray-400">Duration: 15:30</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-green-500 uppercase bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">Completed</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Play className="w-5 h-5 text-primary shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">2. Positional Encodings & Tokens</p>
                      <p className="text-[10px] text-gray-400">Duration: 12:15</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-lg">Resume</button>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Layers className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">3. LoRA Optimization and Fine Tuning</p>
                      <p className="text-[10px] text-gray-400">Duration: 22:45</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">Next lesson</span>
                </div>
              </div>

              {/* Assessment card section inside Curriculum */}
              <div className="p-4 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/10 rounded-2xl flex justify-between items-center mt-6">
                <div>
                  <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Final Assessment Quiz</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Attempt the 20-minute auto-evaluated quiz to generate your Verified Certificate.</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Quiz module has been loaded in mock session!')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold rounded-xl"
                >
                  Start Assessment
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
