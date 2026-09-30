'use client';

import React from 'react';
import { FiCheck, FiArrowRight, FiShield, FiAlertTriangle, FiZap, FiFileText } from 'react-icons/fi';

export default function JobOptimizerSplitView({ optimizationData, onApplyOptimization }) {
  if (!optimizationData) return null;

  const { suggestedSummary, addedKeywords, refinedBulletPoints, disclaimer } = optimizationData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
            AI Job Alignment
          </span>
          <h3 className="text-lg font-bold text-white mt-1">Suggested Tailored Resume Modifications</h3>
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-2">
          <FiShield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{disclaimer || 'Strict Integrity: No false experience or fake jobs invented.'}</span>
        </div>
      </div>

      {/* Suggested Summary Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Original Professional Summary
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
            {optimizationData.originalSummary || 'Motivated developer with software engineering background.'}
          </p>
        </div>

        <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-500/40 space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block flex items-center space-x-1.5">
            <FiZap className="w-4 h-4" />
            <span>AI Optimized Summary (Keyword Targeted)</span>
          </span>
          <p className="text-xs text-cyan-100 leading-relaxed font-medium bg-slate-900 p-3 rounded-lg border border-cyan-500/30">
            {suggestedSummary}
          </p>
        </div>
      </div>

      {/* Suggested Keywords to Add */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Keywords Seamlessly Integrated into Skills Section
        </h4>
        <div className="flex flex-wrap gap-2">
          {addedKeywords?.map((kw) => (
            <span
              key={kw}
              className="text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-lg flex items-center space-x-1.5"
            >
              <FiCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{kw}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bullet Points Refinement Comparison */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Action Bullet Points Refinement (Impact & Action Verbs)
        </h4>

        <div className="space-y-3">
          {refinedBulletPoints?.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Before</span>
                  <p className="text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">{item.original}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">After Optimization</span>
                  <p className="text-emerald-200 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 font-medium">
                    {item.optimized}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={() => onApplyOptimization && onApplyOptimization(optimizationData)}
          className="px-6 py-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <FiFileText className="w-4 h-4" />
          <span>Apply Changes to Current Resume Draft</span>
        </button>
      </div>
    </div>
  );
}
