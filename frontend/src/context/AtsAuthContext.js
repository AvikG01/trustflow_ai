'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, getAtsSessionToken, setAtsSessionToken } from '@/lib/api';
import { useToast } from './ToastContext';

const AtsAuthContext = createContext(null);

export function AtsAuthProvider({ children }) {
  const [isAtsAuthorized, setIsAtsAuthorized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const sessionToken = getAtsSessionToken();
    if (sessionToken) {
      setIsAtsAuthorized(true);
    }
  }, []);

  const openAuthModal = (onSuccess) => {
    if (isAtsAuthorized) {
      if (onSuccess) onSuccess();
      return;
    }
    setPendingCallback(() => onSuccess);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
    setPendingCallback(null);
  };

  const authorizeAts = async (password) => {
    try {
      // Call backend analyze_resume action with ats_password to verify credentials
      const res = await apiRequest({
        action: 'analyze_resume',
        data: { ats_password: password },
      });

      // If backend returns 200 OK without throwing, authorization is valid
      setIsAtsAuthorized(true);
      setAtsSessionToken(password);
      addToast('ATS & CCS Authorization Granted!', 'success');
      setIsModalOpen(false);

      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      return true;
    } catch (err) {
      addToast(err.message || 'Authorization failed. Check password.', 'error');
      throw err;
    }
  };

  const revokeAtsSession = () => {
    setIsAtsAuthorized(false);
    setAtsSessionToken(null);
    addToast('ATS Session ended', 'info');
  };

  return (
    <AtsAuthContext.Provider
      value={{
        isAtsAuthorized,
        isModalOpen,
        openAuthModal,
        closeAuthModal,
        authorizeAts,
        revokeAtsSession,
      }}
    >
      {children}
    </AtsAuthContext.Provider>
  );
}

export function useAtsAuth() {
  const context = useContext(AtsAuthContext);
  if (!context) {
    throw new Error('useAtsAuth must be used within AtsAuthProvider');
  }
  return context;
}
