'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/context/AuthContext';
import ErrorState from '@/components/ui/ErrorState';
import { apiRequest } from '@/lib/api';

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await apiRequest({ action: 'getAdminUsers', method: 'GET' });
        if (Array.isArray(res)) setUsersList(res);
        else if (res && Array.isArray(res.users)) setUsersList(res.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorState
          title="Access Denied"
          message="Administrator authentication required."
        />
      </div>
    );
  }

  const columns = [
    { header: 'User ID', key: 'id' },
    { header: 'Full Name', key: 'name' },
    { header: 'Email Address', key: 'email' },
    {
      header: 'Role',
      key: 'role',
      render: (val) => (
        <span className="font-mono text-[10px] uppercase font-bold bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">
          {val || 'user'}
        </span>
      ),
    },
    {
      header: 'Plan Tier',
      key: 'plan',
      render: (val) => (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${val === 'Premium' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}>
          {val || 'Free'}
        </span>
      ),
    },
    { header: 'Resumes', key: 'resumes' },
    { header: 'Analyses', key: 'analyses' },
    { header: 'Joined', key: 'createdAt' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin User Management</h1>
          <p className="text-xs text-slate-400">Inspect registered users, activity limits, and plan statuses</p>
        </div>

        <DataTable columns={columns} data={usersList} searchPlaceholder="Search users by name or email..." />
      </main>
    </div>
  );
}
