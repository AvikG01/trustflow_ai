'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmailOutputCard from '@/components/emails/EmailOutputCard';
import AIProcessingIndicator from '@/components/ui/AIProcessingIndicator';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { FiMail, FiBriefcase, FiUser, FiSend, FiZap } from 'react-icons/fi';

export default function EmailGeneratorPage() {
  const { limits, refreshLimits } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  const emailsUsed = limits?.emailsUsed ?? 0;
  const emailsMax = limits?.emailsMax ?? 5;

  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    if (emailsUsed >= emailsMax) {
      alert('Free AI Email limit reached (5/5). Upgrade or reset limit.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest({
        action: 'generate_ai_email',
        data: {
          job_title: jobTitle,
          company_name: companyName,
          recruiter_info: recruiterName,
          job_description: jobDescription,
        },
      });

      setTimeout(() => {
        setEmailResult(res.email || res);
        if (res.usage) refreshLimits({ emailsUsed: res.usage.used });
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <FiMail className="w-3.5 h-3.5" />
          <span>Cold Pitch AI Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Recruiter Application Email Generator</h1>
        <p className="text-xs text-slate-400">
          Generate targeted, high-conversion cold application emails for HR & Recruiters.
        </p>
      </div>

      {/* Usage Limit Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs">
        <span className="text-slate-300 font-medium">Free Plan AI Email Usage Counter</span>
        <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/30">
          {emailsUsed} / {emailsMax} Emails Used
        </span>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerateEmail} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiBriefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Role Title</span>
            </label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. React Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiBriefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Company Name</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Google India"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
              <FiUser className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recruiter Name (Optional)</span>
            </label>
            <input
              type="text"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Hiring Manager"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Job Description Key Highlights
          </label>
          <textarea
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || emailsUsed >= emailsMax}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <FiZap className="w-4 h-4" />
          <span>{loading ? 'Generating Application Email...' : 'Generate AI Pitch Email'}</span>
        </button>
      </form>

      {loading && <AIProcessingIndicator currentState="GENERATING REPORT" message="Structuring formal recruiter email pitch..." />}

      {emailResult && !loading && (
        <EmailOutputCard emailData={emailResult} onRegenerate={handleGenerateEmail} />
      )}
      </div>
    </ProtectedRoute>
  );
}
