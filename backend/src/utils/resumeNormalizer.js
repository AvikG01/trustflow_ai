/**
 * TrustFlow AI - Resume Content Normalization Utility
 * Normalizes resume data from MySQL DB records, JSON strings, or frontend state objects
 * into a single canonical resume object.
 */

function normalizeResume(input) {
  if (!input) return getEmptyCanonicalResume();

  let data = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch (e) {
      data = {};
    }
  }

  const id = data.id || data.resume_id || '';
  const userId = data.userId || data.user_id || '';
  const title = data.title || 'Untitled Resume';
  const template = data.template || data.template_id || 'TechnicalTemplate';
  const target_role = data.target_role || data.targetRole || '';
  const createdAt = data.createdAt || data.created_at || new Date().toISOString();
  const updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();

  // Extract sections if stored as array in DB record
  const sectionsArr = Array.isArray(data.sections) ? data.sections : [];

  const getSectionContent = (type) => {
    const sec = sectionsArr.find((s) => s.section_type === type);
    if (!sec) return null;
    let content = sec.content_json;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        content = null;
      }
    }
    return content;
  };

  // Personal Info
  const personalFromSec = getSectionContent('personalInfo') || getSectionContent('personal');
  const personalInfo = {
    fullName: data.personalInfo?.fullName || personalFromSec?.fullName || data.fullName || '',
    email: data.personalInfo?.email || personalFromSec?.email || data.email || '',
    phone: data.personalInfo?.phone || personalFromSec?.phone || data.phone || '',
    location: data.personalInfo?.location || personalFromSec?.location || data.location || '',
    linkedin: data.personalInfo?.linkedin || personalFromSec?.linkedin || data.linkedin || '',
    github: data.personalInfo?.github || personalFromSec?.github || data.github || '',
    portfolio: data.personalInfo?.portfolio || personalFromSec?.portfolio || data.portfolio || '',
  };

  // Summary
  const summarySec = getSectionContent('summary');
  const professionalSummary =
    data.professionalSummary ||
    data.summary ||
    summarySec?.professionalSummary ||
    summarySec?.summary ||
    (typeof summarySec === 'string' ? summarySec : '');

  const careerObjective =
    data.careerObjective || summarySec?.careerObjective || '';

  // Skills
  const skillsSec = getSectionContent('skills');
  let skills = data.skills;
  if (!skills && skillsSec) {
    skills = skillsSec.skills || skillsSec;
  }
  if (Array.isArray(skills)) {
    const arr = skills.map((s) => (typeof s === 'string' ? s : s.name || ''));
    skills = { frontend: arr, backend: [], tools: [] };
  } else if (!skills || typeof skills !== 'object') {
    skills = { frontend: [], backend: [], tools: [] };
  } else {
    skills = {
      frontend: Array.isArray(skills.frontend) ? skills.frontend : [],
      backend: Array.isArray(skills.backend) ? skills.backend : [],
      tools: Array.isArray(skills.tools) ? skills.tools : [],
    };
  }

  // Helper for array extraction
  const extractArray = (key, secType) => {
    if (Array.isArray(data[key])) return data[key];
    const sec = getSectionContent(secType || key);
    if (Array.isArray(sec)) return sec;
    if (sec && Array.isArray(sec[key])) return sec[key];
    return [];
  };

  const experience = extractArray('experience', 'work_experience').map((exp, i) => ({
    id: exp.id || `exp-${i}`,
    role: exp.role || exp.title || '',
    company: exp.company || exp.employer || '',
    location: exp.location || '',
    startDate: exp.startDate || exp.start_date || '',
    endDate: exp.endDate || exp.end_date || '',
    description: exp.description || '',
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets
      : exp.description
      ? [exp.description]
      : [],
  }));

  const education = extractArray('education').map((edu, i) => ({
    id: edu.id || `edu-${i}`,
    degree: edu.degree || '',
    institution: edu.institution || edu.school || '',
    location: edu.location || '',
    startDate: edu.startDate || edu.start_date || '',
    endDate: edu.endDate || edu.end_date || '',
    gpa: edu.gpa || '',
  }));

  const internships = extractArray('internships').map((intern, i) => ({
    id: intern.id || `intern-${i}`,
    role: intern.role || intern.title || '',
    company: intern.company || '',
    location: intern.location || '',
    duration_months: parseInt(intern.duration_months || intern.duration || 3, 10),
    startDate: intern.startDate || intern.start_date || '',
    endDate: intern.endDate || intern.end_date || '',
    description: intern.description || '',
  }));

  const projects = extractArray('projects').map((proj, i) => ({
    id: proj.id || `proj-${i}`,
    name: proj.name || proj.title || '',
    title: proj.title || proj.name || '',
    technologies: proj.technologies || proj.techStack || '',
    techStack: proj.techStack || proj.technologies || '',
    description: proj.description || '',
  }));

  const certifications = extractArray('certifications').map((cert, i) => ({
    id: cert.id || `cert-${i}`,
    name: cert.name || cert.title || '',
    issuer: cert.issuer || cert.organization || '',
    issueDate: cert.issueDate || cert.issue_date || '',
    credentialId: cert.credentialId || cert.credential_id || '',
  }));

  const achievements = extractArray('achievements').map((ach, i) => ({
    id: ach.id || `ach-${i}`,
    title: ach.title || ach.name || '',
    description: ach.description || '',
  }));

  const languages = extractArray('languages').map((lang) =>
    typeof lang === 'string' ? lang : lang.name || ''
  );

  const normalized = {
    id,
    userId,
    title,
    template,
    template_id: template,
    target_role,
    personalInfo,
    professionalSummary,
    careerObjective,
    skills,
    experience,
    education,
    internships,
    projects,
    certifications,
    achievements,
    languages,
    createdAt,
    updatedAt,
  };

  // Re-generate sections array for DB queries expecting .sections
  normalized.sections = denormalizeToSections(normalized);

  return normalized;
}

function denormalizeToSections(canonical) {
  return [
    { section_type: 'personalInfo', content_json: canonical.personalInfo || {}, sort_order: 0 },
    {
      section_type: 'summary',
      content_json: {
        professionalSummary: canonical.professionalSummary || '',
        careerObjective: canonical.careerObjective || '',
      },
      sort_order: 1,
    },
    { section_type: 'skills', content_json: canonical.skills || {}, sort_order: 2 },
    { section_type: 'experience', content_json: { experience: canonical.experience || [] }, sort_order: 3 },
    { section_type: 'education', content_json: { education: canonical.education || [] }, sort_order: 4 },
    { section_type: 'internships', content_json: { internships: canonical.internships || [] }, sort_order: 5 },
    { section_type: 'projects', content_json: { projects: canonical.projects || [] }, sort_order: 6 },
    { section_type: 'certifications', content_json: { certifications: canonical.certifications || [] }, sort_order: 7 },
    { section_type: 'achievements', content_json: { achievements: canonical.achievements || [] }, sort_order: 8 },
    { section_type: 'languages', content_json: { languages: canonical.languages || [] }, sort_order: 9 },
  ];
}

function getEmptyCanonicalResume() {
  const empty = {
    id: '',
    userId: '',
    title: 'Untitled Resume',
    template: 'TechnicalTemplate',
    template_id: 'TechnicalTemplate',
    target_role: '',
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
    skills: { frontend: [], backend: [], tools: [] },
    experience: [],
    education: [],
    internships: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  empty.sections = denormalizeToSections(empty);
  return empty;
}

function isResumeEmpty(normalized) {
  if (!normalized) return true;
  const p = normalized.personalInfo || {};
  const hasPersonal = Boolean(p.fullName || p.email || p.phone);
  const hasSummary = Boolean(normalized.professionalSummary);
  const hasSkills =
    Array.isArray(normalized.skills?.frontend) && normalized.skills.frontend.length > 0;
  const hasExp = Array.isArray(normalized.experience) && normalized.experience.length > 0;
  const hasEdu = Array.isArray(normalized.education) && normalized.education.length > 0;
  const hasProjects = Array.isArray(normalized.projects) && normalized.projects.length > 0;

  return !(hasPersonal || hasSummary || hasSkills || hasExp || hasEdu || hasProjects);
}

module.exports = {
  normalizeResume,
  denormalizeToSections,
  getEmptyCanonicalResume,
  isResumeEmpty,
};
