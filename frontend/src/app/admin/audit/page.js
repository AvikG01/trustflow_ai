'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import ErrorState from '@/components/ui/ErrorState';

export default function AdminAuditPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorState title="Access Denied" message="Administrator authentication required." />
      </div>
    );
  }

  const logs = [
    { timestamp: '2026-09-28T22:10:00Z', action: 'verify_ats_password', status: 'SUCCESS', ip: '192.168.1.45' },
    { timestamp: '2026-09-28T21:45:00Z', action: 'optimize_resume_for_job', status: 'SUCCESS', ip: '10.0.0.12' },
    { timestamp: '2026-09-28T21:12:00Z', action: 'login', status: 'SUCCESS', ip: '192.168.1.45' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Security Logs</h1>
          <p className="text-xs text-slate-400">Action dispatcher authorization audit trail</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-cyan-400 font-bold">[{log.action}]</span>
                <span className="text-slate-300 ml-2">IP: {log.ip}</span>
              </div>
              <span className="text-emerald-400 font-bold">{log.status}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
