import React, { createContext,  useState, useEffect } from 'react';
import PropTypes from 'prop-types';
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const login = async (credentials) => {
    const res = await fetch('Тут могло би бути ваше api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Login failed');
    const payload = await res.json();
    setToken(payload.token);
    setUser(payload.user ?? null);
    return payload;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const authFetch = (input, init = {}) => {
    const headers = { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return fetch(input, { ...init, headers });
  };
  
  return <AuthContext.Provider value={{ token, user, login, logout, authFetch }}>{children}</AuthContext.Provider>;
}



AuthProvider.propTypes = {
    children: PropTypes.node
}