'use client';

import React from 'react';

export default function LoadingState({ message = 'Loading intelligence module...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400 font-mono animate-pulse">{message}</p>
    </div>
  );
}
