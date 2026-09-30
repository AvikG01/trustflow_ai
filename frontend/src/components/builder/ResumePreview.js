'use client';

import React, { useRef } from 'react';
import { useResume } from '@/context/ResumeContext';
import { useToast } from '@/context/ToastContext';
import ResumePrintable from './ResumePrintable';
import { FiZoomIn, FiZoomOut, FiPrinter, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

export default function ResumePreview() {
  const { resumeData, zoomLevel, setZoomLevel, isSaving, lastSavedTime, saveResumeNow } = useResume();
  const { addToast } = useToast();
  const previewRef = useRef(null);

  const activeTemplate = resumeData?.template || 'TechnicalTemplate';

  const handlePrint = async () => {
    const p = resumeData?.personalInfo || {};
    const hasName = Boolean(p.fullName || p.email || p.phone);
    const hasSummary = Boolean(resumeData?.professionalSummary);
    const hasSkills = Array.isArray(resumeData?.skills?.frontend) && resumeData.skills.frontend.length > 0;
    const hasExperience = Array.isArray(resumeData?.experience) && resumeData.experience.length > 0;
    const hasProjects = Array.isArray(resumeData?.projects) && resumeData.projects.length > 0;

    if (!hasName && !hasSummary && !hasSkills && !hasExperience && !hasProjects) {
      addToast('Please save your resume before downloading.', 'error');
      return;
    }

    try {
      if (!resumeData?.id) {
        await saveResumeNow();
      }
    } catch (e) {
      // Continue print even if background save had a warning
    }

    window.print();
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Isolated Print Target for @media print */}
      <div id="resume-printable-container">
        <ResumePrintable resume={resumeData} template={activeTemplate} />
      </div>

      {/* Action Toolbar */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Autosave & Sync Indicator */}
        <div className="flex items-center space-x-2 text-xs">
          {isSaving ? (
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Autosaving changes...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synced {lastSavedTime ? `at ${lastSavedTime}` : 'just now'}</span>
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 space-x-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="text-slate-400 hover:text-white p-1"
              title="Zoom Out"
            >
              <FiZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300 font-mono text-[11px] px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="text-slate-400 hover:text-white p-1"
              title="Zoom In"
            >
              <FiZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print / Download Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border border-cyan-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>Download / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Live Preview Paper Wrapper */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-auto flex justify-center items-start shadow-inner min-h-[600px]">
        <div
          ref={previewRef}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
          className="printable-resume w-full max-w-[800px] transition-all"
        >
          <ResumePrintable resume={resumeData} template={activeTemplate} />
        </div>
      </div>
    </div>
  );
}
