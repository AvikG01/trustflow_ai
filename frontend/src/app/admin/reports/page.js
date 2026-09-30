'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import ErrorState from '@/components/ui/ErrorState';

export default function AdminReportsPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorState title="Access Denied" message="Administrator authentication required." />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System & AI Usage Reports</h1>
          <p className="text-xs text-slate-400">Analytics on Gemini AI latency, token consumption, and analysis throughput</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Average ATS Analysis Latency</h3>
            <p className="text-3xl font-extrabold text-cyan-400 font-mono">1.24s</p>
            <p className="text-xs text-slate-400">Cloudflare edge dispatch latency</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">AI Email Generation Success Rate</h3>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono">99.8%</p>
            <p className="text-xs text-slate-400">Zero unhandled promise rejections recorded</p>
          </div>
        </div>
      </main>
    </div>
  );
}
