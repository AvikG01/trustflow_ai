'use client';

import React from 'react';

export default function MinimalTemplate({ data }) {
  if (!data) return null;
  const p = data.personalInfo || {};

  return (
    <div className="bg-white text-slate-800 p-8 shadow-2xl font-sans text-xs leading-relaxed max-w-[800px] mx-auto border border-slate-200 min-h-[1050px]">
      {/* Executive Clean Header */}
      <div className="flex justify-between items-start border-b border-slate-300 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{p.fullName || 'YOUR NAME'}</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Software Engineering Professional</p>
        </div>
        <div className="text-right text-[11px] text-slate-600 space-y-0.5 font-mono">
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.linkedin && <div>{p.linkedin}</div>}
        </div>
      </div>

      {/* Summary */}
      {data.professionalSummary && (
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">PROFILE</h2>
          <p className="text-xs text-slate-700 leading-relaxed font-light">{data.professionalSummary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">EXPERIENCE</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id || Math.random()}>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-900">{exp.role}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{exp.startDate} — {exp.endDate}</span>
                </div>
                <div className="text-slate-500 text-[11px] font-medium mb-1">{exp.company}</div>
                {exp.bullets && (
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
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
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">KEY PROJECTS</h2>
          <div className="space-y-3">
            {data.projects.map((proj) => (
              <div key={proj.id || Math.random()}>
                <div className="flex justify-between text-xs font-semibold text-slate-900">
                  <span>{proj.name}</span>
                  <span className="text-[11px] font-mono font-normal text-slate-500">{proj.technologies}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">SKILLS & CAPABILITIES</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-semibold text-slate-800">Frontend & Tools:</span>{' '}
              <span className="text-slate-600">{data.skills.frontend?.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Backend & Cloud:</span>{' '}
              <span className="text-slate-600">{data.skills.backend?.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">EDUCATION</h2>
          {data.education.map((edu) => (
            <div key={edu.id || Math.random()} className="flex justify-between text-xs">
              <span className="font-medium text-slate-900">{edu.degree}, {edu.institution}</span>
              <span className="text-slate-400 font-mono text-[11px]">{edu.startDate} — {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
