import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../components/RequestState';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-evo-blue', 'bg-evo-violet'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (form.phone && !/^\d{10}$/.test(form.phone)) errors.phone = 'Phone number must be exactly 10 digits.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/dashboard');
    } catch (err) {
      const backendErrors = err?.response?.data;
      if (backendErrors && !backendErrors.message && !backendErrors.error) setFieldErrors(backendErrors);
      setError(getApiErrorMessage(err, "Couldn't create your account. Please try again."));
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
          <h1 className="font-display text-3xl font-semibold text-evo-text">Create your account</h1>
          <p className="mt-2 text-sm text-evo-muted">Start your ledger in under a minute.</p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-evo-text">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                <input
                  id="name"
                  name="name"
                  placeholder="Jordan Kelly"
                  value={form.name}
                  onChange={handleChange}
                  className="evo-input evo-focus-ring w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none"
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-300">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-evo-text">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="evo-input evo-focus-ring w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none"
                  aria-invalid={Boolean(fieldErrors.email)}
                  required
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-evo-text">
                Phone <span className="font-normal text-evo-muted">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                <input
                  id="phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={handleChange}
                  className="evo-input evo-focus-ring w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none"
                  aria-invalid={Boolean(fieldErrors.phone)}
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-300">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-evo-text">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-evo-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
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

              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength ? STRENGTH_COLOR[strength] : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-evo-muted">{STRENGTH_LABEL[strength]}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="evo-btn-primary evo-focus-ring group flex w-full items-center justify-center gap-2 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-evo-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-evo-violet hover:text-evo-blue">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
