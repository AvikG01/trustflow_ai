'use client';

import React from 'react';
import { FiCpu, FiCheckCircle } from 'react-icons/fi';

export default function AIProcessingIndicator({ currentState = 'ANALYZING', message = 'Processing AI operations...' }) {
  const states = ['QUEUED', 'ANALYZING', 'GENERATING REPORT', 'COMPLETED'];
  const currentIndex = states.indexOf(currentState.toUpperCase());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-w-lg mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
        <FiCpu className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white tracking-tight">TrustFlow AI Engine Active</h3>
        <p className="text-xs text-slate-400">{message}</p>
      </div>

      <div className="flex justify-between items-center relative pt-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-cyan-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (states.length - 1)) * 100}%` }}
        />

        {states.map((st, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={st} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/30 animate-pulse'
                    : isDone
                    ? 'bg-cyan-900 border border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border border-slate-800 text-slate-500'
                }`}
              >
                {isDone ? <FiCheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider mt-2 ${
                  isDone ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                {st}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
