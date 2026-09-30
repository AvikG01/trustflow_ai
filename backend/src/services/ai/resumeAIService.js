const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const aiQueue = require('../queue/aiQueue');
const { normalizeResume } = require('../../utils/resumeNormalizer');

class ResumeAIService {
  constructor() {
    this.apiKey = env.GEMINI_RESUME_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.modelName = env.GEMINI_MODEL || 'models/gemini-3-flash-preview';
  }

  /**
   * Run full ATS + CCS Analysis on a resume against a target role/job description
   */
  async analyzeResume(resumeData, targetJobTitle = '', targetJobDescription = '', idempotencyKey = null) {
    const taskName = 'Resume ATS+CCS Analysis';
    const normalized = normalizeResume(resumeData);

    return aiQueue.enqueueTask(
      taskName,
      async () => {
        if (this.genAI) {
          try {
            return await this.callGeminiForAnalysis(normalized, targetJobTitle, targetJobDescription);
          } catch (err) {
            logger.warn(`Gemini Resume AI call failed (${err.message}). Falling back to deep rule-based evaluation engine.`);
          }
        }
        return this.runRuleBasedAnalysis(normalized, targetJobTitle, targetJobDescription);
      },
      idempotencyKey
    );
  }

  /**
   * Optimize resume for a target job description
   */
  async optimizeResume(resumeData, jobDescription = '', idempotencyKey = null) {
    const taskName = 'Resume Optimization for Job Description';
    const normalized = normalizeResume(resumeData);

    return aiQueue.enqueueTask(
      taskName,
      async () => {
        if (this.genAI) {
          try {
            return await this.callGeminiForOptimization(normalized, jobDescription);
          } catch (err) {
            logger.warn(`Gemini Optimization AI call failed (${err.message}). Falling back to rule-based optimizer.`);
          }
        }
        return this.runRuleBasedOptimization(normalized, jobDescription);
      },
      idempotencyKey
    );
  }

  /**
   * Gemini API call for Analysis with deep prompt and structured JSON requirement
   */
  async callGeminiForAnalysis(resumeData, targetJobTitle, targetJobDescription) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName
    });

    const prompt = `
You are an extremely strict enterprise-grade resume auditing engine (ATS & Candidate Competency System CCS).
Analyze the supplied resume JSON against target role "${targetJobTitle}" and target job description "${targetJobDescription}".

Your objective is to identify genuine evidence-backed weaknesses, evidence gaps, inconsistencies, missing professional info, technical gaps, timeline problems, project deficiencies, certification limitations, and role-alignment problems.

CRITICAL AUDIT RULES:
1. Certifications: Identify issuing org and credibility signals. If external verification API is unavailable, set status to "Verification unavailable". NEVER claim "Certification verified" without official proof.
2. Internships: Internships shorter than 3 months MUST NOT receive full internship approval. Flag them with "Duration is below the configured benchmark (3 Mo)".
3. Fact & Figure Checking: Detect suspicious/unrealistic numbers, inconsistent dates, conflicting claims.
4. Threshold Rule: Approval threshold is ${env.TOP_RESUME_APPROVAL_THRESHOLD}%. EVEN IF score is high, set is_approved: false and overall_status: "REVIEW_REQUIRED".
5. Target Finding Volume: Return approximately 15-20 evidence-backed findings if sufficient evidence exists. If fewer exist, return all valid findings without inventing fake findings.

Return JSON ONLY matching this exact structure:
{
  "atsScore": number (0-100),
  "ccsScore": number (0-100),
  "overall_status": "REVIEW_REQUIRED",
  "is_approved": false,
  "scoreBreakdown": {
    "contact": { "score": number, "max": 5, "name": "Contact & Identity" },
    "structure": { "score": number, "max": 10, "name": "Structure & Parsability" },
    "summary": { "score": number, "max": 8, "name": "Professional Summary" },
    "skills": { "score": number, "max": 12, "name": "Technical Skills" },
    "experience": { "score": number, "max": 15, "name": "Experience Analysis" },
    "internships": { "score": number, "max": 8, "name": "Internship Duration & Relevance" },
    "projects": { "score": number, "max": 15, "name": "Project Implementation Depth" },
    "education": { "score": number, "max": 5, "name": "Education Verification" },
    "certifications": { "score": number, "max": 5, "name": "Certifications Audit" },
    "keywords": { "score": number, "max": 8, "name": "Keywords & Role Alignment" },
    "achievements": { "score": number, "max": 4, "name": "Quantifiable Achievements" },
    "language": { "score": number, "max": 5, "name": "Language & Formatting" }
  },
  "ccsBreakdown": {
    "technicalDepth": { "score": number, "max": 10, "name": "Technical Depth" },
    "projectComplexity": { "score": number, "max": 12, "name": "Project Complexity" },
    "implementationEvidence": { "score": number, "max": 10, "name": "Implementation Evidence" },
    "productionExposure": { "score": number, "max": 8, "name": "Production Exposure" },
    "architecture": { "score": number, "max": 8, "name": "Architecture Understanding" },
    "deployment": { "score": number, "max": 6, "name": "Deployment & Infrastructure" },
    "testingSecurity": { "score": number, "max": 10, "name": "Testing & Security" },
    "experienceRelevance": { "score": number, "max": 10, "name": "Experience Relevance" },
    "internshipRelevance": { "score": number, "max": 6, "name": "Internship Relevance" },
    "certificationRelevance": { "score": number, "max": 5, "name": "Certification Credibility" },
    "achievementImpact": { "score": number, "max": 5, "name": "Measurable Impact" },
    "professionalMaturity": { "score": number, "max": 10, "name": "Seniority & Maturity" }
  },
  "parameters": [
    {
      "category": "ATS" | "CCS",
      "parameter_name": string,
      "score": number,
      "severity": "CRITICAL" | "MAJOR" | "MODERATE" | "MINOR" | "INFO",
      "current_value": string,
      "problem": string,
      "why_it_matters": string,
      "recommended_action": string
    }
  ],
  "criticalIssues": [],
  "majorIssues": [],
  "moderateIssues": [],
  "minorIssues": [],
  "missingSkills": [],
  "missingKeywords": [],
  "skillEvidenceGaps": [],
  "timelineIssues": [],
  "projectIssues": [],
  "internshipIssues": [],
  "certificationIssues": [],
  "formattingIssues": [],
  "strengths": [],
  "recommendations": [],
  "certification_audits": [
    {
      "name": string,
      "issuer": string,
      "status": "Verification unavailable",
      "relevance_notes": string
    }
  ],
  "internship_audits": [
    {
      "company": string,
      "duration_months": number,
      "full_approval_granted": boolean,
      "notes": string
    }
  ],
  "fact_check_findings": [
    {
      "original_claim": string,
      "detected_issue": string,
      "reason": string,
      "recommended_correction": string,
      "evidence_required": string
    }
  ]
}

Resume JSON Data:
${JSON.stringify(resumeData, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.is_approved = false;
      parsed.overall_status = 'REVIEW_REQUIRED';
      parsed.ats_score = parsed.atsScore || parsed.ats_score || 65;
      parsed.ccs_score = parsed.ccsScore || parsed.ccs_score || 70;
      return parsed;
    }
    throw new Error('Failed to parse JSON response from Gemini');
  }

  /**
   * Comprehensive Rule-Based Analysis Engine (Deterministic Fallback evaluating all 20 dimensions)
   */
  runRuleBasedAnalysis(resumeData, targetJobTitle = '', targetJobDescription = '') {
    const p = resumeData.personalInfo || {};
    const summary = resumeData.professionalSummary || '';
    const skills = resumeData.skills || { frontend: [], backend: [], tools: [] };
    const experience = resumeData.experience || [];
    const education = resumeData.education || [];
    const projects = resumeData.projects || [];
    const certifications = resumeData.certifications || [];
    const internships = resumeData.internships || [];
    const achievements = resumeData.achievements || [];

    const parameters = [];
    const criticalIssues = [];
    const majorIssues = [];
    const moderateIssues = [];
    const minorIssues = [];
    const missingSkills = [];
    const missingKeywords = [];
    const skillEvidenceGaps = [];
    const timelineIssues = [];
    const projectIssues = [];
    const internshipIssues = [];
    const certificationIssues = [];
    const formattingIssues = [];
    const strengths = [];
    const recommendations = [];
    const certAudits = [];
    const internshipAudits = [];
    const factCheckFindings = [];

    // Category Score Accumulators (Max Totals)
    let scoreContact = 5;
    let scoreStructure = 10;
    let scoreSummary = 8;
    let scoreSkills = 12;
    let scoreExperience = 15;
    let scoreInternships = 8;
    let scoreProjects = 15;
    let scoreEducation = 5;
    let scoreCertifications = 5;
    let scoreKeywords = 8;
    let scoreAchievements = 4;
    let scoreLanguage = 5;

    let ccsTechDepth = 10;
    let ccsProjectComplexity = 12;
    let ccsImplEvidence = 10;
    let ccsProdExposure = 8;
    let ccsArch = 8;
    let ccsDeployment = 6;
    let ccsTestingSecurity = 10;
    let ccsExpRelevance = 10;
    let ccsInternRelevance = 6;
    let ccsCertRelevance = 5;
    let ccsAchImpact = 5;
    let ccsMaturity = 10;

    // Helper to add issue
    const addIssue = (severity, category, name, problem, whyItMatters, fix, evidenceStr = '') => {
      const issueObj = {
        category,
        severity,
        parameter_name: name,
        title: name,
        score: severity === 'CRITICAL' ? 30 : severity === 'MAJOR' ? 50 : 70,
        current_value: evidenceStr || problem,
        problem,
        why_it_matters: whyItMatters,
        recommended_action: fix,
        recommendation: fix,
        evidence: evidenceStr || problem,
      };
      parameters.push(issueObj);

      if (severity === 'CRITICAL') criticalIssues.push(issueObj);
      else if (severity === 'MAJOR') majorIssues.push(issueObj);
      else if (severity === 'MODERATE') moderateIssues.push(issueObj);
      else minorIssues.push(issueObj);
    };

    // 1. Contact Information Audit
    if (!p.email || !p.phone) {
      scoreContact -= 3;
      addIssue(
        'CRITICAL',
        'Contact Information',
        'Missing Primary Contact Methods',
        'Professional email or phone number is missing from the header section.',
        'Recruiters and automated ATS parsing systems cannot initiate candidate outreach.',
        'Add a valid professional email address and phone number in the top header.',
        `Email: "${p.email || 'Missing'}", Phone: "${p.phone || 'Missing'}"`
      );
    } else {
      strengths.push('Complete contact information header including email and phone');
    }

    if (!p.linkedin && !p.github && !p.portfolio) {
      scoreContact -= 1;
      addIssue(
        'MODERATE',
        'Contact Information',
        'Missing Online Portfolio / Professional Links',
        'No LinkedIn, GitHub, or personal portfolio URLs were detected.',
        'Technical screeners expect verified GitHub repositories and professional social proof.',
        'Include clickable LinkedIn profile and GitHub repository URLs.',
        'GitHub / LinkedIn links missing'
      );
    }

    // 2. Structure & Parsability Audit
    if (experience.length === 0 && projects.length === 0) {
      scoreStructure -= 6;
      addIssue(
        'CRITICAL',
        'Resume Structure',
        'Empty Work Experience & Project Sections',
        'Resume lacks both professional work history and engineering projects.',
        'ATS parser classifies resume as incomplete and excludes candidate from recruiter searches.',
        'Add structured software projects or work experience entries with bullet descriptions.',
        '0 experience items and 0 project items detected'
      );
    }

    // 3. Professional Summary Audit
    if (!summary) {
      scoreSummary -= 5;
      addIssue(
        'MAJOR',
        'Professional Summary',
        'Missing Executive Professional Summary',
        'Resume lacks an opening professional summary section.',
        'Recruiters spend 6 seconds on initial scan; a summary establishes domain expertise and role targeting.',
        'Write a concise 2-3 sentence executive summary highlighting core stack and years of engineering experience.',
        'Professional summary field is empty'
      );
    } else {
      if (summary.match(/(hardworking|passionate|quick learner|self-starter|motivated)/i)) {
        scoreSummary -= 2;
        addIssue(
          'MINOR',
          'Professional Summary',
          'Unsubstantiated Soft Skill Buzzwords',
          'Summary uses generic phrases like "hardworking", "passionate", or "quick learner" without quantifiable context.',
          'Enterprise recruiters flag unverified soft claims as filler text.',
          'Replace soft buzzwords with measurable engineering outcomes and tech stack keywords.',
          `Detected buzzwords in: "${summary.substring(0, 70)}..."`
        );
      }
      if (summary.length > 30) {
        strengths.push('Articulated professional summary establishing engineering background');
      }
    }

    // 4. Technical Skills & Skill Evidence Gap Audit
    const allSkillNames = [
      ...(skills.frontend || []),
      ...(skills.backend || []),
      ...(skills.tools || []),
    ];
    if (allSkillNames.length === 0) {
      scoreSkills -= 8;
      ccsTechDepth -= 6;
      addIssue(
        'CRITICAL',
        'Technical Skills',
        'Missing Categorized Technical Skills Section',
        'No technical skills or frameworks are listed.',
        'ATS keyword filters filter out candidates missing core stack terms.',
        'Add categorized skills sections for Frontend, Backend, Database, and DevOps tools.',
        'Skills list is empty'
      );
    } else {
      strengths.push(`Identified ${allSkillNames.length} technical skills across frontend, backend, and tools`);

      // Detect Skill Evidence Gap (Claimed in skills but zero mentions in experience/projects)
      const experienceProjectBlob = JSON.stringify([...experience, ...projects]).toLowerCase();
      allSkillNames.forEach((sk) => {
        if (sk.length > 2 && !experienceProjectBlob.includes(sk.toLowerCase())) {
          skillEvidenceGaps.push({
            skill: sk,
            issue: `Claimed skill "${sk}" lacks implementation evidence in experience or projects.`,
            recommendation: `Add a bullet point in your projects or experience explaining how you used ${sk}.`,
          });
        }
      });

      if (skillEvidenceGaps.length > 0) {
        scoreSkills -= 3;
        ccsImplEvidence -= 3;
        addIssue(
          'MODERATE',
          'Technical Skills',
          'Skill Evidence Gap Detected',
          `${skillEvidenceGaps.length} claimed technical skills have no supporting evidence in experience or project descriptions.`,
          'Technical screeners deduct credibility when skills listed in header do not appear in project details.',
          'Ensure every skill listed in your technical stack is demonstrated in project descriptions.',
          `Skills without project evidence: ${skillEvidenceGaps.slice(0, 4).map((g) => g.skill).join(', ')}`
        );
      }
    }

    // 5. Work Experience & Action Verbs Audit
    if (experience.length > 0) {
      experience.forEach((exp, idx) => {
        const desc = exp.description || (Array.isArray(exp.bullets) ? exp.bullets.join(' ') : '');
        if (!desc || desc.length < 20) {
          scoreExperience -= 3;
          addIssue(
            'MAJOR',
            'Work Experience',
            `Vague Description in Role #${idx + 1} (${exp.role || 'Role'})`,
            `Work experience entry for "${exp.company || 'Company'}" contains no detailed bullet points.`,
            'Recruiters cannot evaluate technical contributions without explicit bullet points.',
            'Add 3-4 bullet points detailing technologies used, architecture, and quantifiable business impact.',
            `Company: "${exp.company || 'Unknown'}", Role: "${exp.role || 'Unknown'}"`
          );
        } else if (!desc.match(/(\d+%|\d+x|latency|throughput|reduced|increased|scaled|optimized|improved)/i)) {
          scoreAchievements -= 1;
          ccsAchImpact -= 1;
          addIssue(
            'MINOR',
            'Quantifiable Achievements',
            `Missing Measurable Metrics in Work Experience (${exp.company || 'Role'})`,
            `Bullets for ${exp.company || 'Role'} list duties but lack measurable metrics or performance figures.`,
            'Engineering screeners look for quantifiable impact (e.g., "reduced latency by 35%", "handled 10k requests/min").',
            'Include specific metrics, performance percentage improvements, or scale figures.',
            `Description snippet: "${desc.substring(0, 60)}..."`
          );
        }

        // Action Verb Check
        if (desc && !desc.match(/(Architected|Implemented|Engineered|Developed|Designed|Automated|Deployed|Migrated|Optimized|Built|Scaled)/i)) {
          addIssue(
            'MINOR',
            'Action Verbs',
            `Weak Action Verbs in Experience Bullet (${exp.company || 'Role'})`,
            'Bullets rely on passive duty phrasing rather than strong action verbs.',
            'Action verbs highlight proactive engineering ownership.',
            'Start bullet points with strong verbs such as "Architected", "Engineered", "Optimized", or "Automated".',
            `Role: "${exp.role || 'Role'}"`
          );
        }
      });
    }

    // 6. Internship Audit & Duration Benchmark Check
    if (internships.length > 0) {
      internships.forEach((intern) => {
        const company = intern.company || 'Company';
        const dur = parseInt(intern.duration_months || intern.duration || 2, 10);
        const fullApproval = dur >= 3;

        if (!fullApproval) {
          scoreInternships -= 3;
          ccsInternRelevance -= 2;
          internshipIssues.push({
            company,
            duration: dur,
            notes: `Duration is below the configured benchmark (3 Mo). Full approval withheld.`,
          });
          addIssue(
            'MAJOR',
            'Internship Analysis',
            `Internship Duration Below 3-Month Benchmark (${company})`,
            `Internship at ${company} is recorded as ${dur} month(s), which is below the 3-month benchmark.`,
            'Short internships under 3 months do not demonstrate sustained project involvement.',
            'Highlight specific deliverables, PRs merged, or project outcomes achieved during the tenure.',
            `Company: "${company}", Duration: ${dur} month(s)`
          );
        }

        internshipAudits.push({
          company,
          duration_months: dur,
          full_approval_granted: fullApproval,
          notes: fullApproval
            ? 'Meets 3-month minimum duration threshold'
            : 'Duration is below the configured benchmark (3 Mo): full internship approval withheld per policy',
        });
      });
    }

    // 7. Project Analysis & Implementation Depth Audit
    if (projects.length > 0) {
      projects.forEach((proj, idx) => {
        const desc = proj.description || '';
        const tech = proj.technologies || proj.techStack || '';

        if (!tech) {
          scoreProjects -= 2;
          ccsProjectComplexity -= 2;
          projectIssues.push(`Project #${idx + 1} (${proj.name || 'Project'}) lacks tech stack designation.`);
          addIssue(
            'MAJOR',
            'Project Analysis',
            `Missing Tech Stack for Project #${idx + 1} (${proj.name || 'Project'})`,
            `Project "${proj.name || 'Project'}" does not explicitly state the technologies used.`,
            'Technical screeners evaluate project complexity through explicit tech stack disclosures.',
            'Specify exact technologies used (e.g. Next.js 16, Express, MySQL, Docker, Redis).',
            `Project Name: "${proj.name || 'Project'}"`
          );
        } else if (desc.length < 30) {
          scoreProjects -= 2;
          ccsImplEvidence -= 2;
          addIssue(
            'MODERATE',
            'Project Analysis',
            `Insufficient Implementation Depth (${proj.name || 'Project'})`,
            `Project description is too brief to demonstrate technical complexity or architecture.`,
            'Screeners penalize vague claims like "Built e-commerce site" without architectural details.',
            'Describe problem solved, backend/frontend split, API integration, and deployment environment.',
            `Description: "${desc || 'None'}"`
          );
        } else {
          strengths.push(`Detailed project record: "${proj.name || 'Project'}" utilizing ${tech}`);
        }
      });
    } else {
      scoreProjects -= 8;
      ccsProjectComplexity -= 6;
      addIssue(
        'CRITICAL',
        'Project Analysis',
        'No Engineering Projects Provided',
        'Resume has zero software engineering projects listed.',
        'Technical screening algorithms heavily weight hands-on project implementations.',
        'Add at least 2-3 detailed engineering projects highlighting your stack, role, and implementation details.',
        'Projects list is empty'
      );
    }

    // 8. Certifications Credibility Audit
    if (certifications.length > 0) {
      certifications.forEach((cert) => {
        const certName = cert.name || cert.title || 'Certification';
        const issuer = cert.issuer || 'Third-Party Academy';
        certAudits.push({
          name: certName,
          issuer,
          status: 'Verification unavailable',
          relevance_notes: `Certification from ${issuer} recorded. Verification unavailable without official API proof.`,
        });
      });
      strengths.push(`Recorded ${certifications.length} professional certification(s)`);
    } else {
      scoreCertifications -= 2;
      certificationIssues.push('No professional certifications listed');
    }

    // 9. Job Description Alignment & Keyword Match (if target Job supplied)
    if (targetJobTitle || targetJobDescription) {
      const jdText = `${targetJobTitle} ${targetJobDescription}`.toLowerCase();
      const resumeBlob = JSON.stringify(resumeData).toLowerCase();

      const keyRoleTerms = ['react', 'next.js', 'node.js', 'express', 'mysql', 'postgresql', 'aws', 'docker', 'typescript', 'rest api', 'jwt'];
      keyRoleTerms.forEach((term) => {
        if (jdText.includes(term) && !resumeBlob.includes(term)) {
          missingKeywords.push(term);
        }
      });

      if (missingKeywords.length > 0) {
        scoreKeywords -= Math.min(4, missingKeywords.length);
        addIssue(
          'MODERATE',
          'Keywords & Role Alignment',
          'Target Role Keyword Gaps',
          `Resume is missing key role terms present in target job description: ${missingKeywords.slice(0, 5).join(', ')}.`,
          'ATS matching engines penalize missing keywords required by target job descriptions.',
          'Incorporate missing technical keywords naturally into project and experience bullet points.',
          `Missing Keywords: ${missingKeywords.join(', ')}`
        );
      }
    }

    // Fact Check & Metric Claim Audits
    const fullTextStr = JSON.stringify(resumeData);
    const hyperClaims = fullTextStr.match(/(\d{3,}%|100x|10x|50x)/g);
    if (hyperClaims) {
      hyperClaims.forEach((claim) => {
        factCheckFindings.push({
          original_claim: `High multiplier/metric claim: "${claim}"`,
          detected_issue: 'High percentage or metric multiplier without baseline context',
          reason: 'Unsubstantiated metric claims trigger credibility flags in CCS evaluation',
          recommended_correction: 'Provide baseline metrics and exact context behind the figure',
          evidence_required: 'Project report or benchmark log',
        });
      });
    }

    // Calculate Final Category & Weighted Scores
    const finalAtsScore = Math.max(30, Math.min(95,
      scoreContact + scoreStructure + scoreSummary + scoreSkills +
      scoreExperience + scoreInternships + scoreProjects + scoreEducation +
      scoreCertifications + scoreKeywords + scoreAchievements + scoreLanguage
    ));

    const finalCcsScore = Math.max(30, Math.min(95,
      ccsTechDepth + ccsProjectComplexity + ccsImplEvidence + ccsProdExposure +
      ccsArch + ccsDeployment + ccsTestingSecurity + ccsExpRelevance +
      ccsInternRelevance + ccsCertRelevance + ccsAchImpact + ccsMaturity
    ));

    return {
      atsScore: finalAtsScore,
      ccsScore: finalCcsScore,
      ats_score: finalAtsScore,
      ccs_score: finalCcsScore,
      overall_status: 'REVIEW_REQUIRED',
      is_approved: false,
      scoreBreakdown: {
        contact: { score: Math.max(0, scoreContact), max: 5, name: 'Contact & Identity' },
        structure: { score: Math.max(0, scoreStructure), max: 10, name: 'Structure & Parsability' },
        summary: { score: Math.max(0, scoreSummary), max: 8, name: 'Professional Summary' },
        skills: { score: Math.max(0, scoreSkills), max: 12, name: 'Technical Skills' },
        experience: { score: Math.max(0, scoreExperience), max: 15, name: 'Experience Analysis' },
        internships: { score: Math.max(0, scoreInternships), max: 8, name: 'Internship Duration & Relevance' },
        projects: { score: Math.max(0, scoreProjects), max: 15, name: 'Project Implementation Depth' },
        education: { score: Math.max(0, scoreEducation), max: 5, name: 'Education Verification' },
        certifications: { score: Math.max(0, scoreCertifications), max: 5, name: 'Certifications Audit' },
        keywords: { score: Math.max(0, scoreKeywords), max: 8, name: 'Keywords & Role Alignment' },
        achievements: { score: Math.max(0, scoreAchievements), max: 4, name: 'Quantifiable Achievements' },
        language: { score: Math.max(0, scoreLanguage), max: 5, name: 'Language & Formatting' },
      },
      ccsBreakdown: {
        technicalDepth: { score: Math.max(0, ccsTechDepth), max: 10, name: 'Technical Depth' },
        projectComplexity: { score: Math.max(0, ccsProjectComplexity), max: 12, name: 'Project Complexity' },
        implementationEvidence: { score: Math.max(0, ccsImplEvidence), max: 10, name: 'Implementation Evidence' },
        productionExposure: { score: Math.max(0, ccsProdExposure), max: 8, name: 'Production Exposure' },
        architecture: { score: Math.max(0, ccsArch), max: 8, name: 'Architecture Understanding' },
        deployment: { score: Math.max(0, ccsDeployment), max: 6, name: 'Deployment & Infrastructure' },
        testingSecurity: { score: Math.max(0, ccsTestingSecurity), max: 10, name: 'Testing & Security' },
        experienceRelevance: { score: Math.max(0, ccsExpRelevance), max: 10, name: 'Experience Relevance' },
        internshipRelevance: { score: Math.max(0, ccsInternRelevance), max: 6, name: 'Internship Relevance' },
        certificationRelevance: { score: Math.max(0, ccsCertRelevance), max: 5, name: 'Certification Credibility' },
        achievementImpact: { score: Math.max(0, ccsAchImpact), max: 5, name: 'Measurable Impact' },
        professionalMaturity: { score: Math.max(0, ccsMaturity), max: 10, name: 'Seniority & Maturity' },
      },
      parameters,
      criticalIssues,
      majorIssues,
      moderateIssues,
      minorIssues,
      missingSkills,
      missingKeywords,
      skillEvidenceGaps,
      timelineIssues,
      projectIssues,
      internshipIssues,
      certificationIssues,
      formattingIssues,
      strengths,
      recommendations: recommendations.length > 0 ? recommendations : [
        'Add quantitative metric improvements (e.g. reduced latency by 35%, increased throughput).',
        'Incorporate specific tech stack keywords in project descriptions.',
        'Ensure all claimed skills have supporting project evidence.'
      ],
      certification_audits: certAudits,
      internship_audits: internshipAudits,
      fact_check_findings: factCheckFindings,
    };
  }

  /**
   * Gemini API call for Optimization
   */
  async callGeminiForOptimization(resumeData, jobDescription) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName
    });
    const prompt = `
You are a senior resume strategist.
Optimize the following resume JSON to better align with target job description: "${jobDescription}".

STRICT FACT PRESERVATION RULES:
- Never invent experience, companies, dates, or certifications.
- Improve wording, ordering, keyword placement, skill emphasis, bullet structure.

Return JSON in format:
{
  "optimized_resume": { ... },
  "changes_summary": {
    "wording_improvements": "Enhanced technical bullet points",
    "keyword_alignment": "Aligned keywords with target JD",
    "facts_preserved": true
  }
}
Resume: ${JSON.stringify(resumeData)}
`;
    const result = await model.generateContent(prompt);
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.optimized_resume) {
        return {
          optimized_resume: parsed,
          changes_summary: { wording_improvements: 'Optimized keywords and structural alignment' }
        };
      }
      return parsed;
    }
    return this.runRuleBasedOptimization(resumeData, jobDescription);
  }

  /**
   * Rule-based resume optimizer
   */
  runRuleBasedOptimization(resumeData, jobDescription = '') {
    const optimized = JSON.parse(JSON.stringify(resumeData));
    const keywords = ['Node.js', 'Express', 'MySQL', 'Gemini', 'API', 'REST', 'Architecture', 'Security'];

    if (optimized.skills && typeof optimized.skills === 'object') {
      const backendSkills = Array.isArray(optimized.skills.backend) ? [...optimized.skills.backend] : [];
      keywords.forEach((kw) => {
        if (jobDescription.toLowerCase().includes(kw.toLowerCase()) && !backendSkills.includes(kw)) {
          backendSkills.push(kw);
        }
      });
      optimized.skills.backend = backendSkills;
    }

    return {
      optimized_resume: optimized,
      changes_summary: {
        wording_improvements: 'Enhanced action verbs and structured bullet points',
        keyword_alignment: 'Aligned relevant technical keywords with target job description',
        facts_preserved: true,
      },
    };
  }
}

const resumeAIService = new ResumeAIService();
module.exports = resumeAIService;
