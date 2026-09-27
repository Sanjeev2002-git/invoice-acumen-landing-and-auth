import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookText,
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  User,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react';

const LS_KEY = 'sidebarCollapsed';

function getInitialCollapsed() {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
  } catch {
    // ignore
  }
  return false;
}

function initialsFromName(name) {
  if (!name) return 'IA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  const res = (first + last).toUpperCase();
  return res || 'IA';
}

function SidebarLinks({ collapsed, onNavigate }) {
  const { user } = useAuth();

  const links = useMemo(() => {
    const customerLinks = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['CUSTOMER'] },
      { to: '/products', label: 'Products', icon: Package, roles: ['CUSTOMER', 'ADMIN'] },
      { to: '/cart', label: 'Cart', icon: ShoppingCart, roles: ['CUSTOMER'] },
      { to: '/orders', label: 'Orders', icon: ClipboardList, roles: ['CUSTOMER', 'ADMIN'] },
      { to: '/addresses', label: 'Addresses', icon: Users, roles: ['CUSTOMER'] },
      { to: '/payment-methods', label: 'Payments', icon: ClipboardList, roles: ['CUSTOMER'] },
      { to: '/profile', label: 'Profile', icon: User, roles: ['CUSTOMER', 'ADMIN'] },
    ];

    const adminLinks = [
      { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck, roles: ['ADMIN'] },
      { to: '/products', label: 'Products', icon: Package, roles: ['CUSTOMER', 'ADMIN'] },
      { to: '/orders', label: 'Orders', icon: ClipboardList, roles: ['CUSTOMER', 'ADMIN'] },
    ];

    if (!user) return [];
    return user.role === 'ADMIN' ? adminLinks : customerLinks;
  }, [user]);

  const baseItemClass =
    'evo-focus-ring group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors relative';

  const activeClasses =
    'text-white bg-evo-violet/15 border border-evo-violet/40';

  const inactiveClasses =
    'text-evo-muted hover:text-white hover:bg-white/5 border border-transparent';

  return (
    <div className="mt-6 flex-1">
      <ul className="space-y-1">
        {links.map(({ to, label, icon: Icon, roles }) => {
          if (!user) return null;
          if (roles && !roles.includes(user.role)) return null;

          return (
            <li key={to}>
              <NavLink
                to={to}
                onClick={() => onNavigate?.()}
                className={({ isActive }) =>
                  [
                    baseItemClass,
                    collapsed ? 'justify-center px-2' : '',
                    isActive ? activeClasses : inactiveClasses,
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}

                {collapsed && (
                  <span
                    className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-evo-surface2 border border-white/10 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                    role="tooltip"
                  >
                    {label}
                  </span>
                )}

                {!collapsed && (
                  <span
                    className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-evo-violet/80"
                    aria-hidden="true"
                    style={{ opacity: undefined }}
                  />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const storedCollapsed = localStorage.getItem(LS_KEY);
      if (storedCollapsed != null) setCollapsed(storedCollapsed === 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  useEffect(() => {
    // Close mobile drawer on route change
    setMobileOpen(false);
  }, [navigate]);

  const toggleCollapsed = () => setCollapsed((v) => !v);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidthClass = collapsed ? 'w-20' : 'w-64';

  const sidebarInner = (
    <div
      className={
        'flex h-full flex-col overflow-hidden ' +
        sidebarWidthClass
      }
    >
      <div className="relative px-4 pt-5 pb-3">
        <div className="evo-glow opacity-70" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <BookText className="h-5 w-5 text-evo-violet" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-display text-[18px] font-semibold tracking-tight text-white truncate">
                  Invoice <span className="evo-gradient-text">Acumen</span>
                </p>
              </div>
            )}
          </div>


          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden md:inline-flex evo-focus-ring items-center justify-center h-9 w-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4 text-white" /> : <ChevronLeft className="h-4 w-4 text-white" />}
          </button>
        </div>
      </div>

      <div className="px-2 flex-1">
        <SidebarLinks
          collapsed={collapsed}
          onNavigate={() => setMobileOpen(false)}
        />


      </div>

      <div className="mt-auto px-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="font-mono text-xs text-white/90">{initialsFromName(user?.name)}</span>
          </div>
          {!collapsed && (
              <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / tablet fixed sidebar */}
      <aside
        className={
          'fixed left-0 top-0 z-40 hidden h-screen md:block ' +
          // glass fallback
          (collapsed ? 'w-20' : 'w-64')
        }
        aria-label="Sidebar"
      >
        <div
          className={
            'h-full ' +
            (collapsed ? 'w-20' : 'w-64') +
            ' bg-evo-surface/90 backdrop-blur-xl backdrop-saturate-150 border-r border-white/10 shadow-[inset_1px_0_0_rgba(255,255,255,0.06)]'
          }
          style={{ backgroundColor: 'rgba(8,8,13,0.90)' }}
        >
          {sidebarInner}
        </div>
      </aside>

      {/* Mobile hamburger + off-canvas drawer */}
      <button
        type="button"
        className="fixed left-3 top-3 z-50 md:hidden evo-focus-ring inline-flex items-center justify-center h-10 w-10 rounded-xl bg-evo-surface/80 border border-white/10 text-white backdrop-blur-sm"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={
          'fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-out ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full')
        }
        aria-hidden={!mobileOpen}
      >
        <div className="h-full w-64 bg-evo-surface/90 backdrop-blur-xl backdrop-saturate-150 border-r border-white/10 shadow-[inset_1px_0_0_rgba(255,255,255,0.06)]">
          {/* On mobile, ignore collapsed mode; drawer always expanded */}
          <div className="h-full">
            <div className="flex h-full flex-col">
              <div className="relative px-4 pt-5 pb-3">
                <div className="evo-glow opacity-70" aria-hidden="true" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <BookText className="h-5 w-5 text-evo-violet" />
                    </div>
                    <div>
                      <p className="font-display text-[18px] font-semibold tracking-tight text-white">Invoice <span className="evo-gradient-text">Acumen</span></p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="evo-focus-ring inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
                    aria-label="Close navigation"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="px-2 flex-1">
                <SidebarLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </div>

              <div className="mt-auto px-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                    <span className="font-mono text-xs text-white/90">{initialsFromName(user?.name)}</span>
                  </div>
              <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-white/60 truncate">{user?.email}</p>
                  </div>
                </div>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="evo-focus-ring mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-evo-violet/15 border border-evo-violet/30 hover:bg-evo-violet/25 text-white py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign out</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile keyboard close */}
      {mobileOpen && (
        <KeyboardClose onEscape={() => setMobileOpen(false)} />
      )}
    </>
  );
}

function KeyboardClose({ onEscape }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onEscape]);

  return null;
}
