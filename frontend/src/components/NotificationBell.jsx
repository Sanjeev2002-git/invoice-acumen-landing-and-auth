import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchUnreadCount = () => {
    api.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.data.count));
  };

  const fetchNotifications = () => {
    api.get('/notifications/my').then((res) => setNotifications(res.data.data));
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
    fetchUnreadCount();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
    fetchUnreadCount();
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="evo-focus-ring relative text-evo-muted hover:text-white"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="evo-card absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50"
        >

          <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
            <span className="font-semibold text-sm text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-evo-violet hover:text-evo-blue hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-evo-muted px-4 py-4">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`px-4 py-3 text-sm cursor-pointer transition ${n.read ? 'bg-transparent hover:bg-white/[0.03]' : 'bg-evo-violet/10 hover:bg-evo-violet/15'}`}
                >
                  <p className="font-medium text-white">{n.title}</p>
                  <p className="text-evo-muted text-xs mt-0.5">{n.message}</p>
                  <p className="text-evo-muted/70 text-[10px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
