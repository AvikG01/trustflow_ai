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
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCode,
  FiZap,
} from 'react-icons/fi';

export default function AnalysisPage() {
  const { isAtsAuthorized, openAuthModal } = useAtsAuth();
  const { setAnalysis, resumeData, saveResumeNow } = useResume();
  const { addToast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [aiState, setAiState] = useState('ANALYZING');
  const [report, setReport] = useState(null);
  const [showAtsBreakdown, setShowAtsBreakdown] = useState(false);
  const [showCcsBreakdown, setShowCcsBreakdown] = useState(false);

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

    let currentResume = resumeData;
    if (!currentResume?.id) {
      try {
        currentResume = await saveResumeNow();
      } catch (e) {
        // Continue if save fails
      }
    }

    if (!currentResume?.id && !currentResume?.personalInfo?.fullName && !currentResume?.professionalSummary) {
      addToast('Please save your resume before running ATS analysis.', 'error');
      return;
    }

    setAnalyzing(true);
    setAiState('QUEUED');

    setTimeout(() => setAiState('ANALYZING'), 600);
    setTimeout(() => setAiState('GENERATING REPORT'), 1500);

    try {
      const payload = {
        resume_id: currentResume?.id || null,
        target_job_title: currentResume?.target_role || 'Senior Full Stack Software Engineer',
        resume_data: currentResume,
      };

      const res = await apiRequest({ action: 'analyze_resume', data: payload });
      const rawReport = res.report || res;

      setReport(rawReport);
      setAnalysis(rawReport);
      addToast('ATS & CCS Deep Flaw Analysis completed successfully!', 'success');
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

  const rawParams = report?.parameters || report?.raw_analysis_json?.parameters || [];
  const flawsList = Array.isArray(rawParams) && rawParams.length > 0
    ? rawParams.map((p, idx) => ({
        id: p.id || `param-${idx}`,
        severity: (p.severity || 'MAJOR').toLowerCase(),
        category: p.category || 'ATS',
        parameter: p.parameter_name || p.title || p.parameter || 'Parameter Check',
        problem: p.problem || p.description || 'Issue detected in section syntax or metrics',
        whyItMatters: p.why_it_matters || p.whyItMatters || 'Recruiters and ATS engines flag this pattern during evaluation.',
        fix: p.recommended_action || p.recommendation || p.fix || 'Update section wording and metrics according to best practices.'
      }))
    : [];

  const certAudits = report?.certification_audits || report?.raw_analysis_json?.certification_audits || [];
  const internshipAudits = report?.internship_audits || report?.raw_analysis_json?.internship_audits || [];
  const factCheckFindings = report?.fact_check_findings || report?.raw_analysis_json?.fact_check_findings || [];
  const scoreBreakdown = report?.scoreBreakdown || report?.raw_analysis_json?.scoreBreakdown || null;
  const ccsBreakdown = report?.ccsBreakdown || report?.raw_analysis_json?.ccsBreakdown || null;
  const skillEvidenceGaps = report?.skillEvidenceGaps || report?.raw_analysis_json?.skillEvidenceGaps || [];
  const missingKeywords = report?.missingKeywords || report?.raw_analysis_json?.missingKeywords || [];
  const strengths = report?.strengths || report?.raw_analysis_json?.strengths || [];
  const recommendations = report?.recommendations || report?.raw_analysis_json?.recommendations || [];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
                Enterprise Analysis Engine
              </span>
              <span className="text-xs text-slate-400">• Deep 20-Dimension Audit</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              ATS & CCS Deep Flaw Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Evidence-based evaluation against technical recruitment screening standards
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
          <AIProcessingIndicator currentState={aiState} message="Running 20-dimension ATS & CCS candidate competency audit via Gemini AI..." />
        )}

        {report && !analyzing && (
          <div className="space-y-8 animate-fadeIn">
            {/* Score Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Score</h3>
                <ProgressRing score={atsScore} label="ATS Compatibility" size={130} />
                <p className="text-xs text-slate-300">
                  Weighted category match against enterprise recruitment standards.
                </p>
                {scoreBreakdown && (
                  <button
                    onClick={() => setShowAtsBreakdown(!showAtsBreakdown)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center space-x-1 mx-auto pt-1"
                  >
                    <span>{showAtsBreakdown ? 'Hide Category Breakdown' : 'View Category Breakdown'}</span>
                    {showAtsBreakdown ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">CCS Score</h3>
                <ProgressRing score={ccsScore} label="Competency Score" size={130} />
                <p className="text-xs text-slate-300">
                  Candidate Competency System evaluation of technical depth & evidence.
                </p>
                {ccsBreakdown && (
                  <button
                    onClick={() => setShowCcsBreakdown(!showCcsBreakdown)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center space-x-1 mx-auto pt-1"
                  >
                    <span>{showCcsBreakdown ? 'Hide Competency Breakdown' : 'View Competency Breakdown'}</span>
                    {showCcsBreakdown ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                )}
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
                  <h3 className="text-base font-bold text-white">Strict Threshold Audit</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    Threshold policy enforced. Resumes require evidence verification and manual review prior to candidate submission.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Reference: {report.reference_code || report.id || 'TF-AUDIT-ACTIVE'}
                </div>
              </div>
            </div>

            {/* ATS Score Breakdown Drawer */}
            {showAtsBreakdown && scoreBreakdown && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  ATS Category Weighted Score Breakdown (100% Total)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(scoreBreakdown).map(([key, item]) => (
                    <div key={key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{item.name || key}</span>
                        <span className="font-mono text-cyan-400 font-bold">{item.score} / {item.max}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, (item.score / item.max) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CCS Competency Breakdown Drawer */}
            {showCcsBreakdown && ccsBreakdown && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  CCS Competency Score Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(ccsBreakdown).map(([key, item]) => (
                    <div key={key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{item.name || key}</span>
                        <span className="font-mono text-indigo-400 font-bold">{item.score} / {item.max}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, (item.score / item.max) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flaw Detection Section */}
            {flawsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FiAlertTriangle className="w-5 h-5 text-rose-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Detected Evidence-Based Flaws & Actionable Fixes ({flawsList.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flawsList.map((flaw) => (
                    <AnalysisIssueCard key={flaw.id} flaw={flaw} />
                  ))}
                </div>
              </div>
            )}

            {/* Skill Evidence Gaps Section */}
            {skillEvidenceGaps.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <FiCode className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Skill Evidence Gaps ({skillEvidenceGaps.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skillEvidenceGaps.map((gap, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <span className="font-bold text-amber-400 block">Claimed Skill: {gap.skill}</span>
                      <p className="text-slate-300">{gap.issue}</p>
                      <p className="text-cyan-300 text-[11px] bg-slate-900 p-2 rounded border border-slate-800 font-mono">
                        Fix: {gap.recommendation}
                      </p>
                    </div>
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
                  <h3 className="text-base font-bold text-white">Internship Duration Audits (3-Month Benchmark)</h3>
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

            {/* Strengths & Recommendations Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strengths.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <FiCheckCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Identified Resume Strengths</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <FiZap className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Actionable Next Steps</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
