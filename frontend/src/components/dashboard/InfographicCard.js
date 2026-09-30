'use client';

import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiHelpCircle, FiArrowRight } from 'react-icons/fi';

export default function InfographicCard() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <FiAlertTriangle className="w-3.5 h-3.5" />
            <span>Reality Check for IT Students</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight pt-1">
            Why 84% of Student Resumes Are Rejected by ATS & Recruiters
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Flaw 1 */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center font-bold">1</span>
            <span>Zero Metrics & Impact</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            "Developed a web app" vs "Architected React SaaS platform serving 10,000+ API calls/day."
          </p>
          <p className="text-[11px] text-slate-400 leading-snug">
            MNC recruiters automatically filter out resumes without quantifiable metrics (%, numbers, latency reductions).
          </p>
        </div>

        {/* Flaw 2 */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center font-bold">2</span>
            <span>Parsing Tables & Graphics</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Custom Canva multi-column designs break standard ATS XML parsers into unreadable gibberish.
          </p>
          <p className="text-[11px] text-slate-400 leading-snug">
            TrustFlow AI uses single-column ATS clean architecture guaranteed to pass screening algorithms.
          </p>
        </div>

        {/* Flaw 3 */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold">3</span>
            <span>Outdated Skill Terminology</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Listing generic "HTML, CSS, JS" without highlighting Docker, REST, Next.js, and CI/CD.
          </p>
          <p className="text-[11px] text-slate-400 leading-snug">
            CCS (Candidate Competency System) measures practical deployment readiness over raw academic degrees.
          </p>
        </div>
      </div>

      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FiCheckCircle className="w-6 h-6 text-cyan-400 shrink-0" />
          <p className="text-xs text-cyan-100 font-medium">
            TrustFlow AI fixes these critical gaps automatically with AI flaw detection and job-specific optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
