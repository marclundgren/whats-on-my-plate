import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const SELF_HOSTED = import.meta.env.VITE_SELF_HOSTED === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const STORAGE_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!SELF_HOSTED);

  useEffect(() => {
    if (SELF_HOSTED) return;

    // Check for token in URL hash (OAuth redirect callback)
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const newToken = hash.slice(7);
      localStorage.setItem(STORAGE_KEY, newToken);
      // Remove token from URL so it's not in browser history
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setToken(newToken);
      fetchUser(newToken);
      return;
    }

    // Check localStorage for existing session
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setToken(stored);
      fetchUser(stored);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchUser(t: string) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      }
    } catch {
      // Network error — keep the token but don't populate user
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
