'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAtsAuth } from '@/context/AtsAuthContext';
import { FiFileText, FiZap, FiMail, FiShield, FiLock, FiCheck } from 'react-icons/fi';

export default function UsageLimitCard() {
  const { limits } = useAuth();
  const { isAtsAuthorized, openAuthModal } = useAtsAuth();

  const resumesUsed = limits?.resumesUsed ?? 0;
  const resumesMax = limits?.resumesMax ?? 2;
  const optUsed = limits?.jobOptimizationsUsed ?? 0;
  const optMax = limits?.jobOptimizationsMax ?? 3;
  const emailsUsed = limits?.emailsUsed ?? 0;
  const emailsMax = limits?.emailsMax ?? 5;

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Usage & Account Limits</h3>
          <p className="text-xs text-slate-400">Backend Enforced Plan Policy</p>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          FREE TIER
        </span>
      </div>

      <div className="space-y-4">
        {/* Resume Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <FiFileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resumes Created</span>
            </span>
            <span className="text-slate-200 font-mono">
              {resumesUsed} / {resumesMax} Resumes
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (resumesUsed / resumesMax) * 100)}%` }}
            />
          </div>
        </div>

        {/* Job Optimizations Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <FiZap className="w-3.5 h-3.5 text-amber-400" />
              <span>Job-Specific Optimizations</span>
            </span>
            <span className="text-slate-200 font-mono">
              {optUsed} / {optMax} Used
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (optUsed / optMax) * 100)}%` }}
            />
          </div>
        </div>

        {/* AI Email Generator Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <FiMail className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Application Emails</span>
            </span>
            <span className="text-slate-200 font-mono">
              {emailsUsed} / {emailsMax} Used
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (emailsUsed / emailsMax) * 100)}%` }}
            />
          </div>
        </div>

        {/* ATS & CCS Access Status Banner */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <FiShield className={`w-4 h-4 ${isAtsAuthorized ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <span className="text-xs font-semibold text-white block">ATS & CCS Authorization</span>
                <span className="text-[11px] text-slate-400 block">
                  {isAtsAuthorized ? 'Session Active (Admin Verified)' : 'Password Protected Access'}
                </span>
              </div>
            </div>
            {isAtsAuthorized ? (
              <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <FiCheck className="w-3 h-3" />
                <span>UNLOCKED</span>
              </span>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
              >
                <FiLock className="w-3 h-3" />
                <span>Unlock Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
