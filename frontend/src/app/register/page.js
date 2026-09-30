'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PublicOnlyRoute from '@/components/auth/PublicOnlyRoute';
import { FiUser, FiMail, FiLock, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const redirectPath = searchParams?.get('redirect') || '/dashboard';

  // Password validation heuristics
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    if (!hasMinLength || !hasLetter || !hasNumber) {
      setError('Please fulfill password security requirements');
      return;
    }
    setError('');
    try {
      await register(name, email, password);
      router.push(redirectPath);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create TrustFlow AI Account</h1>
          <p className="text-xs text-slate-400">Build your ATS-ready resume and unlock job intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiUser className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiMail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              placeholder="rahul.sharma@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiLock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiLock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Confirm Password</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {/* Password Validation Indicators */}
          {password && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                {hasMinLength ? <FiCheck className="text-emerald-400" /> : <FiX className="text-rose-400" />}
                <span className={hasMinLength ? 'text-emerald-300' : 'text-slate-400'}>
                  At least 8 characters long
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {hasLetter && hasNumber ? <FiCheck className="text-emerald-400" /> : <FiX className="text-rose-400" />}
                <span className={hasLetter && hasNumber ? 'text-emerald-300' : 'text-slate-400'}>
                  Contains letters and numbers
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordsMatch ? <FiCheck className="text-emerald-400" /> : <FiX className="text-rose-400" />}
                <span className={passwordsMatch ? 'text-emerald-300' : 'text-slate-400'}>
                  Passwords match
                </span>
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <PublicOnlyRoute>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <RegisterForm />
      </Suspense>
    </PublicOnlyRoute>
  );
}
