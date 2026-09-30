'use client';

import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to process your request at this moment. Please try again.',
  onRetry,
}) {
  return (
    <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-8 backdrop-blur-md">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
        <FiAlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-rose-500/20 inline-flex items-center space-x-2 transition-colors"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
