'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UploadZone from '@/components/upload/UploadZone';

export default function ResumeUploadPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/builder');
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Upload & Parse Existing Resume</h1>
          <p className="text-xs text-slate-400">
            Extract text, skills, experience, and education directly into TrustFlow AI ATS builder.
          </p>
        </div>

        <UploadZone onComplete={handleComplete} />
      </div>
    </ProtectedRoute>
  );
}
