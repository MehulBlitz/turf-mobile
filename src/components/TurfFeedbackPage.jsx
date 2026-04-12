import { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, Star, Send, MessageSquare, ThumbsUp } from 'lucide-react';
import { fetchTurfComments, fetchTurfFeedback, submitTurfComment, submitTurfFeedback } from '../lib/supabase';

export default function TurfFeedbackPage({ user, turf, onBack, onFeedbackUpdate }) {
  const [comments, setComments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  // turf list is passed from Supabase by the parent App component.
  // feedback/comments are stored in Supabase.
  const [commentText, setCommentText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadData = async () => {
    if (!turf?.id) return;
    setError(null);
    setLoading(true);
    try {
      const [commentsData, feedbackData] = await Promise.all([
        fetchTurfComments(turf.id),
        fetchTurfFeedback(turf.id),
      ]);
      setComments(commentsData || []);
      setFeedback(feedbackData || []);
    } catch (err) {
      console.error('Error loading turf feedback:', err);
      setError(err?.message || 'Unable to load feedback from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!turf?.id) return;
    let isActive = true;

    const refresh = async () => {
      if (!isActive) return;
      await loadData();
    };

    refresh();

    return () => {
      isActive = false;
    };
  }, [turf]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    setError(null);
    try {
      await submitTurfComment(turf.id, {
        author_id: user?.id,
        author_name: user?.email || 'Guest',
        avatar_url: user?.avatar_url || '',
        text: commentText.trim(),
      });
      setCommentText('');
      await loadData();
      onFeedbackUpdate?.();
    } catch (err) {
      const message = err?.message || 'Unable to post comment.';
      setError(message);
      alert(message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    setError(null);
    try {
      await submitTurfFeedback(turf.id, {
        author_id: user?.id,
        author_name: user?.email || 'Guest',
        avatar_url: user?.avatar_url || '',
        rating,
        message: feedbackText.trim(),
      });
      setFeedbackText('');
      setRating(5);
      await loadData();
      onFeedbackUpdate?.();
    } catch (err) {
      const message = err?.message || 'Unable to submit feedback.';
      setError(message);
      alert(message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const averageRating = feedback.length > 0 ? (feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length).toFixed(1) : null;

  return (
    <div className="flex-1 flex flex-col pb-24">
      <header className="p-6 flex items-center gap-4 bg-white/95 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-display font-bold text-zinc-900">{turf?.name || 'Turf Feedback'}</h2>
          <p className="text-xs text-zinc-500">Comments and feedback specific to this turf</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Unable to load feedback.</p>
            <p>{error}</p>
          </div>
        )}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-black text-zinc-400">Feedback summary</p>
              <h3 className="text-lg font-bold text-zinc-900">{averageRating ? `${averageRating} / 5` : 'No rating yet'}</h3>
            </div>
            <div className="p-3 rounded-3xl bg-emerald-50 text-emerald-600 text-sm font-bold">
              {feedback.length} feedback entries
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-600">
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Latest rating</p>
              <p className="font-bold text-zinc-900">{feedback[0]?.rating ?? '-'}</p>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Total comments</p>
              <p className="font-bold text-zinc-900">{comments.length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-zinc-900 font-bold">
              <MessageSquare size={18} />
              <span>Post a comment</span>
            </div>
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience or ask a question..."
                className="w-full min-h-[120px] rounded-3xl border border-zinc-200 p-4 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="w-full rounded-3xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-zinc-900 font-bold">
              <Star size={18} />
              <span>Submit feedback</span>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`rounded-2xl border px-3 py-2 text-sm font-bold ${rating >= value ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Describe what could be improved or what you liked"
                className="w-full min-h-[120px] rounded-3xl border border-zinc-200 p-4 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full rounded-3xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </section>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">Recent comments</h3>
            <span className="text-xs text-zinc-500">{comments.length} comments</span>
          </div>
          {loading ? (
            <div className="rounded-3xl bg-zinc-50 p-6 text-center text-zinc-500">Loading comments…</div>
          ) : comments.length === 0 ? (
            <div className="rounded-3xl bg-zinc-50 p-6 text-center text-zinc-500">No comments yet.</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {comment.author_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{comment.author_name}</p>
                      <p className="text-xs text-zinc-500">{new Date(comment.created_at?.toDate?.() || comment.created_at || Date.now()).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-700">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">Recent feedback</h3>
            <span className="text-xs text-zinc-500">{feedback.length} items</span>
          </div>
          {loading ? (
            <div className="rounded-3xl bg-zinc-50 p-6 text-center text-zinc-500">Loading feedback…</div>
          ) : feedback.length === 0 ? (
            <div className="rounded-3xl bg-zinc-50 p-6 text-center text-zinc-500">No feedback yet.</div>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <div key={item.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{item.author_name}</p>
                      <p className="text-xs text-zinc-500">{new Date(item.created_at?.toDate?.() || item.created_at || Date.now()).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-600">
                      {item.rating} / 5
                    </div>
                  </div>
                  <p className="text-sm text-zinc-700">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
