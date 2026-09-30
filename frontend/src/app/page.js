'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import InfographicCard from '@/components/dashboard/InfographicCard';
import {
  FiCpu,
  FiFileText,
  FiPieChart,
  FiBriefcase,
  FiZap,
  FiMail,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';

export default function LandingPage() {
  const heroRef = useRef(null);
  const workflowRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, []);

  const workflowSteps = [
    { title: 'Create Resume', desc: 'Build ATS-structured resume using engineered templates', icon: FiFileText },
    { title: 'Analyze', desc: 'Execute ATS & CCS flaw detection algorithms', icon: FiPieChart },
    { title: 'Find Jobs', desc: 'Match your verified skills with real IT job postings', icon: FiBriefcase },
    { title: 'Optimize', desc: 'Tailor resume bullets specifically for target JD', icon: FiZap },
    { title: 'Apply', desc: 'Generate high-conversion AI recruiter application emails', icon: FiMail },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroRef} className="relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full shadow-xl">
            <FiCpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              Next-Gen AI Resume & Career Intelligence Engine 2026
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white">
            TRUSTFLOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-slate-200 tracking-tight">
            "Build. Analyze. Optimize. Get Job-Ready."
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Awaring IT students that standard generic resumes fail modern recruiter screening. Transform your resume with AI-driven ATS parsing, CCS competency scoring, and targeted job optimization.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/builder"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <FiFileText className="w-5 h-5" />
              <span>Build My Resume</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/analysis"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <FiPieChart className="w-5 h-5 text-cyan-400" />
              <span>Analyze My Resume</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Animated Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">System Workflow</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">The TrustFlow AI Career Pipeline</h3>
        </div>

        <div ref={workflowRef} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-3 relative group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">STEP 0{idx + 1}</span>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-snug">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Infographic Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InfographicCard />
      </section>

      {/* Core AI Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <FiFileText className="w-8 h-8 text-cyan-400" />
            <h3 className="text-base font-bold text-white">1. AI Resume Builder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3 battle-tested ATS-friendly templates (Classic, Technical, Minimal) with real-time live preview & instant state sync.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <FiPieChart className="w-8 h-8 text-indigo-400" />
            <h3 className="text-base font-bold text-white">2. ATS & CCS Flaw Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protected authorization engine providing parameter-by-parameter flaw breakdowns, why issues matter, and actionable fixes.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <FiZap className="w-8 h-8 text-amber-400" />
            <h3 className="text-base font-bold text-white">3. Job Match & Optimizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailor resume bullets specifically for target Job Descriptions while maintaining strict non-invented data rules.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
