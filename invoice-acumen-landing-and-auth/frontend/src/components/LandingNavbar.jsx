import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setReduced(!!media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

function scrollToId(id, reducedMotion) {
  const el = document.getElementById(id);
  if (!el) return;

  const behavior = reducedMotion ? 'auto' : 'smooth';
  el.scrollIntoView({ behavior, block: 'start' });
}

export default function LandingNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const primaryCta = useMemo(() => {
    if (!user) return null;
    return user.role === 'ADMIN' ? '/admin' : '/dashboard';
  }, [user]);

  const navItems = useMemo(
    () => [
      { label: 'Home', id: 'top' },
      { label: 'Features', id: 'features' },
      { label: 'Products', id: 'products' },
      { label: 'About', id: 'about' },
      { label: 'Contact', id: 'contact' },
    ],
    []
  );

  const handleNav = (id) => {
    // Home sections exist only on `/` (they use ids like #features, #products, etc.)
    // so when user is on another route, navigate to `/` first and then scroll.
    if (id !== 'top' && window.location.pathname !== '/') {
      navigate('/');
      // small delay so Home mounts before scrolling
      setTimeout(() => scrollToId(id, reducedMotion), 0);
      setOpen(false);
      return;
    }

    setOpen(false);
    scrollToId(id, reducedMotion);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Ensure anchor navigation works when the page is on a different route (e.g., /products). */}
      <div className="bg-paper/80 backdrop-blur-xl backdrop-saturate-150 border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            onClick={() => handleNav('top')}
            className="focus-ring inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink"
            aria-label="Invoice Acumen Home"
          >
            Invoice <span className="text-primary">Acumen</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className="text-sm font-medium text-secondary/90 hover:text-secondary focus-ring rounded px-1 py-1"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="focus-ring rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/20 hover:bg-ledger-600"
                >
                  Register
                </Link>
              </>
            )}

            {user && (
              <>
                <Link
                  to={primaryCta}
                  className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/20 hover:bg-ledger-600"
                >
                  {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Go to dashboard'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="focus-ring rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="focus-ring inline-flex items-center justify-center rounded-lg bg-white border border-ink/10 h-10 w-10"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden">
            <div className="mx-auto max-w-6xl px-4 pb-4">
              <div className="rounded-2xl border border-ink/10 bg-white p-3 shadow-lg shadow-ink/5">
                <div className="grid gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNav(item.id)}
                      className="focus-ring rounded-xl px-3 py-2 text-left text-sm font-medium text-secondary hover:bg-ink/5"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid gap-2">
                  {!user && (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="focus-ring inline-flex items-center justify-center rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className="focus-ring inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-ledger-600"
                      >
                        Register
                      </Link>
                    </>
                  )}

                  {user && (
                    <>
                      <Link
                        to={primaryCta}
                        onClick={() => setOpen(false)}
                        className="focus-ring inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-ledger-600"
                      >
                        {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Go to dashboard'}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="focus-ring inline-flex items-center justify-center rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

