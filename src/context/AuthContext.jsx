import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('demo_mode') === 'true';
  });

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      const newMode = !prev;
      localStorage.setItem('demo_mode', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('accounts/profile/');
          setUser(res.data);
        } catch (err) {
          console.error("Session expired or invalid");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('accounts/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    
    const profileRes = await api.get('accounts/profile/');
    setUser(profileRes.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    const res = await api.get('accounts/profile/');
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isDemoMode, toggleDemoMode, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
