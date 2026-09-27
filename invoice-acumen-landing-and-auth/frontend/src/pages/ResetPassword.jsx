import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getApiErrorMessage } from '../components/RequestState';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'This reset link is invalid or has expired.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evo-page grid min-h-screen place-items-center">
      <div className="evo-glow" />
      <div className="relative z-10 flex items-center justify-center px-6 py-16">
        <div className="animate-rise-in w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold text-evo-text">Set a new password</h1>
          <p className="mt-2 text-sm text-evo-muted">Choose a strong password for your account.</p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {done ? (
            <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Password updated. Redirecting you to sign in…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-evo-text">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="evo-input evo-focus-ring w-full rounded-lg py-2.5 pl-10 pr-10 text-sm outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="evo-focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-evo-muted hover:text-evo-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="evo-btn-primary evo-focus-ring group flex w-full items-center justify-center gap-2 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update password'}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-evo-muted">
            <Link to="/login" className="font-medium text-evo-violet hover:text-evo-blue">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
