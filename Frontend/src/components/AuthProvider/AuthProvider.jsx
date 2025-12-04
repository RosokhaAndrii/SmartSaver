import React, { createContext, useCallback, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (accessToken) {
        await verifyToken(accessToken);
      } else {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [accessToken]); 

  const verifyToken = async (token) => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
      } else {
        setAccessToken(null);
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Token verify error:', err);
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const { accessToken: at, user: u } = await res.json();
    setAccessToken(at);
    localStorage.setItem('token', at);
    setUser(u);
    return { at, u };
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const authFetch = useCallback((input, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
