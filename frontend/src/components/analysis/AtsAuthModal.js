'use client';

import React, { useState } from 'react';
import { useAtsAuth } from '@/context/AtsAuthContext';
import { FiShield, FiLock, FiKey, FiX, FiCheckCircle } from 'react-icons/fi';

export default function AtsAuthModal() {
  const { isModalOpen, closeAuthModal, authorizeAts } = useAtsAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);

    try {
      await authorizeAts(password);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Authorization password invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ATS & CCS Analysis Authorization</h3>
            <p className="text-xs text-slate-400">Admin Protected Engine Access</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          Enter the administrative authorization password to execute deep ATS keyword parsing and CCS competency scoring.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <FiKey className="w-3.5 h-3.5 text-cyan-400" />
              <span>Authorization Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Enter authorization password..."
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={closeAuthModal}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
            >
              <FiLock className="w-3.5 h-3.5" />
              <span>{loading ? 'Verifying...' : 'Authorize Engine'}</span>
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 text-center font-mono">
          Security Note: Passwords are tokenized and never saved in localStorage.
        </p>
      </div>
    </div>
  );
}
