'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function PublicOnlyGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams?.get('redirect') || '/dashboard';
      router.replace(redirect);
    }
  }, [loading, user, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return children;
}

export default function PublicOnlyRoute({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PublicOnlyGuard>{children}</PublicOnlyGuard>
    </Suspense>
  );
}
