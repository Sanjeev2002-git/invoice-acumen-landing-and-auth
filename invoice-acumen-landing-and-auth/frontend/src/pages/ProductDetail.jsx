import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage, LoadingSpinner, ErrorMessage, EmptyState } from '../components/RequestState';

function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? 'fill-evo-violet text-evo-violet' : 'text-evo-muted'}`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = () =>
    Promise.all([
      api.get(`/products/${id}/reviews`),
      api.get(`/products/${id}/rating-summary`),
    ]).then(([reviewsRes, summaryRes]) => {
      setReviews(reviewsRes.data.data || []);
      setSummary(summaryRes.data.data || { averageRating: 0, reviewCount: 0 });
    });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([api.get(`/products/${id}`), loadReviews()])
      .then(([productRes]) => {
        if (!cancelled) setProduct(productRes.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load this product.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId: Number(id), rating, comment: comment.trim() || null });
      setComment('');
      setRating(5);
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 2500);
      await loadReviews();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not submit your review.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="evo-page relative min-h-screen">
        <div className="relative z-10 max-w-4xl mx-auto p-6">
          <LoadingSpinner label="Loading product…" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="evo-page relative min-h-screen">
        <div className="relative z-10 max-w-4xl mx-auto p-6">
          <ErrorMessage title="Couldn't load product" message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <Link to="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm text-evo-muted hover:text-evo-text">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        <div className="evo-card p-6">
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          <p className="mt-2 text-evo-muted text-sm">{product.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Stars value={summary.averageRating} />
            <span className="text-sm text-evo-muted">
              {summary.averageRating?.toFixed(1) || '0.0'} ({summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'})
            </span>
          </div>
          <p className="mt-4 text-xl font-semibold text-white">₹{product.price}</p>
        </div>

        {/* Review submission form — customers only */}
        {user && user.role === 'CUSTOMER' && (
          <div className="evo-card mt-6 p-6">
            <h2 className="text-lg font-semibold text-white">Write a review</h2>
            {submitted && (
              <p className="mt-2 text-sm text-emerald-400">Thanks — your review was submitted.</p>
            )}
            {submitError && (
              <p className="mt-2 text-sm text-red-300">{submitError}</p>
            )}
            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-evo-text">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`Rate ${n} stars`}
                      className="evo-focus-ring"
                    >
                      <Star className={`h-6 w-6 ${n <= rating ? 'fill-evo-violet text-evo-violet' : 'text-evo-muted'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-evo-text">
                  Comment (optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="evo-input evo-focus-ring w-full rounded-lg px-3 py-2 text-sm outline-none"
                  placeholder="What did you think of this product?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="evo-btn-primary evo-focus-ring px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          </div>
        )}

        {/* Review list */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Reviews</h2>
          {reviews.length === 0 ? (
            <EmptyState title="No reviews yet" message="Be the first to share your thoughts on this product." />
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="evo-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{r.user?.name || 'Anonymous'}</span>
                    <Stars value={r.rating} size="h-3.5 w-3.5" />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-evo-muted">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
