import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, ArrowRight, Award, ShieldAlert } from 'lucide-react';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Quiz progress states
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/learning/quiz/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve quiz details.');
        return res.json();
      })
      .then((data) => {
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setTimeLeft(data.quiz.timer_minutes * 60);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [quizId]);

  // Countdown timer hook
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleSelectOption = (questionId, optionIdx) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: optionIdx
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (submitted) return;

    // Verify all answered, or confirm
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length && !window.confirm('You have unanswered questions. Are you sure you want to submit your quiz?')) {
      return;
    }

    submitAnswers();
  };

  const handleAutoSubmit = () => {
    submitAnswers();
  };

  const submitAnswers = () => {
    setLoading(true);
    fetch(`/api/learning/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ answers })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Submission evaluation error.');
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setSubmitted(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading && !submitted) {
    return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading timed assessment environment...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl max-w-2xl mx-auto my-12 text-center font-bold">
        <p>Encountered Quiz Error</p>
        <p className="text-xs font-semibold mt-1">{error}</p>
      </div>
    );
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Quiz details bar */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-950 dark:text-white">{quiz.title}</h1>
          <p className="text-xs text-gray-400 font-bold">Progress Milestone Assessment • Pass target: {quiz.passing_percentage}%</p>
        </div>

        {/* Timer ticker */}
        {!submitted && (
          <div className="flex items-center space-x-2 bg-rose-500/5 dark:bg-rose-500/10 px-4 py-2 border border-rose-500/10 rounded-xl text-rose-500 font-black text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Main body / results */}
      {submitted && result ? (
        <div className="space-y-8">
          {/* Results dashboard KPI card */}
          <div className={`p-8 rounded-3xl border shadow-premium text-center space-y-4 ${
            result.passed
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
              : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
          }`}>
            <div className="inline-flex p-4 rounded-full bg-white dark:bg-gray-800 shadow-md">
              {result.passed ? <Award className="w-10 h-10 text-emerald-500" /> : <ShieldAlert className="w-10 h-10 text-rose-500" />}
            </div>
            <div>
              <h2 className="text-2xl font-black">{result.passed ? 'Assessment Passed! 🎓' : 'Passing Score Not Met'}</h2>
              <p className="text-xs font-bold mt-1 text-gray-400">
                You scored <span className="font-extrabold text-gray-800 dark:text-white">{result.score}%</span> on this timed evaluation.
              </p>
            </div>

            {result.passed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">
                Credential Issued! Your verifiable certificate has been saved to your student hub.
              </p>
            )}

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-xs rounded-xl shadow-sm text-gray-700 dark:text-gray-200"
              >
                Return to Course Player
              </button>
            </div>
          </div>

          {/* Answer review lists */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h3 className="font-black text-sm text-gray-950 dark:text-white border-b border-gray-50 dark:border-gray-800 pb-3">Answer Key & Review</h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const review = result.reviews.find(r => r.questionId === q.id);
                return (
                  <div key={q.id} className="p-5 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">Question {idx + 1}: {q.question_text}</h4>
                      {review?.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => {
                        const isStudentChoice = review?.studentAnswer === oIdx;
                        const isCorrectChoice = review?.correctAnswer === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-3.5 rounded-xl text-xs font-bold border transition-all ${
                              isCorrectChoice
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : isStudentChoice
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrectChoice && <span className="float-right text-[10px] font-black uppercase tracking-wider">Correct</span>}
                            {isStudentChoice && !isCorrectChoice && <span className="float-right text-[10px] font-black uppercase tracking-wider">My Choice</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* List questions */}
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                  {q.question_text}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx;
                    return (
                      <button
                        type="button"
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`p-4 rounded-2xl text-xs font-bold text-left border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-premium border-transparent'
                            : 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Form submit */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-sm font-bold rounded-2xl text-gray-700 dark:text-gray-200"
            >
              Cancel Attempt
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-sm font-black text-white rounded-2xl shadow-premium hover:shadow-premium-lg transition-all"
            >
              Submit Quiz Assessment
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
