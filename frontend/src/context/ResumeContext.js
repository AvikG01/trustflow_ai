'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from './ToastContext';

const ResumeContext = createContext(null);

export const EMPTY_RESUME = {
  id: '',
  title: '',
  template: 'TechnicalTemplate',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  professionalSummary: '',
  careerObjective: '',
  education: [],
  skills: { frontend: [], backend: [], tools: [] },
  experience: [],
  projects: [],
  certifications: [],
  internships: [],
  achievements: [],
  publications: [],
  languages: [],
  links: [],
  additionalInfo: '',
};

export const PREDEFINED_TEST_RESUME = {
  id: 'test-candidate-101',
  title: 'Senior Full Stack Software Engineer',
  template: 'TechnicalTemplate',
  personalInfo: {
    fullName: 'Test Candidate',
    email: 'test.candidate@trustflow.ai',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/testcandidate-tf',
    github: 'https://github.com/testcandidate-tf',
    portfolio: 'https://testcandidate.dev',
  },
  professionalSummary:
    'Results-driven Senior Full Stack Engineer with 6+ years of experience designing and deploying high-concurrency microservices, AI-assisted candidate evaluation systems, and enterprise cloud infrastructure. Expert in Node.js, Express, React, Next.js, and SQL optimizations.',
  careerObjective: 'To scale production AI applications and microservices architectures in high-growth environments.',
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University of Technology',
      location: 'San Francisco, CA',
      startDate: '2016-08',
      endDate: '2020-05',
      gpa: '3.85 / 4.0',
    },
  ],
  skills: {
    frontend: ['React.js', 'Next.js 16', 'Tailwind CSS', 'JavaScript (ES6+)', 'HTML5/CSS3'],
    backend: ['Node.js', 'Express.js', 'MySQL', 'REST APIs', 'JWT Auth', 'Redis'],
    tools: ['Git', 'Docker', 'AWS', 'Google Gemini API', 'Linux', 'Jest'],
  },
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Full Stack Engineer',
      company: 'CloudCorp Technologies',
      location: 'San Francisco, CA',
      startDate: '2022-06',
      endDate: 'Present',
      description:
        'Architected high-concurrency API dispatch systems handling 50,000+ daily operational requests. Reduced database query latency by 42% through MySQL index optimization and connection pooling.',
    },
    {
      id: 'exp-2',
      role: 'Software Engineer',
      company: 'WebTech Solutions',
      location: 'San Jose, CA',
      startDate: '2020-06',
      endDate: '2022-05',
      description:
        'Developed interactive React frontend dashboards and Express microservices. Implemented role-based access control (RBAC) and JWT security for enterprise SaaS platforms.',
    },
  ],
  internships: [
    {
      id: 'intern-1',
      role: 'Full Stack Engineer Intern',
      company: 'TechStart Innovations',
      location: 'Palo Alto, CA',
      duration_months: 4,
      startDate: '2019-05',
      endDate: '2019-09',
      description:
        'Built automated unit test suites and integrated third-party REST webhooks during a 4-month intensive internship program.',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'TrustFlow AI Career Platform',
      techStack: 'Next.js 16, Node.js, Express, MySQL, Gemini API',
      description:
        'Engineered an AI-powered resume intelligence platform featuring structured ATS/CCS analysis, job discovery, and dynamic bullet optimization.',
    },
    {
      id: 'proj-2',
      title: 'E-Commerce Microservices Engine',
      techStack: 'Node.js, Express, Redis, MySQL, Docker',
      description:
        'Built order processing microservices with distributed locking and queue management handling 10,000 requests per minute.',
    },
    {
      id: 'proj-3',
      title: 'Real-Time Analytics Dashboard',
      techStack: 'React, Tailwind CSS, TanStack Query, Express',
      description:
        'Created a real-time system monitoring dashboard visualizing cluster metrics and API throughput analytics.',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-03',
      credentialId: 'AWS-ASA-994821',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: '1st Place Winner - Annual Tech Hackathon 2022',
      description: 'Awarded 1st place among 45 teams for building an AI automated documentation generator.',
    },
  ],
  languages: ['English (Native/Bilingual)', 'Spanish (Intermediate)'],
  links: [
    { id: 'link-1', label: 'GitHub', url: 'https://github.com/testcandidate-tf' },
    { id: 'link-2', label: 'LinkedIn', url: 'https://linkedin.com/in/testcandidate-tf' },
  ],
  additionalInfo: 'Open to remote and hybrid opportunities in software architecture and AI engineering.',
};

export function ResumeProvider({ children }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [resumeData, setResumeData] = useState(EMPTY_RESUME);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const { addToast } = useToast();
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const triggerAutosave = useCallback((newData) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await apiRequest({
          action: 'update_resume',
          data: { resume: newData },
        });
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Autosave sync warning:', err.message);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  }, []);

  const updateResumeField = useCallback((path, value) => {
    setResumeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || EMPTY_RESUME));
      const keys = path.split('.');
      let current = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      triggerAutosave(copy);
      return copy;
    });
  }, [triggerAutosave]);

  const updateTemplate = useCallback((templateName) => {
    setResumeData((prev) => {
      const updated = { ...prev, template: templateName };
      triggerAutosave(updated);
      return updated;
    });
    addToast(`Switched template to ${templateName.replace('Template', '')}`, 'info');
  }, [addToast, triggerAutosave]);

  const addItemToSection = useCallback((sectionName, newItem) => {
    setResumeData((prev) => {
      const copy = { ...prev };
      if (!Array.isArray(copy[sectionName])) {
        copy[sectionName] = [];
      }
      copy[sectionName] = [...copy[sectionName], { id: Date.now().toString(), ...newItem }];
      triggerAutosave(copy);
      return copy;
    });
  }, [triggerAutosave]);

  const removeItemFromSection = useCallback((sectionName, id) => {
    setResumeData((prev) => {
      const copy = { ...prev };
      if (Array.isArray(copy[sectionName])) {
        copy[sectionName] = copy[sectionName].filter((item) => item.id !== id);
      }
      triggerAutosave(copy);
      return copy;
    });
  }, [triggerAutosave]);

  const loadResumeData = useCallback((data) => {
    if (data) {
      setResumeData(data);
      addToast('Resume loaded into editor', 'success');
    }
  }, [addToast]);

  const loadTestResume = useCallback(() => {
    setResumeData(PREDEFINED_TEST_RESUME);
    triggerAutosave(PREDEFINED_TEST_RESUME);
    addToast('Synthetic test candidate resume loaded into editor', 'info');
  }, [addToast, triggerAutosave]);

  const resetResumeState = useCallback(() => {
    setResumes([]);
    setSelectedResume(null);
    setCurrentResume(null);
    setAnalysis(null);
    setResumeData(EMPTY_RESUME);
    setLastSavedTime(null);
    setIsSaving(false);
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        selectedResume,
        currentResume,
        analysis,
        resumeData,
        zoomLevel,
        isSaving,
        lastSavedTime,
        setZoomLevel,
        updateResumeField,
        updateTemplate,
        addItemToSection,
        removeItemFromSection,
        loadResumeData,
        loadTestResume,
        setResumeData,
        setResumes,
        setSelectedResume,
        setCurrentResume,
        setAnalysis,
        resetResumeState,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
}
