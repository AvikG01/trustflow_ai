'use client';

import React, { useState } from 'react';
import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiTool,
} from 'react-icons/fi';

export default function AnalysisIssueCard({ flaw }) {
  const [expanded, setExpanded] = useState(true);

  if (!flaw) return null;

  const severity = flaw.severity || 'major';

  let borderClasses = 'border-amber-500/40 bg-amber-950/20';
  let badgeClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  let Icon = FiAlertTriangle;

  if (severity === 'critical') {
    borderClasses = 'border-rose-500/50 bg-rose-950/20';
    badgeClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    Icon = FiAlertOctagon;
  } else if (severity === 'minor') {
    borderClasses = 'border-cyan-500/30 bg-cyan-950/20';
    badgeClasses = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    Icon = FiInfo;
  }

  return (
    <div className={`border rounded-2xl p-5 shadow-lg backdrop-blur-xl transition-all ${borderClasses}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClasses}`}>
                {severity} Severity
              </span>
              {flaw.category && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {flaw.category}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white mt-1">{flaw.parameter}</h4>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3.5 text-xs">
          {/* Problem */}
          <div>
            <span className="font-bold text-slate-300 block mb-1">Identified Issue:</span>
            <p className="text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-medium">
              {flaw.problem}
            </p>
          </div>

          {/* Why It Matters (Educational) */}
          <div>
            <span className="font-bold text-cyan-400 block mb-1">Why It Matters (Recruiter / ATS View):</span>
            <p className="text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {flaw.whyItMatters}
            </p>
          </div>

          {/* Recommended Fix */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <FiTool className="w-4 h-4" />
              <span>Recommended Actionable Fix:</span>
            </div>
            <p className="text-emerald-100 font-medium leading-relaxed pl-6">{flaw.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}
