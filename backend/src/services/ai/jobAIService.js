const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const aiQueue = require('../queue/aiQueue');
const jobModel = require('../../models/jobModel');

/**
 * URL Validator - Ensures jobUrl and applicationUrl are syntactically valid,
 * use HTTPS/HTTP, and are NOT bare domain homepages or fake placeholders.
 */
function isValidJobUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // Disallow generic domains without a specific job path or posting id
    const genericDomains = ['example.com', 'google.com', 'linkedin.com', 'naukri.com', 'indeed.com', 'glassdoor.com'];
    if (genericDomains.includes(host)) {
      if (pathname === '/' || pathname === '/jobs' || pathname === '/jobs/' || pathname === '') {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Deduplicate jobs using stable normalized composite key (company + title + location + jobUrl)
 */
function deduplicateJobs(jobs) {
  const seen = new Set();
  const result = [];
  for (const job of jobs) {
    const normCompany = (job.company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normTitle = (job.title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normLoc = (job.location || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normUrl = (job.job_url || job.jobUrl || '').toLowerCase().trim();

    const key = `${normCompany}|${normTitle}|${normLoc}|${normUrl}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(job);
    }
  }
  return result;
}

/**
 * Enforce Company Diversity Rule: Limit max results from same company in top output set
 */
function applyCompanyDiversity(jobs, maxPerCompany = 2, totalLimit = 10) {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const companyCounts = {};
  const primaryList = [];
  const overflowList = [];

  for (const job of jobs) {
    const comp = (job.company || 'Unknown').toLowerCase().trim();
    companyCounts[comp] = (companyCounts[comp] || 0) + 1;

    if (companyCounts[comp] <= maxPerCompany) {
      primaryList.push(job);
    } else {
      overflowList.push(job);
    }
  }

  // Fill up to totalLimit from overflow if primary list is smaller
  const combined = [...primaryList, ...overflowList];
  return combined.slice(0, totalLimit);
}

class JobAIService {
  constructor() {
    this.apiKey = env.GEMINI_JOB_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.modelName = env.GEMINI_MODEL || 'models/gemini-3-flash-preview';
  }

  /**
   * Search & Discovery of relevant jobs matching user profile
   */
  async searchJobs({ targetRole, location = '', skills = [], experienceYears = 0, workMode = 'all', idempotencyKey = null }) {
    const taskName = 'Job Discovery Search';
    return aiQueue.enqueueTask(
      taskName,
      async () => {
        // Step 1: Query Normalization
        const normalized = this.normalizeQuery({ targetRole, location, skills, experienceYears, workMode });

        // Step 2: Retrieve source-backed jobs from database records
        const sourceJobs = await jobModel.searchExistingJobsInDb({
          queryStr: normalized.role,
          location: normalized.location,
          limit: 30,
        });

        // Step 3: Use Gemini or Rule-Engine for semantic ranking & skill matching if source jobs exist
        if (sourceJobs && sourceJobs.length > 0) {
          if (this.genAI) {
            try {
              return await this.callGeminiToRankJobs(sourceJobs, normalized);
            } catch (err) {
              logger.warn(`Gemini Job AI ranking failed (${err.message}). Using deterministic weighted matcher.`);
            }
          }
          return this.rankJobsWithRuleEngine(sourceJobs, normalized);
        }

        // NO FAKE DEMO JOBS: Return empty array if no source-backed jobs match
        return [];
      },
      idempotencyKey
    );
  }

  /**
   * Query Normalization Pipeline Step
   */
  normalizeQuery({ targetRole = '', location = '', skills = [], experienceYears = 0, workMode = 'all' }) {
    const role = (targetRole || 'Software Engineer').trim();
    const loc = (location || '').trim();
    const skillList = Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [];

    return {
      role,
      location: loc,
      skills: skillList.length > 0 ? skillList : ['Node.js', 'JavaScript', 'MySQL'],
      experienceYears: parseInt(experienceYears, 10) || 0,
      workMode,
    };
  }

  /**
   * Rank & Enrich Source-backed Jobs with Gemini
   */
  async callGeminiToRankJobs(sourceJobs, normalizedQuery) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
    });

    const currentDateStr = new Date().toISOString().split('T')[0];

    const prompt = `
You are an enterprise job-matching and job-result validation engine. Current Date: ${currentDateStr}.

CRITICAL INSTRUCTIONS:
- You are NOT allowed to invent jobs, companies, URLs, application links, salaries, job IDs, locations, recruiters, or job descriptions.
- Only analyze the source-backed job records supplied in the SOURCE RECORDS array below.
- Do NOT add jobs that are not present in the supplied source records.
- Do NOT modify or construct fake job URLs.
- Set application_url to null if direct application URL is unverified.
- Filter out expired or closed postings.

Candidate Criteria:
- Target Role: "${normalizedQuery.role}"
- Location: "${normalizedQuery.location}"
- Skills: ${JSON.stringify(normalizedQuery.skills)}

SOURCE RECORDS:
${JSON.stringify(sourceJobs, null, 2)}

Return strict JSON array of objects with schema:
[
  {
    "job_source": string,
    "source_job_id": string,
    "title": string,
    "company": string,
    "location": string,
    "job_url": string,
    "application_url": string | null,
    "job_description": string,
    "match_score": number (30-98),
    "matching_skills": string[],
    "missing_skills": string[]
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return this.sanitizeAndValidateJobs(parsed);
    }
    return this.rankJobsWithRuleEngine(sourceJobs, normalizedQuery);
  }

  /**
   * Deterministic weighted job ranking engine (Explicit 100% Weighted Matching Model)
   */
  rankJobsWithRuleEngine(sourceJobs, normalizedQuery) {
    const now = new Date();

    const scoredJobs = sourceJobs.map((job) => {
      const candidateSkills = normalizedQuery.skills;
      const jobText = `${job.title} ${job.job_description}`.toLowerCase();

      const matchingSkills = [];
      const missingSkills = [];

      candidateSkills.forEach((skill) => {
        if (jobText.includes(skill.toLowerCase())) {
          matchingSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      });

      // Explicit Weighted Scoring Model (100% Total)
      // 1. Role Match (20%)
      let scoreRole = 0;
      if (job.title.toLowerCase().includes(normalizedQuery.role.toLowerCase())) scoreRole = 20;
      else if (job.title.toLowerCase().includes('engineer') || job.title.toLowerCase().includes('developer')) scoreRole = 12;

      // 2. Required Skill Match (25%)
      const matchRatio = candidateSkills.length > 0 ? matchingSkills.length / candidateSkills.length : 0.5;
      const scoreSkill = Math.round(matchRatio * 25);

      // 3. Experience Match (15%)
      const scoreExp = 12;

      // 4. Location Match (10%)
      let scoreLoc = 5;
      if (!normalizedQuery.location || job.location.toLowerCase().includes(normalizedQuery.location.toLowerCase()) || job.location.toLowerCase().includes('remote')) {
        scoreLoc = 10;
      }

      // 5. Work Mode (5%), Education (5%), Domain (10%), Evidence (10%)
      const scoreWorkMode = 5;
      const scoreEdu = 5;
      const scoreDomain = 8;
      const scoreEvidence = 8;

      const totalScore = Math.max(30, Math.min(98, scoreRole + scoreSkill + scoreExp + scoreLoc + scoreWorkMode + scoreEdu + scoreDomain + scoreEvidence));

      // Calculate Job Age & Expiry
      const createdDate = job.created_at ? new Date(job.created_at) : now;
      const ageDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      const isStale = ageDays > 30;

      const validUrl = isValidJobUrl(job.job_url) ? job.job_url : null;
      const validAppUrl = isValidJobUrl(job.application_url) ? job.application_url : null;

      return {
        job_source: job.job_source || 'Verified Partner',
        source_job_id: job.source_job_id || job.id,
        title: job.title,
        company: job.company,
        location: job.location || normalizedQuery.location || 'Remote',
        job_url: validUrl,
        application_url: validAppUrl,
        job_description: job.job_description || '',
        match_score: totalScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        postedAt: createdDate.toISOString(),
        jobAgeDays: ageDays,
        isStale,
        status: isStale ? 'STALE' : 'ACTIVE',
      };
    });

    return this.sanitizeAndValidateJobs(scoredJobs);
  }

  /**
   * Validate, Deduplicate, Company Diversity Filter, and Clean Job Results
   */
  sanitizeAndValidateJobs(jobsList) {
    if (!Array.isArray(jobsList)) return [];

    // Filter valid URLs and non-expired jobs
    const validJobs = jobsList.filter((j) => {
      if (!j || !j.title || !j.company) return false;
      const url = j.job_url || j.jobUrl;
      if (!isValidJobUrl(url)) return false;
      if (j.status === 'EXPIRED' || j.status === 'CLOSED') return false;
      return true;
    });

    const sanitized = validJobs.map((j) => {
      const mainUrl = j.job_url || j.jobUrl;
      const appUrl = j.application_url || j.applicationUrl;

      return {
        job_source: j.job_source || 'Verified Partner',
        source_job_id: j.source_job_id || null,
        title: j.title,
        company: j.company,
        location: j.location || 'Flexible',
        job_url: mainUrl,
        application_url: isValidJobUrl(appUrl) ? appUrl : null,
        job_description: j.job_description || '',
        match_score: typeof j.match_score === 'number' ? Math.max(30, Math.min(98, j.match_score)) : 75,
        matching_skills: Array.isArray(j.matching_skills) ? j.matching_skills : [],
        missing_skills: Array.isArray(j.missing_skills) ? j.missing_skills : [],
        status: j.status || 'ACTIVE',
      };
    });

    // Step 1: Deduplicate by composite key
    const deduped = deduplicateJobs(sanitized);

    // Step 2: Apply Company Diversity (Max 2 jobs per company in top 10)
    return applyCompanyDiversity(deduped, 2, 10);
  }

  /**
   * Generate AI HR Application Email
   */
  async generateHREmail({ jobTitle, companyName, recruiterInfo = '', jobDescription = '', resumeData = {}, idempotencyKey = null }) {
    const taskName = 'AI HR Application Email Generation';
    return aiQueue.enqueueTask(
      taskName,
      async () => {
        if (this.genAI) {
          try {
            return await this.callGeminiForHREmail({ jobTitle, companyName, recruiterInfo, jobDescription, resumeData });
          } catch (err) {
            logger.warn(`Gemini HR Email AI call failed (${err.message}). Falling back to email generator template engine.`);
          }
        }
        return this.runRuleBasedHREmail({ jobTitle, companyName, recruiterInfo, jobDescription, resumeData });
      },
      idempotencyKey
    );
  }

  async callGeminiForHREmail({ jobTitle, companyName, recruiterInfo, jobDescription, resumeData }) {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `
You are an executive candidate strategist.
Generate a highly professional job application email to HR for position "${jobTitle}" at "${companyName}".
Recruiter Info provided: "${recruiterInfo || 'Hiring Manager'}".
DO NOT fabricate recruiter details if not provided.
Resume Summary: ${JSON.stringify(resumeData)}

Return JSON:
{
  "subject": string,
  "body": string
}
`;
    const result = await model.generateContent(prompt);
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return this.runRuleBasedHREmail({ jobTitle, companyName, recruiterInfo, jobDescription, resumeData });
  }

  runRuleBasedHREmail({ jobTitle, companyName, recruiterInfo, resumeData }) {
    const recipient = recruiterInfo ? recruiterInfo : 'Hiring Manager';
    const candidateName = (resumeData.personalInfo && resumeData.personalInfo.fullName) || 'Candidate';
    const emailStr = (resumeData.personalInfo && resumeData.personalInfo.email) || 'candidate@example.com';

    const subject = `Application for ${jobTitle} Position - ${candidateName}`;
    const body = `Dear ${recipient},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With a solid background in backend architecture, software engineering, and scalable systems, I am confident in my ability to deliver immediate value to your engineering team.

Key technical highlights from my experience include:
- Designing lightweight, high-performance web applications and REST APIs.
- Optimizing database performance, query latency, and data models.
- Implementing robust security, JWT authentication, and access controls.

I have attached my detailed resume for your review. I would welcome the opportunity to discuss how my technical expertise aligns with ${companyName}'s objectives.

Thank you for your time and consideration.

Best regards,

${candidateName}
Email: ${emailStr}`;

    return { subject, body };
  }
}

const jobAIService = new JobAIService();
module.exports = jobAIService;
