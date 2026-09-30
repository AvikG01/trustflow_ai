'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import { FiCheck, FiLayout } from 'react-icons/fi';

export default function TemplateSelector() {
  const { resumeData, updateTemplate } = useResume();
  const activeTemplate = resumeData?.template || 'TechnicalTemplate';

  const templates = [
    {
      id: 'ClassicTemplate',
      name: 'Professional Classic',
      tagline: 'Standard Serif format favoured by Fortune 500 recruiters',
      accent: 'border-slate-400',
    },
    {
      id: 'TechnicalTemplate',
      name: 'Modern Technical',
      tagline: 'High-impact design highlighted for IT & Engineering roles',
      accent: 'border-cyan-500',
    },
    {
      id: 'MinimalTemplate',
      name: 'Executive Minimal',
      tagline: 'Clean, typography-driven structure for modern tech roles',
      accent: 'border-indigo-400',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center space-x-2 mb-3">
        <FiLayout className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          ATS Compatible Template Selector
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((tpl) => {
          const isSelected = activeTemplate === tpl.id;

          return (
            <button
              key={tpl.id}
              onClick={() => updateTemplate(tpl.id)}
              className={`text-left p-3 rounded-xl border transition-all relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {tpl.name}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                      <FiCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{tpl.tagline}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>ATS Pass Rate: 98%</span>
                <span className="text-cyan-400 font-bold">Select</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
