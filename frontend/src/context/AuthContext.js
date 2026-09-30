'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest, getAuthToken, setAuthToken, setAtsSessionToken } from '@/lib/api';
import { useToast } from './ToastContext';
import { useResume } from './ResumeContext';

const AuthContext = createContext(null);

const CLEAN_LIMITS = {
  resumesUsed: 0,
  resumesMax: 2,
  jobOptimizationsUsed: 0,
  jobOptimizationsMax: 3,
  emailsUsed: 0,
  emailsMax: 5,
  atsAccess: false,
  ccsAccess: false,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [limits, setLimits] = useState(CLEAN_LIMITS);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function loadUserProfile() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiRequest({ action: 'get_user_profile', method: 'GET' });
        if (res && res.user) {
          setUser(res.user);
          if (res.limits) setLimits(res.limits);
        } else {
          // Stale or invalid token
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiRequest({ action: 'login', data: { email, password } });
      if (res && res.user && res.token) {
        setUser(res.user);
        setAuthToken(res.token);
        if (res.limits) {
          setLimits(res.limits);
        } else {
          setLimits(CLEAN_LIMITS);
        }
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return res.user;
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      addToast(err.message || 'Login error', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiRequest({ action: 'register', data: { name, email, password } });
      if (res && res.user && res.token) {
        setUser(res.user);
        setAuthToken(res.token);
        if (res.limits) {
          setLimits(res.limits);
        } else {
          setLimits(CLEAN_LIMITS);
        }
        addToast('Registration successful! Welcome to TrustFlow AI.', 'success');
        return res.user;
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      addToast(err.message || 'Registration error', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setLimits(CLEAN_LIMITS);
    setAuthToken(null);
    setAtsSessionToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('tf_auth_token');
      localStorage.removeItem('tf_user_data');
      sessionStorage.removeItem('tf_ats_session');
      sessionStorage.removeItem('tf_auth_token');
      sessionStorage.clear();
    }

    if (queryClient) {
      queryClient.clear();
    }

    addToast('Logged out successfully', 'info');
    router.replace('/login');
  }, [queryClient, router, addToast]);

  // 2-Minute Inactivity Logout Mechanism (PHASE 9 REQUIREMENT)
  const lastActivityRef = React.useRef(Date.now());
  useEffect(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();
    let throttleTimeout = null;

    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          lastActivityRef.current = Date.now();
          throttleTimeout = null;
        }, 500);
      }
    };

    const events = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // Exactly 2 minutes
    const intervalId = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        logout();
        router.replace('/login?reason=inactive');
        addToast('You were logged out because there was no activity for 2 minutes.', 'info');
      }
    }, 5000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(intervalId);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, logout, router, addToast]);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setLimits(CLEAN_LIMITS);
      setAuthToken(null);
      setAtsSessionToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tf_auth_token');
        localStorage.removeItem('tf_user_data');
        sessionStorage.removeItem('tf_ats_session');
        sessionStorage.removeItem('tf_auth_token');
      }
      if (queryClient) {
        queryClient.clear();
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('tf:unauthorized', handleUnauthorized);
      return () => window.removeEventListener('tf:unauthorized', handleUnauthorized);
    }
  }, [queryClient]);

  const refreshLimits = useCallback((newLimits) => {
    setLimits((prev) => ({ ...prev, ...newLimits }));
  }, []);

  const isAdmin = Boolean(user && user.role && user.role.toUpperCase() === 'ADMIN');
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        limits,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshLimits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
