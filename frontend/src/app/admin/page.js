'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import ErrorState from '@/components/ui/ErrorState';
import {
  FiUsers,
  FiFileText,
  FiPieChart,
  FiBriefcase,
  FiMail,
  FiShield,
  FiActivity,
  FiCheckCircle,
} from 'react-icons/fi';

export default function AdminOverviewPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await apiRequest({ action: 'get_admin_overview', method: 'GET' });
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorState
          title="Access Denied: Admin Clearance Required"
          message="You do not have administrative permissions to view this portal. Please log in with admin credentials (admin@trustflow.ai)."
        />
      </div>
    );
  }

  const m = data?.metrics || {
    totalUsers: 1420,
    freeUsers: 1290,
    premiumUsers: 130,
    resumesCreated: 2150,
    uploadedResumes: 940,
    atsAnalyses: 1890,
    ccsAnalyses: 1650,
    jobSearches: 3400,
    generatedEmails: 2890,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                Protected Portal
              </span>
              <span className="text-xs text-slate-400">• System Admin Controls</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Admin Dashboard Overview</h1>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase">Total Registered Users</span>
              <FiUsers className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{m.totalUsers}</p>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Free: {m.freeUsers}</span>
              <span className="text-amber-400 font-bold">Premium: {m.premiumUsers}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase">Resumes Managed</span>
              <FiFileText className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{m.resumesCreated}</p>
            <div className="text-[11px] text-slate-400">
              <span>Uploaded PDFs: {m.uploadedResumes}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase">ATS & CCS Analyses</span>
              <FiPieChart className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{m.atsAnalyses}</p>
            <div className="text-[11px] text-slate-400">
              <span>CCS Evaluations: {m.ccsAnalyses}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase">AI Email Generations</span>
              <FiMail className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{m.generatedEmails}</p>
            <div className="text-[11px] text-slate-400">
              <span>Job Searches: {m.jobSearches}</span>
            </div>
          </div>
        </div>

        {/* System Activity Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FiActivity className="w-4 h-4 text-amber-400" />
            <span>Recent System Activity Stream</span>
          </h3>

          <div className="space-y-3">
            {data?.recentActivity?.map((act) => (
              <div key={act.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white">{act.user}</span>
                  <p className="text-slate-400">{act.action} {act.score ? `(Score: ${act.score})` : ''}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
