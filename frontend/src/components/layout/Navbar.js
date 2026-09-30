'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FiCpu,
  FiFileText,
  FiPieChart,
  FiBriefcase,
  FiMail,
  FiUser,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX,
  FiZap,
  FiChevronDown,
} from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => pathname === path || (path !== '/' && pathname?.startsWith(path));

  const navItems = [
    { label: 'Builder', path: '/builder', icon: FiFileText },
    { label: 'ATS/CCS Analysis', path: '/analysis', icon: FiPieChart },
    { label: 'Job Search', path: '/jobs', icon: FiBriefcase },
    { label: 'Job Optimization', path: '/optimize', icon: FiZap },
    { label: 'AI Email', path: '/emails', icon: FiMail },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <FiCpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              TRUSTFLOW <span className="text-cyan-400 font-extrabold">AI</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Career Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {user &&
            navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* User Right Menu / Auth Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 bg-slate-900 border border-slate-700/80 px-3.5 py-1.5 rounded-full hover:border-cyan-500/50 transition-all focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">{user.name}</span>
                {isAdmin && (
                  <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
                <FiChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 divide-y divide-slate-800 backdrop-blur-2xl"
                >
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <FiFileText className="w-4 h-4 text-cyan-400" />
                      <span>User Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <FiUser className="w-4 h-4 text-indigo-400" />
                      <span>Profile & Limits</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-amber-300 hover:bg-slate-800"
                      >
                        <FiShield className="w-4 h-4 text-amber-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center space-x-2.5 w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
              >
                Build My Resume
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-800 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
                >
                  <FiFileText className="w-5 h-5 text-cyan-400" />
                  <span>Dashboard</span>
                </Link>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
                    >
                      <Icon className="w-5 h-5 text-slate-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-amber-300 hover:bg-slate-900"
                  >
                    <FiShield className="w-5 h-5 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-slate-200 font-medium bg-slate-900 rounded-lg border border-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg"
              >
                Build My Resume
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
