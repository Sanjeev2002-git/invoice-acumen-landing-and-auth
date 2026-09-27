import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Camera,
  Check,
  ChevronDown,
  DollarSign,
  Edit3,
  Hash,
  KeyRound,
  LockKeyhole,
  Mail,
  PackageCheck,
  Phone,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function initials(name) {
  if (!name) return 'IA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase() || 'IA';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function avatarSource(avatarUrl) {
  if (!avatarUrl) return null;
  return avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8080${avatarUrl}`;
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <Icon className="h-4 w-4 text-evo-violet" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-evo-muted">{label}</p>
        <p className="truncate font-medium text-white">{value || '—'}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="evo-card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-evo-violet/30 bg-evo-violet/15">
        <Icon className="h-5 w-5 text-evo-violet" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-evo-muted">{label}</p>
        <p className="truncate text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const avatarInputRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    let active = true;

    api.get('/users/me/summary')
      .then((response) => {
        if (active) setSummary(response.data.data);
      })
      .catch(() => {
        if (active) setSummary(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const startEditing = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
    setMessage(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setMessage(null);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to update your profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelection = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }

    setAvatarUploading(true);
    setMessage(null);
    try {
      await updateAvatar(file);
      setMessage({ type: 'success', text: 'Profile picture updated successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to upload your profile picture. Please try again.',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required.';
    if (passwordForm.newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters.';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errors).length) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const response = await api.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setPasswordMessage({ type: 'success', text: response.data.message || 'Password updated successfully.' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to update your password. Please try again.';
      setPasswordErrors({ currentPassword: errorMessage });
      setPasswordMessage({ type: 'error', text: errorMessage });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 mx-auto max-w-4xl p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">Profile</h2>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={PackageCheck} label="Total orders" value={summary?.totalOrders ?? '—'} />
          <StatCard icon={DollarSign} label="Total spent" value={summary ? formatCurrency(summary.totalSpent) : '—'} />
          <StatCard icon={Calendar} label="Last order" value={formatDate(summary?.lastOrderDate)} />
        </div>

        <div className="evo-card p-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="relative h-16 w-16 flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-evo-violet/30 bg-evo-violet/15">
                {avatarSource(user?.avatarUrl) ? (
                  <img src={avatarSource(user.avatarUrl)} alt={`${user?.name || 'User'} profile`} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-xl font-semibold text-white">{initials(user?.name)}</span>
                )}
              </div>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarSelection} />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="evo-focus-ring absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-evo-violet/40 bg-evo-violet text-white shadow-lg transition hover:bg-evo-violet/80 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Upload profile picture"
                title="Upload profile picture"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-white">{user?.name}</p>
              <p className="truncate text-sm text-evo-muted">{user?.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-evo-violet/30 bg-evo-violet/15 px-2.5 py-0.5 text-xs font-medium text-white">
                <ShieldCheck className="h-3 w-3" />
                {user?.role}
              </span>
            </div>
            {!editing && (
              <button type="button" onClick={startEditing} className="evo-focus-ring inline-flex items-center gap-2 rounded-xl border border-evo-violet/30 bg-evo-violet/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-evo-violet/25">
                <Edit3 className="h-4 w-4" />
                Edit profile
              </button>
            )}
          </div>

          {message && (
            <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="divide-y divide-white/5">
            {editing ? (
              <form onSubmit={handleProfileSave} className="py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-evo-muted">
                    Full name
                    <input name="name" value={form.name} onChange={handleProfileChange} required className="evo-focus-ring mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white" />
                  </label>
                  <label className="block text-sm text-evo-muted">
                    Phone number <span className="text-xs">(optional)</span>
                    <input name="phone" value={form.phone} onChange={handleProfileChange} inputMode="numeric" pattern="[0-9]*" title="Use digits only" className="evo-focus-ring mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white" />
                  </label>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="submit" disabled={saving} className="evo-btn-primary evo-focus-ring inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"><Check className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}</button>
                  <button type="button" onClick={cancelEditing} disabled={saving} className="evo-btn-secondary evo-focus-ring inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"><X className="h-4 w-4" />Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <DetailRow icon={UserIcon} label="Full name" value={user?.name} />
                <DetailRow icon={Phone} label="Phone number" value={user?.phone} />
              </>
            )}
            <DetailRow icon={Mail} label="Email address" value={user?.email} />
            <DetailRow icon={ShieldCheck} label="Account role" value={user?.role} />
            <DetailRow icon={Calendar} label="Member since" value={formatDate(user?.createdAt)} />
            <DetailRow icon={Hash} label="Account ID" value={user?.userId ? `#${user.userId}` : undefined} />
          </div>
        </div>

        <div className="evo-card mt-6 overflow-hidden">
          <button type="button" onClick={() => setPasswordOpen((open) => !open)} className="evo-focus-ring flex w-full items-center justify-between p-5 text-left">
            <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-evo-violet/30 bg-evo-violet/15"><KeyRound className="h-5 w-5 text-evo-violet" /></span><span><span className="block font-semibold text-white">Change password</span><span className="block text-sm text-evo-muted">Keep your account secure with a strong password.</span></span></span>
            <ChevronDown className={`h-5 w-5 text-evo-muted transition-transform ${passwordOpen ? 'rotate-180' : ''}`} />
          </button>

          {passwordOpen && (
            <form onSubmit={handlePasswordSave} className="border-t border-white/10 p-5">
              {passwordMessage && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${passwordMessage.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'}`}>{passwordMessage.text}</div>}
              <div className="grid gap-4 sm:grid-cols-3">
                {[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([name, label]) => (
                  <label key={name} className="block text-sm text-evo-muted">{label}<input type="password" name={name} value={passwordForm[name]} onChange={handlePasswordFieldChange} className="evo-focus-ring mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white" />{passwordErrors[name] && <span className="mt-1 block text-xs text-red-300">{passwordErrors[name]}</span>}</label>
                ))}
              </div>
              <button type="submit" disabled={passwordSaving} className="evo-btn-primary evo-focus-ring mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"><LockKeyhole className="h-4 w-4" />{passwordSaving ? 'Updating...' : 'Update password'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
