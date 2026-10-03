'use client';

import React, { useRef, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { useToast } from '@/context/ToastContext';
import ResumePrintable from './ResumePrintable';
import { FiZoomIn, FiZoomOut, FiPrinter, FiDownload, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

export default function ResumePreview() {
  const { resumeData, zoomLevel, setZoomLevel, isSaving, lastSavedTime, saveResumeNow, downloadResumePDF } = useResume();
  const { addToast } = useToast();
  const previewRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeTemplate = resumeData?.template || 'TechnicalTemplate';

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadResumePDF(activeTemplate);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
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

          {/* Optional Print Preview */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
            title="Open Browser Print Dialogue"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Primary Download PDF Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border border-cyan-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FiDownload className="w-3.5 h-3.5" />
                <span>Download Resume PDF</span>
              </>
            )}
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
