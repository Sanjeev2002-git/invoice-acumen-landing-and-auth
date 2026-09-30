import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../components/RequestState';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const data = await login(email, password);
      const returnTo = new URLSearchParams(location.search).get('returnTo');
      const defaultRoute = data.role === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(returnTo?.startsWith('/') ? returnTo : defaultRoute, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data && !data.message && !data.error) setFieldErrors(data);
      setError(getApiErrorMessage(err, 'Couldn\'t sign you in. Check your email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evo-page grid min-h-screen place-items-center">
      <div className="evo-glow" />


      {/* Brand panel */}
      <div className="relative z-10 hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10 px-12 pt-14">
          <Link to="/" className="font-display text-xl font-semibold text-evo-text">
            Invoice <span className="evo-gradient-text">Acumen</span>
          </Link>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex items-center justify-center px-6 py-16">
        <div className="animate-rise-in w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold text-evo-text">Welcome back</h1>
          <p className="mt-2 text-sm text-evo-muted">
            Sign in to pick up right where the ledger left off.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
                  aria-invalid={Boolean(fieldErrors.email)}
                  required
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-evo-text">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="evo-input evo-focus-ring w-full rounded-lg py-2.5 pl-10 pr-10 text-sm outline-none"
                  aria-invalid={Boolean(fieldErrors.password)}
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
              {fieldErrors.password && <p className="mt-1 text-xs text-red-300">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="evo-btn-primary evo-focus-ring group flex w-full items-center justify-center gap-2 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-evo-muted">
            No account yet?{' '}
            <Link to="/register" className="font-medium text-evo-violet hover:text-evo-blue">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
