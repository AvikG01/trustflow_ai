'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ResumeEditor from '@/components/builder/ResumeEditor';
import ResumePreview from '@/components/builder/ResumePreview';
import TemplateSelector from '@/components/builder/TemplateSelector';
import { FiEdit3, FiEye, FiSliders, FiLayout } from 'react-icons/fi';

export default function ResumeBuilderPage() {
  const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 min-h-[calc(100vh-4rem)]">
      {/* Top Controls Header */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>AI Resume Builder</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30 font-mono">
              Live State Sync
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time updates • ATS clean layout formatting • High-impact IT structure
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile EDIT / PREVIEW Toggle Button (Requirement #8) */}
          <div className="flex md:hidden bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1 w-full sm:w-auto">
            <button
              onClick={() => setMobileTab('edit')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mobileTab === 'edit' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>EDIT</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mobileTab === 'preview' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              <span>PREVIEW</span>
            </button>
          </div>

          <button
            onClick={() => setShowTemplateDrawer(!showTemplateDrawer)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors shrink-0"
          >
            <FiLayout className="w-4 h-4 text-cyan-400" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* Template Selector Drawer */}
      {showTemplateDrawer && (
        <div className="no-print animate-fadeIn">
          <TemplateSelector />
        </div>
      )}

      {/* Split Screen Layout (Desktop: Left Form, Right Preview | Tablet: Responsive Grid | Mobile: Tab Toggle) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Resume Editing Form */}
        <div
          className={`no-print md:col-span-6 lg:col-span-5 ${
            mobileTab === 'edit' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Resume Form Sections
            </h2>
            <ResumeEditor />
          </div>
        </div>

        {/* Right: Live Resume Preview */}
        <div
          className={`md:col-span-6 lg:col-span-7 sticky top-20 ${
            mobileTab === 'preview' ? 'block' : 'hidden md:block'
          }`}
        >
          <ResumePreview />
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}
