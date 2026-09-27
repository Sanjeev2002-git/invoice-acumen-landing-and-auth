import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="evo-navbar sticky top-0 z-30 px-4 pl-16 sm:px-6 md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <Link
          to="/"
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-evo-text"
        >
          Invoice <span className="evo-gradient-text">Acumen</span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-evo-muted">
          {!user && (
            <>
              <Link to="/login" className="transition hover:text-evo-text">Login</Link>
              <Link
                to="/register"
                className="evo-btn-primary evo-focus-ring px-5 py-2 text-sm font-medium"
              >
                Get Started
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <span className="hidden text-evo-muted sm:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="evo-btn-secondary evo-focus-ring px-4 py-1.5 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
