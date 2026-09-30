'use client';

import React from 'react';

export default function ClassicTemplate({ data }) {
  if (!data) return null;
  const p = data.personalInfo || {};

  return (
    <div className="bg-white text-slate-900 p-8 shadow-2xl font-serif text-sm leading-normal max-w-[800px] mx-auto border border-slate-200 min-h-[1050px]">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{p.fullName || 'YOUR NAME'}</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2 font-sans">
          {p.location && <span>{p.location}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.email && <span>• {p.email}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
          {p.github && <span>• {p.github}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">{data.professionalSummary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Experience & Work History
          </h2>
          <div className="space-y-3 font-sans">
            {data.experience.map((exp) => (
              <div key={exp.id || Math.random()}>
                <div className="flex justify-between items-baseline font-semibold text-xs text-slate-900">
                  <span>
                    {exp.role} <span className="font-normal italic text-slate-700">— {exp.company}</span>
                  </span>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.bullets && Array.isArray(exp.bullets) && (
                  <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Key Software Projects
          </h2>
          <div className="space-y-3 font-sans">
            {data.projects.map((proj) => (
              <div key={proj.id || Math.random()}>
                <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                  <span>{proj.name}</span>
                  {proj.technologies && (
                    <span className="text-[11px] font-normal text-slate-600 font-mono">
                      [{proj.technologies}]
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Technical Skills
          </h2>
          <div className="text-xs text-slate-800 space-y-1">
            {data.skills.frontend && (
              <p>
                <strong className="text-slate-900">Frontend:</strong> {data.skills.frontend.join(', ')}
              </p>
            )}
            {data.skills.backend && (
              <p>
                <strong className="text-slate-900">Backend & Database:</strong> {data.skills.backend.join(', ')}
              </p>
            )}
            {data.skills.tools && (
              <p>
                <strong className="text-slate-900">Tools & Infrastructure:</strong> {data.skills.tools.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id || Math.random()} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-700">, {edu.institution}</span>
                </div>
                <span className="text-[11px] text-slate-600 font-mono">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
