import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  MessageSquare,
  Star,
  CheckCircle,
  X,
  Plus,
  Send,
  AlertCircle
} from 'lucide-react';

export default function ReviewsView() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  // Reply popup form fields
  const [activeReplyReview, setActiveReplyReview] = useState(null);
  const [replyComment, setReplyComment] = useState('');

  useEffect(() => {
    loadReviewsData();
  }, [token]);

  const loadReviewsData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/instructor/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setReviews(d || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyComment.trim()) return;

    try {
      const res = await fetch('/api/instructor/reviews/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reviewId: activeReplyReview.review_id,
          reply_comment: replyComment
        })
      });

      if (res.ok) {
        setSuccess('Reply saved successfully!');
        setReplyComment('');
        setActiveReplyReview(null);
        loadReviewsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header description */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Student Feedback</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review ratings, read comments, and interact by submitting course replies.</p>
      </div>

      {success && (
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">No student reviews written yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.review_id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft space-y-4 flex flex-col justify-between">

              <div className="space-y-3">
                {/* Meta details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{r.student_name}</h4>
                    <p className="text-[10px] text-primary uppercase font-bold tracking-wider mt-0.5">{r.course_title}</p>
                  </div>
                  {/* Rating Stars */}
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-800'}`} />
                    ))}
                  </div>
                </div>

                {/* Comment body */}
                {r.comment && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    "{r.comment}"
                  </p>
                )}

                {/* Reply display */}
                {r.reply_comment && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs mt-2 pl-4 border-l-4 border-l-primary">
                    <p className="font-bold text-primary dark:text-primary-light">Your Reply</p>
                    <p className="text-gray-500 mt-1 leading-relaxed">"{r.reply_comment}"</p>
                  </div>
                )}
              </div>

              {/* Reply trigger button */}
              {!r.reply_comment && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveReplyReview(r)}
                    className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Reply</span>
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* REPLY DIALOG MODAL */}
      {activeReplyReview && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSendReply} className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Reply to {activeReplyReview.student_name}</h3>
              <button type="button" onClick={() => setActiveReplyReview(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-gray-500 italic">" {activeReplyReview.comment} "</p>
              <div>
                <label className="block font-bold text-gray-400 mb-1.5">Your Response</label>
                <textarea
                  required
                  value={replyComment}
                  onChange={(e) => setReplyComment(e.target.value)}
                  placeholder="Thank you for your valuable feedback! I will update..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveReplyReview(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-premium flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
