import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Users,
  Award,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Mail,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function StudentsListView() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      if (!token) return;
      try {
        const res = await fetch('/api/instructor/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setStudents(d || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [token]);

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
      {/* Header and overview */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Active Learners</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track student progress, monitor quiz marks, and review issued cryptographic credentials.</p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3 shadow-soft">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">No active students registered in your course paths yet.</p>
          <p className="text-xs text-gray-400">Promote your course paths to enroll developers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((item) => (
            <div
              key={item.enrollment_id}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-soft transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              {/* Left student block */}
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 bg-primary/10 text-primary flex items-center justify-center font-black text-sm rounded-xl shrink-0">
                  {item.student_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{item.student_name}</h4>
                  <p className="text-xs text-gray-400 flex items-center mt-0.5"><Mail className="w-3.5 h-3.5 mr-1" /> {item.student_email}</p>
                  <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wide">Path: {item.course_title}</p>
                </div>
              </div>

              {/* Progress metrics and certification status */}
              <div className="flex flex-wrap gap-8 items-center w-full sm:w-auto text-xs font-semibold">

                {/* Completion bar */}
                <div className="space-y-1.5 w-32">
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>Progress:</span>
                    <span>{item.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${item.completion_percentage}%` }}></div>
                  </div>
                </div>

                {/* Quiz Scores */}
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Quiz Score</p>
                  <span className={`font-mono text-xs font-bold ${item.quiz_score ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.quiz_score ? `${item.quiz_score}%` : 'N/A'}
                  </span>
                </div>

                {/* Certificate issued badge */}
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Certificate</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    item.certificate_issued ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {item.certificate_issued ? 'Issued' : 'Pending'}
                  </span>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
