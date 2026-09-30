'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }) {
  return <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>;
}
