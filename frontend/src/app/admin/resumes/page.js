'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/context/AuthContext';
import ErrorState from '@/components/ui/ErrorState';
import { apiRequest } from '@/lib/api';

export default function AdminResumesPage() {
  const { isAdmin } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminResumes() {
      try {
        const res = await apiRequest({ action: 'getResumes', method: 'GET' });
        if (Array.isArray(res)) setResumes(res);
        else if (res && Array.isArray(res.resumes)) setResumes(res.resumes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminResumes();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorState title="Access Denied" message="Administrator authentication required." />
      </div>
    );
  }

  const columns = [
    { header: 'Resume ID', key: 'id' },
    { header: 'Resume Title', key: 'title' },
    { header: 'Owner', key: 'user' },
    { header: 'Template', key: 'template' },
    {
      header: 'ATS Score',
      key: 'scoreAts',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-cyan-400">{val ? `${val}%` : 'N/A'}</span>
      ),
    },
    {
      header: 'Cloud Reference',
      key: 'driveRef',
      render: (val) => <span className="font-mono text-[10px] text-slate-400">{val || 'None'}</span>,
    },
    { header: 'Last Modified', key: 'updatedAt' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Resume Storage & References</h1>
          <p className="text-xs text-slate-400">Inspect system generated and imported resume documents</p>
        </div>

        <DataTable columns={columns} data={resumes} searchPlaceholder="Search resumes by title or owner..." />
      </main>
    </div>
  );
}
