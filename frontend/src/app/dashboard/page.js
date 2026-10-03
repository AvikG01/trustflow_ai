'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useResume } from '@/context/ResumeContext';
import { useAtsAuth } from '@/context/AtsAuthContext';
import UsageLimitCard from '@/components/dashboard/UsageLimitCard';
import ProgressRing from '@/components/dashboard/ProgressRing';
import InfographicCard from '@/components/dashboard/InfographicCard';
import LoadingState from '@/components/ui/LoadingState';
import { apiRequest, downloadResumeFileBlob } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  FiFileText,
  FiPieChart,
  FiBriefcase,
  FiZap,
  FiMail,
  FiPlus,
  FiShield,
  FiArrowRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlusCircle,
  FiUpload,
  FiDownload,
  FiRefreshCw,
  FiClock,
} from 'react-icons/fi';

export default function UserDashboard() {
  const router = useRouter();
  const { user, limits, loading: authLoading } = useAuth();
  const { resumeData, resumes, analysis } = useResume();
  const { isAtsAuthorized, openAuthModal } = useAtsAuth();
  const { addToast } = useToast();

  const [savedFiles, setSavedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchSavedFiles();
    }
  }, [user]);

  const fetchSavedFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await apiRequest({ action: 'get_drive_files' });
      const filesList = Array.isArray(res?.files) ? res.files : [];
      setSavedFiles(filesList.filter((f) => f.file_type === 'RESUME'));
    } catch (err) {
      console.error('Failed to load saved files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDownloadSavedFile = async (file) => {
    if (downloadingFileId) return;
    setDownloadingFileId(file.id);
    try {
      addToast('Downloading saved PDF resume file...', 'info');
      await downloadResumeFileBlob({
        file_id: file.id,
        resume_id: file.resume_id,
        customFilename: file.file_name || 'Resume.pdf',
      });
      addToast('Resume PDF downloaded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to download stored resume file', 'error');
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (authLoading || !user) {
    return <LoadingState message="Loading your account dashboard..." />;
  }

  const hasAnalysis = analysis && typeof analysis.atsScore === 'number';
  const atsScore = hasAnalysis ? analysis.atsScore : null;
  const ccsScore = hasAnalysis ? analysis.ccsScore : null;

  const hasResume = Boolean(resumeData?.title || (resumes && resumes.length > 0));

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
                User Dashboard
              </span>
              <span className="text-xs text-slate-400">• Account Status Active</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || 'User'}!
            </h1>
          <p className="text-xs text-slate-400">
            Engineered resume optimization platform for IT candidates
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/builder"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Resume Draft</span>
          </Link>

          <Link
            href="/upload"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <FiFileText className="w-4 h-4 text-cyan-400" />
            <span>Import PDF</span>
          </Link>
        </div>
      </div>

      {/* Grid Row 1: Scores & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Health Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Current Resume Health</h3>
              <p className="text-xs text-slate-400">
                {hasResume ? (resumeData?.title || 'Active Resume') : 'No resume created'}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${
                hasAnalysis
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                  : 'text-slate-400 bg-slate-950 border-slate-800'
              }`}
            >
              {hasAnalysis ? 'Analyzed' : 'Not Analyzed'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2 text-center">
              <ProgressRing score={atsScore} label="ATS Score" size={110} />
              <p className="text-[11px] text-slate-400">
                {atsScore !== null ? 'Keyword & Parser Score' : 'No Analysis Available'}
              </p>
            </div>
            <div className="space-y-2 text-center">
              <ProgressRing score={ccsScore} label="CCS Score" size={110} />
              <p className="text-[11px] text-slate-400">
                {ccsScore !== null ? 'Competency Signals' : 'No Analysis Available'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Analysis Status: {hasAnalysis ? 'Available' : 'Not Analyzed'}
            </span>
            <Link
              href="/analysis"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>{hasAnalysis ? 'View Flaw Report' : 'Analyze Resume'}</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Usage & Plan Counter Card */}
        <UsageLimitCard />

        {/* Recommended Actions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Recommended Actionable Steps
          </h3>
          <div className="space-y-3 text-xs">
            {!hasResume && (
              <>
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-start space-x-2.5">
                  <FiPlusCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-200 block">Create your first resume</strong>
                    <span className="text-slate-300">Build an ATS-structured resume using engineered templates.</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex items-start space-x-2.5">
                  <FiUpload className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-200 block">Import an existing resume</strong>
                    <span className="text-slate-300">Upload your PDF/DOC resume for instant parsing.</span>
                  </div>
                </div>
              </>
            )}

            {hasResume && !hasAnalysis && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start space-x-2.5">
                <FiPieChart className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 block">Analyze your resume after authorization</strong>
                  <span className="text-slate-300">Execute ATS & CCS flaw detection algorithms.</span>
                </div>
              </div>
            )}

            {hasAnalysis && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start space-x-2.5">
                <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-200 block">Optimize for Specific Jobs</strong>
                  <span className="text-slate-300">Tailor summary and skills to your target JD.</span>
                </div>
              </div>
            )}

            <Link
              href="/jobs"
              className="block text-center w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 font-bold rounded-xl border border-slate-800 transition-colors"
            >
              Search Compatible IT Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Resumes & Persistent PDF Files Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-cyan-400" />
              <span>Saved Resumes & PDF Downloads</span>
            </h3>
            <p className="text-xs text-slate-400">
              Persistent A4 PDF files stored in your account database. Re-download your resume files anytime.
            </p>
          </div>
          <button
            onClick={fetchSavedFiles}
            disabled={loadingFiles}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            title="Refresh Files List"
          >
            <FiRefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {loadingFiles ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Loading saved resume files...
          </div>
        ) : savedFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 flex flex-col justify-between transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      PDF Version {file.version || 1}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                      <FiClock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight truncate pt-1" title={file.file_name}>
                    {file.file_name || 'Resume.pdf'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    Ref: {file.reference_code || file.id.substring(0, 8)}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">PDF Document</span>
                  <button
                    onClick={() => handleDownloadSavedFile(file)}
                    disabled={downloadingFileId === file.id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow transition-all disabled:opacity-50"
                  >
                    {downloadingFileId === file.id ? (
                      <>
                        <FiRefreshCw className="w-3 h-3 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-3 h-3" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">No saved PDF documents found in your account storage.</p>
            <p className="text-[11px] text-slate-400">
              Create a resume in the builder and click "Download Resume PDF" to generate and persist your first A4 file.
            </p>
          </div>
        )}
      </div>

      {/* Recent Resumes & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Recent Resume Drafts</h3>
            <Link href="/builder" className="text-xs text-cyan-400 hover:underline">
              Open Builder
            </Link>
          </div>

          <div className="space-y-3">
            {hasResume ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {resumeData?.title || 'Active Resume Draft'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Template: {resumeData?.template ? resumeData.template.replace('Template', '') : 'Technical'}
                  </p>
                </div>
                <Link
                  href="/builder"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold rounded-lg"
                >
                  Edit
                </Link>
              </div>
            ) : (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-400">No resumes created yet</p>
                <Link
                  href="/builder"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Create Resume</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">AI Tools Shortcut</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/optimize"
              className="p-4 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 space-y-2 block transition-colors group"
            >
              <FiZap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white">Job Optimization</div>
              <div className="text-[11px] text-slate-400">Tailor bullets to JD</div>
            </Link>

            <Link
              href="/emails"
              className="p-4 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 space-y-2 block transition-colors group"
            >
              <FiMail className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white">AI Email Generator</div>
              <div className="text-[11px] text-slate-400">Generate HR cold emails</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}
