'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import UsageLimitCard from '@/components/dashboard/UsageLimitCard';
import { FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';

export default function UserProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                  Role: {user?.role || 'user'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">Account Created</span>
              <span className="text-white font-mono">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently Registered'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">API Dispatch Authentication</span>
              <span className="text-emerald-400 font-mono font-bold">Bearer Token Active</span>
            </div>
          </div>
        </div>

        <UsageLimitCard />
      </div>
    </ProtectedRoute>
  );
}
