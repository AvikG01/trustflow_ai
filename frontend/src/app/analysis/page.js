'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAtsAuth } from '@/context/AtsAuthContext';
import { useResume } from '@/context/ResumeContext';
import ProgressRing from '@/components/dashboard/ProgressRing';
import AnalysisIssueCard from '@/components/analysis/AnalysisIssueCard';
import AIProcessingIndicator from '@/components/ui/AIProcessingIndicator';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  FiShield,
  FiLock,
  FiPieChart,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiAward,
  FiBriefcase,
  FiCheckSquare,
  FiSearch,
} from 'react-icons/fi';

export default function AnalysisPage() {
  const { isAtsAuthorized, openAuthModal } = useAtsAuth();
  const { setAnalysis, resumeData } = useResume();
  const { addToast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [aiState, setAiState] = useState('ANALYZING');
  const [report, setReport] = useState(null);

  // Load existing analysis if available on mount
  useEffect(() => {
    async function fetchLatestAnalysis() {
      try {
        const historyRes = await apiRequest({ action: 'getAnalysisHistory' });
        const historyList = historyRes.history || historyRes || [];
        if (Array.isArray(historyList) && historyList.length > 0) {
          const latest = historyList[0];
          setReport(latest);
          setAnalysis(latest);
        }
      } catch (e) {
        // Silent catch if no history exists yet
      }
    }
    fetchLatestAnalysis();
  }, [setAnalysis]);

  const handleRunAnalysis = async () => {
    if (!isAtsAuthorized) {
      openAuthModal(() => handleRunAnalysis());
      return;
    }

    setAnalyzing(true);
    setAiState('QUEUED');

    setTimeout(() => setAiState('ANALYZING'), 600);
    setTimeout(() => setAiState('GENERATING REPORT'), 1500);

    try {
      const payload = {
        resume_id: resumeData?.id || null,
        target_job_title: resumeData?.target_role || 'Senior Full Stack Software Engineer',
        resume_data: resumeData,
      };

      const res = await apiRequest({ action: 'analyze_resume', data: payload });
      const rawReport = res.report || res;
      
      setReport(rawReport);
      setAnalysis(rawReport);
      addToast('ATS & CCS Flaw Analysis completed successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Analysis failed. Please check ATS authorization password.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Safe field extraction
  const atsScore = report?.ats_score ?? report?.atsScore ?? 0;
  const ccsScore = report?.ccs_score ?? report?.ccsScore ?? 0;
  const overallStatus = report?.overall_status ?? report?.approvalStatus ?? 'REVIEW_REQUIRED';
  const isApproved = Boolean(report?.is_approved);

  // Normalize parameters into AnalysisIssueCard flaws
  const rawParams = report?.parameters || report?.raw_analysis_json?.parameters || [];
  const flawsList = Array.isArray(rawParams) && rawParams.length > 0
    ? rawParams.map((p, idx) => ({
        id: p.id || `param-${idx}`,
        severity: (p.severity || 'MAJOR').toLowerCase(),
        category: p.category || 'ATS',
        parameter: p.parameter_name || p.parameter || 'Parameter Check',
        problem: p.problem || 'Issue detected in section syntax or metrics',
        whyItMatters: p.why_it_matters || p.whyItMatters || 'Recruiters and ATS engines flag this pattern during evaluation.',
        fix: p.recommended_action || p.fix || 'Update section wording and metrics according to best practices.'
      }))
    : [];

  const certAudits = report?.certification_audits || report?.raw_analysis_json?.certification_audits || [];
  const internshipAudits = report?.internship_audits || report?.raw_analysis_json?.internship_audits || [];
  const factCheckFindings = report?.fact_check_findings || report?.raw_analysis_json?.fact_check_findings || [];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
                Analysis Engine
              </span>
              <span className="text-xs text-slate-400">• ATS / CCS Deep Parser</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              ATS & CCS Resume Flaw Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Audit your resume for recruitment algorithm risks, missing keywords, and structural flaws
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0"
          >
            <FiRefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing Resume...' : 'Re-Run ATS & CCS Analysis'}</span>
          </button>
        </div>

        {!isAtsAuthorized && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ATS & CCS Authorization Password Required</h3>
                <p className="text-xs text-slate-400">
                  Analysis algorithms are protected by admin-level password verification.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2"
            >
              <FiLock className="w-4 h-4" />
              <span>Enter Authorization Password</span>
            </button>
          </div>
        )}

        {analyzing && (
          <AIProcessingIndicator currentState={aiState} message="Parsing resume text & scoring competencies via Gemini AI..." />
        )}

        {report && !analyzing && (
          <div className="space-y-8 animate-fadeIn">
            {/* Score Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Score</h3>
                <ProgressRing score={atsScore} label="ATS Compatibility" size={130} />
                <p className="text-xs text-slate-300">
                  Keyword match & syntax parsing score against IT industry standards.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">CCS Score</h3>
                <ProgressRing score={ccsScore} label="Competency Score" size={130} />
                <p className="text-xs text-slate-300">
                  Candidate Competency System evaluation of leadership & technical depth.
                </p>
              </div>

              {/* Approval & Review Status Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                      Status: {overallStatus}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/30">
                      {isApproved ? 'APPROVED' : 'MANUAL REVIEW REQUIRED'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">Score Review Breakdown</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    Threshold policy strictly enforced. Even with high scores, candidate resumes require manual review before auto-submission.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Reference: {report.reference_code || report.id || 'TF-AUDIT-ACTIVE'}
                </div>
              </div>
            </div>

            {/* Flaw Detection Section */}
            {flawsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FiAlertTriangle className="w-5 h-5 text-rose-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Detected Resume Flaws & Actionable Fixes ({flawsList.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flawsList.map((flaw) => (
                    <AnalysisIssueCard key={flaw.id} flaw={flaw} />
                  ))}
                </div>
              </div>
            )}

            {/* Certification Verification Audits */}
            {certAudits.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <FiAward className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Certification Credibility Audits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {certAudits.map((cert, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{cert.name || 'Certification'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
                          {cert.status || 'Verification unavailable'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Issuer: {cert.issuer || 'Third-Party Academy'}</p>
                      <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                        {cert.relevance_notes || 'External verification API unavailable.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internship Duration Audits */}
            {internshipAudits.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <FiBriefcase className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Internship Duration Audits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {internshipAudits.map((intern, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{intern.company || 'Company'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${intern.full_approval_granted ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' : 'bg-rose-950/60 text-rose-400 border-rose-500/30'}`}>
                          {intern.full_approval_granted ? 'Full Approval Granted' : 'Approval Withheld (< 3 Mo)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Duration: {intern.duration_months} month(s)</p>
                      <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                        {intern.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fact & Figure Checking Findings */}
            {factCheckFindings.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <FiSearch className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">Fact & Figure Check Findings</h3>
                </div>
                <div className="space-y-3">
                  {factCheckFindings.map((finding, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-rose-400">Issue: {finding.detected_issue}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Claim Audit</span>
                      </div>
                      <p className="text-slate-300 font-mono bg-slate-900 p-2 rounded border border-slate-800">
                        Claim: "{finding.original_claim}"
                      </p>
                      <p className="text-slate-400">Reason: {finding.reason}</p>
                      <p className="text-emerald-300">Correction: {finding.recommended_correction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!report && !analyzing && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FiPieChart className="w-12 h-12 text-cyan-400 mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-white">No Analysis Available Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click "Re-Run ATS & CCS Analysis" above to analyze your active resume for recruitment algorithm risks and competency scores.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
