'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useResume } from '@/context/ResumeContext';
import { useToast } from '@/context/ToastContext';
import JobOptimizerSplitView from '@/components/jobs/JobOptimizerSplitView';
import AIProcessingIndicator from '@/components/ui/AIProcessingIndicator';
import { apiRequest } from '@/lib/api';
import { FiZap, FiFileText, FiBriefcase, FiShield, FiArrowRight } from 'react-icons/fi';

export default function JobOptimizationPage() {
  const { resumeData, updateResumeField } = useResume();
  const { addToast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const handleRunOptimization = async (e) => {
    e.preventDefault();
    if (!jobDescription) return;

    setLoading(true);

    try {
      const res = await apiRequest({
        action: 'optimize_resume_for_job',
        data: {
          resume_id: resumeData.id,
          job_description: jobDescription,
        },
      });

      setTimeout(() => {
        setOptimizationResult(res.result || res.optimizations || res);
        setLoading(false);
        addToast('Resume optimization suggestions generated!', 'success');
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleApplyChanges = (optimizations) => {
    if (optimizations.suggestedSummary) {
      updateResumeField('professionalSummary', optimizations.suggestedSummary);
    }
    if (optimizations.addedKeywords && Array.isArray(optimizations.addedKeywords)) {
      const current = resumeData.skills?.frontend || [];
      const updated = Array.from(new Set([...current, ...optimizations.addedKeywords]));
      updateResumeField('skills.frontend', updated);
    }
    addToast('Optimization applied to active resume draft!', 'success');
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <FiZap className="w-3.5 h-3.5" />
          <span>Job-Specific Tailoring</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Resume Job Optimizer</h1>
        <p className="text-xs text-slate-400">
          Paste a target Job Description to align action verbs, keywords, and summary without inventing fake credentials.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleRunOptimization} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <FiBriefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Job Description (JD)</span>
          </label>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white leading-relaxed focus:border-cyan-500 focus:outline-none"
            placeholder="Paste complete job description requirements here..."
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
            <FiShield className="w-4 h-4" />
            <span>Strict AI Guardrail: No fabricated experiences or fake credentials.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !jobDescription}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0"
          >
            <FiZap className="w-4 h-4" />
            <span>{loading ? 'Optimizing Resume...' : 'Analyze & Optimize Resume'}</span>
          </button>
        </div>
      </form>

      {loading && <AIProcessingIndicator currentState="GENERATING REPORT" message="Matching keywords with active resume..." />}

      {optimizationResult && !loading && (
        <JobOptimizerSplitView
          optimizationData={optimizationResult}
          onApplyOptimization={handleApplyChanges}
        />
      )}
      </div>
    </ProtectedRoute>
  );
}
