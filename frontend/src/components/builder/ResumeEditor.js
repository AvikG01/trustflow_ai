'use client';

import React, { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import {
  FiUser,
  FiFileText,
  FiTarget,
  FiBook,
  FiCode,
  FiFolder,
  FiAward,
  FiBriefcase,
  FiGlobe,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

export default function ResumeEditor() {
  const { resumeData, updateResumeField, addItemToSection, removeItemFromSection, loadTestResume } = useResume();
  const [openAccordion, setOpenAccordion] = useState('personal');

  const toggleSection = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const p = resumeData.personalInfo || {};

  return (
    <div className="space-y-4 text-slate-100 pb-12">
      {/* Test Data Quick Fill Helper */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
        <span className="text-slate-400 font-mono text-[11px]">QA Test Preset</span>
        <button
          type="button"
          onClick={loadTestResume}
          className="text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-colors text-[11px]"
        >
          Fill Test Candidate Data
        </button>
      </div>
      {/* 1. Personal Details Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left font-semibold text-sm transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <FiUser className="w-4 h-4" />
            <span className="text-white">Personal Information</span>
          </div>
          {openAccordion === 'personal' ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openAccordion === 'personal' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={p.fullName || ''}
                  onChange={(e) => updateResumeField('personalInfo.fullName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={p.email || ''}
                  onChange={(e) => updateResumeField('personalInfo.email', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="jane.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={p.phone || ''}
                  onChange={(e) => updateResumeField('personalInfo.phone', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Location / City</label>
                <input
                  type="text"
                  value={p.location || ''}
                  onChange={(e) => updateResumeField('personalInfo.location', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Bangalore, India"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">GitHub Profile</label>
                <input
                  type="text"
                  value={p.github || ''}
                  onChange={(e) => updateResumeField('personalInfo.github', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="github.com/username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={p.linkedin || ''}
                  onChange={(e) => updateResumeField('personalInfo.linkedin', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Professional Summary Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left font-semibold text-sm transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <FiFileText className="w-4 h-4" />
            <span className="text-white">Professional Summary</span>
          </div>
          {openAccordion === 'summary' ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openAccordion === 'summary' && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <textarea
              rows={4}
              value={resumeData.professionalSummary || ''}
              onChange={(e) => updateResumeField('professionalSummary', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:border-cyan-500 focus:outline-none leading-relaxed"
              placeholder="Write a concise overview highlighting your core engineering skills, project impact, and career trajectory..."
            />
          </div>
        )}
      </div>

      {/* 3. Technical Skills Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left font-semibold text-sm transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <FiCode className="w-4 h-4" />
            <span className="text-white">Technical Skills</span>
          </div>
          {openAccordion === 'skills' ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openAccordion === 'skills' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Frontend Technologies (Comma Separated)
              </label>
              <input
                type="text"
                value={resumeData.skills?.frontend?.join(', ') || ''}
                onChange={(e) =>
                  updateResumeField(
                    'skills.frontend',
                    e.target.value.split(',').map((s) => s.trim())
                  )
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Next.js, React, Tailwind CSS, JavaScript"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Backend & Database (Comma Separated)
              </label>
              <input
                type="text"
                value={resumeData.skills?.backend?.join(', ') || ''}
                onChange={(e) =>
                  updateResumeField(
                    'skills.backend',
                    e.target.value.split(',').map((s) => s.trim())
                  )
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Node.js, Express, PostgreSQL, REST APIs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Tools & Cloud Infrastructure (Comma Separated)
              </label>
              <input
                type="text"
                value={resumeData.skills?.tools?.join(', ') || ''}
                onChange={(e) =>
                  updateResumeField(
                    'skills.tools',
                    e.target.value.split(',').map((s) => s.trim())
                  )
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Git, Docker, AWS, Vercel, Postman"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Experience Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left font-semibold text-sm transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <FiBriefcase className="w-4 h-4" />
            <span className="text-white">Work Experience</span>
          </div>
          {openAccordion === 'experience' ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openAccordion === 'experience' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/60">
            {resumeData.experience?.map((exp, idx) => (
              <div key={exp.id || idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400">Experience #{idx + 1}</span>
                  <button
                    onClick={() => removeItemFromSection('experience', exp.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Role Title (e.g. Software Engineer Intern)"
                    value={exp.role || ''}
                    onChange={(e) => {
                      const list = [...resumeData.experience];
                      list[idx].role = e.target.value;
                      updateResumeField('experience', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const list = [...resumeData.experience];
                      list[idx].company = e.target.value;
                      updateResumeField('experience', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Start Date (e.g. May 2025)"
                    value={exp.startDate || ''}
                    onChange={(e) => {
                      const list = [...resumeData.experience];
                      list[idx].startDate = e.target.value;
                      updateResumeField('experience', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="End Date (e.g. Aug 2025)"
                    value={exp.endDate || ''}
                    onChange={(e) => {
                      const list = [...resumeData.experience];
                      list[idx].endDate = e.target.value;
                      updateResumeField('experience', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                addItemToSection('experience', {
                  role: '',
                  company: '',
                  startDate: '',
                  endDate: '',
                  bullets: ['Architected scalable API endpoints reducing latency by 25%'],
                })
              }
              className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Experience Position</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Projects Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('projects')}
          className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left font-semibold text-sm transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <FiFolder className="w-4 h-4" />
            <span className="text-white">Software Projects</span>
          </div>
          {openAccordion === 'projects' ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openAccordion === 'projects' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/60">
            {resumeData.projects?.map((proj, idx) => (
              <div key={proj.id || idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400">Project #{idx + 1}</span>
                  <button
                    onClick={() => removeItemFromSection('projects', proj.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={proj.name || ''}
                    onChange={(e) => {
                      const list = [...resumeData.projects];
                      list[idx].name = e.target.value;
                      updateResumeField('projects', list);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Technologies Used (e.g. Next.js, Node.js)"
                    value={proj.technologies || ''}
                    onChange={(e) => {
                      const list = [...resumeData.projects];
                      list[idx].technologies = e.target.value;
                      updateResumeField('projects', list);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Key description & quantifiable achievements"
                    value={proj.description || ''}
                    onChange={(e) => {
                      const list = [...resumeData.projects];
                      list[idx].description = e.target.value;
                      updateResumeField('projects', list);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                addItemToSection('projects', {
                  name: '',
                  technologies: '',
                  description: '',
                })
              }
              className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Software Project</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Education Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => toggleSection('education')}
          className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left font-semibold text-sm transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <FiBook className="w-4 h-4" />
            <span className="text-white">Education</span>
          </div>
          {openAccordion === 'education' ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openAccordion === 'education' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/60">
            {resumeData.education?.map((edu, idx) => (
              <div key={edu.id || idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400">Education #{idx + 1}</span>
                  <button
                    onClick={() => removeItemFromSection('education', edu.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.Tech Computer Science)"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const list = [...resumeData.education];
                      list[idx].degree = e.target.value;
                      updateResumeField('education', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Institution Name"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const list = [...resumeData.education];
                      list[idx].institution = e.target.value;
                      updateResumeField('education', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Graduation Year (e.g. 2026)"
                    value={edu.endDate || ''}
                    onChange={(e) => {
                      const list = [...resumeData.education];
                      list[idx].endDate = e.target.value;
                      updateResumeField('education', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="GPA / Score"
                    value={edu.gpa || ''}
                    onChange={(e) => {
                      const list = [...resumeData.education];
                      list[idx].gpa = e.target.value;
                      updateResumeField('education', list);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                addItemToSection('education', {
                  degree: '',
                  institution: '',
                  startDate: '',
                  endDate: '',
                  gpa: '',
                })
              }
              className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Education Degree</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
