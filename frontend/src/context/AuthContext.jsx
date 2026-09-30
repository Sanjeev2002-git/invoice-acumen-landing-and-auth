import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { clearAuthState, getCachedUser, saveCachedUser, updateCachedUser } from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCachedUser());
  // True until we've confirmed (via the backend) whether the session cookie is
  // still valid. Routes must wait for this before deciding to redirect to /login.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/auth/me')
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setUser(data);
        saveCachedUser(data);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        clearAuthState();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data.data;
    setUser(data);
    saveCachedUser(data);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const data = res.data.data;
    setUser(data);
    saveCachedUser(data);
    return data;
  };

  const updateProfile = async ({ name, phone }) => {
    const res = await api.put('/users/me', { name, phone });
    const data = res.data.data;
    const updated = updateCachedUser(data);
    setUser(updated);
    return updated;
  };

  const updateAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/users/me/avatar', formData);
    const data = res.data.data;
    const updated = updateCachedUser(data);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the request fails, clear local state so the UI reflects logged-out.
    }
    clearAuthState();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, updateAvatar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
