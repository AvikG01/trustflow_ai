'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useResume } from '@/context/ResumeContext';
import ClassicTemplate from '@/components/builder/templates/ClassicTemplate';
import TechnicalTemplate from '@/components/builder/templates/TechnicalTemplate';
import MinimalTemplate from '@/components/builder/templates/MinimalTemplate';
import { FiCheckCircle, FiLayout, FiArrowRight } from 'react-icons/fi';

export default function ResumeTemplatesPage() {
  const { resumeData, updateTemplate } = useResume();

  const templates = [
    {
      id: 'TechnicalTemplate',
      name: 'Template 02: Modern Technical',
      desc: 'Optimized for IT, Software Development, Fullstack, and Engineering roles. Highlights skills, containerization, and metric achievements.',
      passRate: '99%',
      component: <TechnicalTemplate data={resumeData} />,
    },
    {
      id: 'ClassicTemplate',
      name: 'Template 01: Professional Classic',
      desc: 'Standard Serif structure preferred by Fortune 500 recruiters and enterprise corporate screening systems.',
      passRate: '98%',
      component: <ClassicTemplate data={resumeData} />,
    },
    {
      id: 'MinimalTemplate',
      name: 'Template 03: Executive Minimal',
      desc: 'Clean typography layout engineered for modern product companies, SaaS startups, and high-growth IT roles.',
      passRate: '97%',
      component: <MinimalTemplate data={resumeData} />,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ATS Resume Templates Showcase</h1>
        <p className="text-xs text-slate-400">
          All three templates are 100% ATS-friendly, single-column formatted, and parsed cleanly without table tag errors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase font-mono">{tpl.passRate} ATS Pass Rate</span>
                <FiCheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">{tpl.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tpl.desc}</p>
            </div>

            {/* Template Mini Preview Wrapper */}
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-hidden max-h-[380px] shadow-inner">
              <div className="scale-50 origin-top transform">
                {tpl.component}
              </div>
            </div>

            <Link
              href="/builder"
              onClick={() => updateTemplate(tpl.id)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 text-center flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>Use This Template</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
      </div>
    </ProtectedRoute>
  );
}
