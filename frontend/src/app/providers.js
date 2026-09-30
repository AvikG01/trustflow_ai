'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { AtsAuthProvider } from '@/context/AtsAuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ResumeProvider } from '@/context/ResumeContext';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AtsAuthProvider>
            <ResumeProvider>{children}</ResumeProvider>
          </AtsAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
