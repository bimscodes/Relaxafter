'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, tokenStore } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(tokenStore.getUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const auth = await api.login({ email, password });
    tokenStore.set(auth);
    setUser(auth.user);
    return auth.user;
  }, []);

  const register = useCallback(async (payload) => {
    const auth = await api.register(payload);
    tokenStore.set(auth);
    setUser(auth.user);
    return auth.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch {}
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'Admin',
    isManagerOrAdmin: user?.role === 'Admin' || user?.role === 'Manager'
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
