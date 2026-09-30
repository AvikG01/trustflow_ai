'use client';

import React from 'react';
import { FiExternalLink, FiCheckCircle, FiXCircle, FiZap, FiSlash } from 'react-icons/fi';

export default function JobCard({ job, onOptimize }) {
  if (!job) return null;

  const company = job.company_name || job.company || 'Company';
  const location = job.location || 'Location Not Specified';
  const source = job.source || 'Portal';
  const jobUrl = job.job_url || job.url;
  const matchScore = job.match_score ?? job.matchPercentage ?? 0;
  const matchingSkills = job.matching_skills || job.matchingSkills || [];
  const missingSkills = job.missing_skills || job.missingSkills || [];
  const experience = job.experience || 'Not specified';
  const description = job.description || 'No description available.';

  const matchColor =
    matchScore >= 75
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
      : matchScore >= 55
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
      : 'text-rose-400 bg-rose-950/60 border-rose-500/30';

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
              Source: {source}
            </span>
            <span className="text-xs text-slate-400">• {experience}</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">{job.title}</h3>
          <p className="text-xs text-slate-300 font-medium">
            {company} — <span className="text-slate-400">{location}</span>
          </p>
        </div>

        {matchScore > 0 && (
          <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 shrink-0 ${matchColor}`}>
            <FiZap className="w-4 h-4" />
            <span>{matchScore}% Compatibility</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>

      {/* Match Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Matching Skills ({matchingSkills.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {matchingSkills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center space-x-1 text-[10px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                <FiCheckCircle className="w-3 h-3 text-emerald-400" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
            Missing Skills ({missingSkills.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {missingSkills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center space-x-1 text-[10px] font-medium text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded">
                <FiXCircle className="w-3 h-3 text-rose-400" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onOptimize && onOptimize(job)}
          className="flex items-center space-x-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-2 rounded-xl transition-all"
        >
          <FiZap className="w-3.5 h-3.5" />
          <span>Optimize Resume for this Job</span>
        </button>

        {jobUrl ? (
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-colors"
          >
            <span>Apply on {source}</span>
            <FiExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        ) : (
          <button
            disabled
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl cursor-not-allowed opacity-70"
          >
            <FiSlash className="w-3 h-3 text-slate-500" />
            <span>Application link unavailable</span>
          </button>
        )}
      </div>
    </div>
  );
}
