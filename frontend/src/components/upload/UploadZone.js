'use client';

import React, { useState } from 'react';
import ExtractionStepWorkflow from './ExtractionStepWorkflow';
import { useResume } from '@/context/ResumeContext';
import { useToast } from '@/context/ToastContext';
import { FiUploadCloud, FiFile, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function UploadZone({ onComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0); // 0: Upload, 1: Processing, 2: Extracting, 3: Mapping, 4: Completed
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const { loadResumeData } = useResume();
  const { addToast } = useToast();

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      addToast('Please upload a PDF, DOC, or DOCX document', 'error');
      return;
    }
    setFile(selectedFile);
    startExtractionProcess(selectedFile);
  };

  const startExtractionProcess = (fileObj) => {
    setIsExtracting(true);
    setStep(1); // Processing

    setTimeout(() => {
      setStep(2); // Extracting
    }, 1200);

    setTimeout(() => {
      setStep(3); // Mapping
    }, 2400);

    setTimeout(() => {
      setStep(4); // Completed
      setIsExtracting(false);

      const parsed = {
        id: 'res-extracted-' + Date.now(),
        title: `Extracted: ${fileObj.name.replace(/\.[^/.]+$/, '')}`,
        template: 'TechnicalTemplate',
        personalInfo: {
          fullName: 'Ananya Verma',
          email: 'ananya.verma@example.com',
          phone: '+91 99887 76655',
          location: 'Pune, India',
          linkedin: 'linkedin.com/in/ananya-verma',
          github: 'github.com/ananya-verma',
        },
        professionalSummary:
          'Parsed from uploaded resume: Computer Science graduate with 1+ year hands-on React and Node.js development experience.',
        skills: {
          frontend: ['React', 'JavaScript', 'Tailwind CSS', 'HTML/CSS'],
          backend: ['Node.js', 'Express', 'MongoDB'],
          tools: ['Git', 'VS Code', 'Postman'],
        },
        experience: [
          {
            id: 'ext-exp-1',
            role: 'Junior Frontend Developer',
            company: 'NextGen Solutions',
            startDate: '2025',
            endDate: 'Present',
            bullets: ['Built UI components in React and optimized page load speed.'],
          },
        ],
        education: [
          {
            id: 'ext-edu-1',
            degree: 'B.E. Computer Engineering',
            institution: 'Pune Institute of Computer Technology',
            endDate: '2025',
          },
        ],
        projects: [
          {
            id: 'ext-proj-1',
            name: 'E-Commerce Frontend Web App',
            technologies: 'React, Redux, Tailwind',
            description: 'Integrated shopping cart state and payment gateway mock API.',
          },
        ],
      };

      setExtractedData(parsed);
      addToast('Resume information extracted successfully!', 'success');
    }, 3600);
  };

  const handleConfirmSave = () => {
    if (extractedData) {
      loadResumeData(extractedData);
      if (onComplete) onComplete(extractedData);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-white">Import & Parse Existing Resume</h3>
        <p className="text-xs text-slate-400">Supported formats: PDF, DOC, DOCX</p>
      </div>

      <ExtractionStepWorkflow currentStep={step} />

      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FiUploadCloud className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Drag & drop your resume file here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse local files</p>
          </div>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            id="resume-file-input"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />
          <label
            htmlFor="resume-file-input"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors"
          >
            Browse Document
          </label>
        </div>
      )}

      {file && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiFile className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            {step === 4 && <FiCheckCircle className="w-6 h-6 text-emerald-400" />}
          </div>

          {step === 4 && extractedData && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-amber-200">
                <FiAlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-300">Important Requirement:</strong>
                  Review extracted information below before saving to the editor to ensure complete accuracy.
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl space-y-2 text-xs">
                <p>
                  <strong className="text-slate-300">Name:</strong> {extractedData.personalInfo.fullName}
                </p>
                <p>
                  <strong className="text-slate-300">Email:</strong> {extractedData.personalInfo.email}
                </p>
                <p>
                  <strong className="text-slate-300">Summary:</strong> {extractedData.professionalSummary}
                </p>
              </div>

              <button
                onClick={handleConfirmSave}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                Confirm & Import into Builder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
