import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Plus,
  Trash,
  CheckCircle,
  Clock,
  Sparkles,
  X,
  HelpCircle,
  Save,
  AlertCircle
} from 'lucide-react';

export default function QuizBuilderView() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form Fields for new Quiz
  const [courseId, setCourseId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [passingPercentage, setPassingPercentage] = useState(80);
  const [randomize, setRandomize] = useState(false);

  // Nested Questions Bank creation form
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);

  useEffect(() => {
    async function loadCourses() {
      if (!token) return;
      try {
        const res = await fetch('/api/instructor/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setCourses(d.courses || []);
          if (d.courses && d.courses.length > 0) {
            setCourseId(d.courses[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      setError('Please fill in all question fields and options');
      return;
    }

    const newQ = {
      question_text: questionText,
      options: [opt0, opt1, opt2, opt3],
      correct_option_index: correctIndex
    };

    setQuestions([...questions, newQ]);
    setQuestionText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setCorrectIndex(0);
    setError('');
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!courseId || !quizTitle) {
      setError('Course selection and quiz title are required');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question to the quiz question bank');
      return;
    }

    try {
      // 1. Create Quiz config
      const quizRes = await fetch('/api/instructor/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          title: quizTitle,
          timer_minutes: timerMinutes,
          passing_percentage: passingPercentage,
          randomize_questions: randomize
        })
      });

      const quizData = await quizRes.json();
      if (!quizRes.ok) throw new Error(quizData.message || 'Quiz creation failed');

      const quizId = quizData.quizId;

      // 2. Add Questions to question bank
      for (const q of questions) {
        await fetch('/api/instructor/quizzes/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quiz_id: quizId,
            question_text: q.question_text,
            options: q.options,
            correct_option_index: q.correct_option_index
          })
        });
      }

      setSuccess('Quiz and Question Bank successfully committed!');
      setQuizTitle('');
      setTimerMinutes(15);
      setPassingPercentage(80);
      setRandomize(false);
      setQuestions([]);
    } catch (err) {
      setError(err.message);
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
      {/* Header and description */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Quiz Builder</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Design auto-evaluating quizzes, configure passing limits, and build rich question banks.</p>
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
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">Please create a Course draft first.</p>
          <Link to="/instructor-dashboard/courses" className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-premium">Construct Course Path</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitQuiz} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMN 1: CONFIGS */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Quiz Config</span>
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
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g., Final Assessment Exam"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                  />
                </div>

                {/* Timer and Passing Percentage */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Timer (Mins)</label>
                    <input
                      type="number"
                      required
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Passing %</label>
                    <input
                      type="number"
                      required
                      value={passingPercentage}
                      onChange={(e) => setPassingPercentage(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                {/* Randomization */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="rand"
                    checked={randomize}
                    onChange={(e) => setRandomize(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <label htmlFor="rand" className="font-bold">Randomize Questions</label>
                </div>
              </div>
            </div>

            {/* Submit Quiz Action */}
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-2xl shadow-premium hover:shadow-lg transition-all flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Commit Quiz</span>
            </button>
          </div>

          {/* COLUMN 2: QUESTIONS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Construct Question nested form */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Question to Bank</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 mb-1.5">Question Text</label>
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g., Which mechanism is fundamental to Transformer models?"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900"
                  />
                </div>

                {/* 4 options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 mb-1">Option A</label>
                    <input
                      type="text"
                      value={opt0}
                      onChange={(e) => setOpt0(e.target.value)}
                      placeholder="Option A text"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1">Option B</label>
                    <input
                      type="text"
                      value={opt1}
                      onChange={(e) => setOpt1(e.target.value)}
                      placeholder="Option B text"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1">Option C</label>
                    <input
                      type="text"
                      value={opt2}
                      onChange={(e) => setOpt2(e.target.value)}
                      placeholder="Option C text"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 mb-1">Option D</label>
                    <input
                      type="text"
                      value={opt3}
                      onChange={(e) => setOpt3(e.target.value)}
                      placeholder="Option D text"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                {/* Correct option index select */}
                <div className="pt-2">
                  <label className="block font-bold text-gray-400 mb-1.5">Specify Correct Answer</label>
                  <select
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(parseInt(e.target.value, 10))}
                    className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-primary"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Question to List</span>
                </button>
              </div>
            </div>

            {/* List of active questions to be committed */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Active Questions ({questions.length})</h4>

              {questions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-start text-xs font-semibold">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-gray-900 dark:text-white leading-relaxed">{idx + 1}. {q.question_text}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400 text-[10px]">
                      <p className={q.correct_option_index === 0 ? 'text-green-500 font-bold' : ''}>A. {q.options[0]}</p>
                      <p className={q.correct_option_index === 1 ? 'text-green-500 font-bold' : ''}>B. {q.options[1]}</p>
                      <p className={q.correct_option_index === 2 ? 'text-green-500 font-bold' : ''}>C. {q.options[2]}</p>
                      <p className={q.correct_option_index === 3 ? 'text-green-500 font-bold' : ''}>D. {q.options[3]}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-1 hover:bg-gray-100 rounded text-red-500 shrink-0 ml-3"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
