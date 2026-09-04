import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('inti_ruchi_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('inti_ruchi_admin_token') || null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('inti_ruchi_admin_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('inti_ruchi_admin_refresh');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [pendingCount, setPendingCount] = useState(0);

  // Synthesized notification chime using Web Audio API
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Note 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);

      // Note 2: A5 (880 Hz) after 0.15s
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.55);
    } catch (err) {
      console.warn('Audio chime playback failed:', err);
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('inti_ruchi_admin_sound', JSON.stringify(next));
      return next;
    });
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => {
      const next = !prev;
      localStorage.setItem('inti_ruchi_admin_refresh', JSON.stringify(next));
      return next;
    });
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      const { access_token, user } = res.data;

      if (user.role && user.role.toUpperCase() !== 'ADMIN') {
        throw new Error('Access denied: Admin credentials required');
      }

      localStorage.setItem('inti_ruchi_admin_token', access_token);
      localStorage.setItem('inti_ruchi_admin_user', JSON.stringify(user));
      setToken(access_token);
      setAdmin(user);
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Login failed. Please check credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('inti_ruchi_admin_token');
    localStorage.removeItem('inti_ruchi_admin_user');
    setToken(null);
    setAdmin(null);
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        soundEnabled,
        toggleSound,
        autoRefresh,
        toggleAutoRefresh,
        playNotificationSound,
        pendingCount,
        setPendingCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
