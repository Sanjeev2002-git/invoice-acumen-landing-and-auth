import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getApiErrorMessage } from '../components/RequestState';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evo-page grid min-h-screen place-items-center">
      <div className="evo-glow" />
      <div className="relative z-10 flex items-center justify-center px-6 py-16">
        <div className="animate-rise-in w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold text-evo-text">Reset your password</h1>
          <p className="mt-2 text-sm text-evo-muted">
            Enter your account email and We&apos;ll send you a reset link.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              If that email is registered, a reset link is on its way. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-evo-text">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="evo-input evo-focus-ring w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="evo-btn-primary evo-focus-ring group flex w-full items-center justify-center gap-2 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-evo-muted">
            Remembered it?{' '}
            <Link to="/login" className="font-medium text-evo-violet hover:text-evo-blue">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

