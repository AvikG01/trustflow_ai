'use client';

import React from 'react';

export default function TechnicalTemplate({ data }) {
  if (!data) return null;
  const p = data.personalInfo || {};

  return (
    <div className="bg-white text-slate-900 p-8 shadow-2xl font-sans text-xs leading-relaxed max-w-[800px] mx-auto border border-slate-200 min-h-[1050px]">
      {/* Header Accent */}
      <div className="border-l-4 border-cyan-600 pl-4 py-1 mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{p.fullName || 'YOUR NAME'}</h1>
        <p className="text-xs font-medium text-cyan-700 tracking-wide uppercase mt-0.5">
          Software Engineer / Fullstack Developer
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-2 font-mono">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.github && <span className="text-cyan-700">{p.github}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.professionalSummary && (
        <div className="mb-5 bg-slate-50 p-3 rounded border-l-2 border-slate-400">
          <p className="text-xs text-slate-700 leading-relaxed">{data.professionalSummary}</p>
        </div>
      )}

      {/* Technical Skills Highlight Box */}
      {data.skills && (
        <div className="mb-5 bg-cyan-50/50 p-3.5 rounded-lg border border-cyan-200/60">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-900 mb-2 flex items-center space-x-1">
            <span>CORE TECHNICAL STACK</span>
          </h2>
          <div className="space-y-1 text-xs">
            {data.skills.frontend && (
              <p>
                <strong className="text-slate-900 font-mono">Frontend Engine:</strong> {data.skills.frontend.join(' • ')}
              </p>
            )}
            {data.skills.backend && (
              <p>
                <strong className="text-slate-900 font-mono">Backend Architecture:</strong> {data.skills.backend.join(' • ')}
              </p>
            )}
            {data.skills.tools && (
              <p>
                <strong className="text-slate-900 font-mono">DevOps & Cloud:</strong> {data.skills.tools.join(' • ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">
            TECHNICAL EXPERIENCE
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id || Math.random()}>
                <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                  <span>
                    {exp.role} <span className="font-normal text-cyan-700">@ {exp.company}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{exp.startDate} – {exp.endDate}</span>
                </div>
                {exp.bullets && (
                  <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">
            ENGINEERING PROJECTS
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj) => (
              <div key={proj.id || Math.random()}>
                <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                  <span>{proj.name}</span>
                  {proj.technologies && (
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {proj.technologies}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">
            EDUCATION
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id || Math.random()} className="flex justify-between items-baseline text-xs">
              <div>
                <span className="font-bold text-slate-900">{edu.degree}</span>
                <span className="text-slate-600"> — {edu.institution}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
