'use client';

import React from 'react';
import Link from 'next/link';
import { FiCpu, FiShield, FiCheckCircle } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                <FiCpu className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-wider">TRUSTFLOW AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Awaring students that their resumes are incompetent for the practical IT world and competitive job market.
            </p>
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono">
              <FiCheckCircle className="w-4 h-4" />
              <span>ATS & CCS Engine 2026 Ready</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/builder" className="hover:text-cyan-400 transition-colors">
                  AI Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-cyan-400 transition-colors">
                  ATS Resume Templates
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="hover:text-cyan-400 transition-colors">
                  ATS / CCS Analysis
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-cyan-400 transition-colors">
                  AI Job Matcher
                </Link>
              </li>
              <li>
                <Link href="/optimize" className="hover:text-cyan-400 transition-colors">
                  Job Resume Optimizer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Education & Rules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Student Incompetence Reality Check
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Quantifiable Achievement Metrics
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  ATS Table Parsing Vulnerabilities
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  CCS Leadership Signals
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Security & Admin</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="text-amber-400/90 hover:text-amber-300 transition-colors flex items-center space-x-1">
                  <FiShield className="w-3.5 h-3.5" />
                  <span>Admin Console Portal</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Cloudflare Enterprise Protected</span>
              </li>
              <li>
                <span className="text-slate-400">Strict Action-Dispatcher Contract</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <p>© 2026 TrustFlow AI. Built with Next.js App Router & Tailwind CSS.</p>
          <p className="font-mono text-[11px] text-slate-400">
            Node.js / Gemini AI Integration Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
