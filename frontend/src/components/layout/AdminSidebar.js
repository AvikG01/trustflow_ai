'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiShield, FiUsers, FiFileText, FiBarChart2, FiActivity } from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', path: '/admin', icon: FiShield },
    { label: 'Users Management', path: '/admin/users', icon: FiUsers },
    { label: 'Resumes Audit', path: '/admin/resumes', icon: FiFileText },
    { label: 'System Reports', path: '/admin/reports', icon: FiBarChart2 },
    { label: 'Activity & Audit', path: '/admin/audit', icon: FiActivity },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 space-y-4 shrink-0">
      <div className="flex items-center space-x-2 px-3 py-2 border-b border-slate-800 pb-4">
        <FiShield className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-bold text-white tracking-wider">ADMIN CONSOLE</span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.path;

          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
