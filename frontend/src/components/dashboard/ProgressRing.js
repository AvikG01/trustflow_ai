'use client';

import React from 'react';

export default function ProgressRing({
  score = 0,
  size = 120,
  strokeWidth = 10,
  label = 'Score',
  color = 'cyan',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClasses = {
    stroke: 'stroke-cyan-500',
    text: 'text-cyan-400',
    bg: 'stroke-cyan-950/40',
  };

  if (score >= 75) {
    colorClasses = {
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-400',
      bg: 'stroke-emerald-950/40',
    };
  } else if (score >= 55) {
    colorClasses = {
      stroke: 'stroke-amber-500',
      text: 'text-amber-400',
      bg: 'stroke-amber-950/40',
    };
  } else {
    colorClasses = {
      stroke: 'stroke-rose-500',
      text: 'text-rose-400',
      bg: 'stroke-rose-950/40',
    };
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={`fill-none ${colorClasses.bg}`}
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`fill-none ${colorClasses.stroke} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-extrabold tracking-tight ${colorClasses.text}`}>
            {score}%
          </span>
          {label && <span className="text-[10px] uppercase font-semibold text-slate-400">{label}</span>}
        </div>
      </div>
    </div>
  );
}
