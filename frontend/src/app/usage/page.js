'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UsageLimitCard from '@/components/dashboard/UsageLimitCard';

export default function UsagePage() {
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Usage & Tier Limits</h1>
          <p className="text-xs text-slate-400">Backend enforced quota monitoring dashboard</p>
        </div>

        <UsageLimitCard />
      </div>
    </ProtectedRoute>
  );
}
