const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

const ACCOUNT_TYPES = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
};

const DEFAULT_LIMITS = {
  FREE: {
    MAX_RESUMES: 2,
    MAX_JOB_OPTIMIZATIONS: 3,
    MAX_AI_EMAILS: 5,
  },
  PREMIUM: {
    MAX_RESUMES: 20,
    MAX_JOB_OPTIMIZATIONS: 100,
    MAX_AI_EMAILS: 200,
  },
};

const RESUME_TEMPLATES = [
  {
    id: 'modern_clean',
    name: 'Modern Clean',
    description: 'Clean single-column layout optimized for software engineers and technology professionals.',
    layout: 'single_column',
  },
  {
    id: 'executive_bold',
    name: 'Executive Bold',
    description: 'Structured layout emphasizing leadership, achievements, and quantified impact.',
    layout: 'two_column_header',
  },
  {
    id: 'technical_grid',
    name: 'Technical Grid',
    description: 'Specialized template for technical skills matrix, projects, and certifications.',
    layout: 'grid_focused',
  },
];

const JOB_PLATFORMS = ['Naukri', 'LinkedIn', 'Indeed'];

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];

module.exports = {
  ROLES,
  ACCOUNT_TYPES,
  DEFAULT_LIMITS,
  RESUME_TEMPLATES,
  JOB_PLATFORMS,
  ALLOWED_FILE_TYPES,
  FILE_EXTENSIONS,
};
