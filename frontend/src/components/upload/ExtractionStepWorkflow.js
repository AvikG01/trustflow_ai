'use client';

import React from 'react';
import { FiUploadCloud, FiCpu, FiFileText, FiCheckCircle } from 'react-icons/fi';

export default function ExtractionStepWorkflow({ currentStep = 0 }) {
  const steps = [
    { label: 'Upload', icon: FiUploadCloud },
    { label: 'Processing', icon: FiCpu },
    { label: 'Extracting', icon: FiFileText },
    { label: 'Mapping', icon: FiCpu },
    { label: 'Completed', icon: FiCheckCircle },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30'
                    : isCurrent
                    ? 'bg-slate-900 border-cyan-400 text-cyan-400 ring-4 ring-cyan-500/20 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${
                  isCurrent || isCompleted ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
