'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { FiCopy, FiCheck, FiRefreshCw, FiEdit3, FiSave, FiMail } from 'react-icons/fi';

export default function EmailOutputCard({ emailData, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(emailData?.subject || '');
  const [body, setBody] = useState(emailData?.body || '');
  const { addToast } = useToast();

  if (!emailData) return null;

  const handleCopy = () => {
    const textToCopy = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast('Email copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <FiMail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Generated Job Application Email</h3>
            <p className="text-xs text-slate-400">Professional Recruiter Pitch</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            {isEditing ? <FiSave className="w-3.5 h-3.5 text-emerald-400" /> : <FiEdit3 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isEditing ? 'Done Editing' : 'Edit'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
          >
            {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Email Subject Line</label>
        {isEditing ? (
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        ) : (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-medium text-white font-mono">
            {subject}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Email Body</label>
        {isEditing ? (
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white leading-relaxed focus:border-cyan-500 focus:outline-none"
          />
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {body}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-2 flex justify-between items-center text-xs">
        <button
          onClick={onRegenerate}
          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1.5"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate Variant</span>
        </button>
        <span className="text-slate-400 font-mono text-[11px]">Ready to send via Gmail / Outlook</span>
      </div>
    </div>
  );
}
