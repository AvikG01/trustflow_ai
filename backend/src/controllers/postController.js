const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const responseHandler = require('../utils/responseHandler');
const validators = require('../validators/actionValidators');
const userModel = require('../models/userModel');
const usageModel = require('../models/usageModel');
const resumeModel = require('../models/resumeModel');
const analysisModel = require('../models/analysisModel');
const jobModel = require('../models/jobModel');
const driveModel = require('../models/driveModel');
const auditModel = require('../models/auditModel');
const resumeAIService = require('../services/ai/resumeAIService');
const jobAIService = require('../services/ai/jobAIService');
const googleDriveService = require('../services/googleDrive/googleDriveService');
const resumeParser = require('../services/resume/resumeParser');
const pdfGeneratorService = require('../services/pdf/pdfGeneratorService');
const { normalizeResume, isResumeEmpty } = require('../utils/resumeNormalizer');

async function handlePost(req, res, next) {
  try {
    const action = req.body.action || req.query.action || req.headers['x-action'];

    if (!action) {
      return responseHandler.error(res, 'Action parameter missing in POST request', 400, 'ACTION_REQUIRED');
    }

    switch (action) {
      case 'register':
        return await handleRegister(req, res);

      case 'login':
        return await handleLogin(req, res);

      case 'createResume':
      case 'create_resume':
        return await handleCreateResume(req, res);

      case 'saveDraft':
      case 'save_draft':
        return await handleSaveDraft(req, res);

      case 'duplicateResume':
        return await handleDuplicateResume(req, res);

      case 'uploadResume':
        return await handleUploadResume(req, res);

      case 'analyzeResume':
      case 'analyze_resume':
        return await handleAnalyzeResume(req, res);

      case 'searchJobs':
        return await handleSearchJobs(req, res);

      case 'optimizeResumeForJob':
        return await handleOptimizeResumeForJob(req, res);

      case 'generateHREmail':
        return await handleGenerateHREmail(req, res);

      case 'syncGoogleDrive':
        return await handleSyncGoogleDrive(req, res);

      case 'generateResumePDF':
      case 'generate_resume_pdf':
        return await handleGenerateResumePDF(req, res);

      case 'downloadResumeFile':
      case 'download_resume_file':
        return await handleDownloadResumeFile(req, res);

      default:
        return responseHandler.error(res, `Unknown POST action: ${action}`, 400, 'INVALID_ACTION');
    }
  } catch (err) {
    next(err);
  }
}

// 1. User Registration
async function handleRegister(req, res) {
  const validationErr = validators.validateRegistrationInput(req.body);
  if (validationErr) {
    return responseHandler.error(res, validationErr, 400, 'VALIDATION_ERROR');
  }

  const { name, email, password } = req.body;
  const existingUser = await userModel.findByEmail(email);

  if (existingUser) {
    return responseHandler.error(res, 'An account with this email address already exists', 409, 'DUPLICATE_USER');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await userModel.createUser({
    name,
    email,
    passwordHash,
    role: 'USER',
    accountType: 'FREE',
  });

  await auditModel.logAudit({
    userId: newUser.id,
    action: 'USER_REGISTRATION',
    details: { email: newUser.email, account_type: newUser.account_type },
    ipAddress: req.ip,
  });

  const token = jwt.sign(
    { userId: newUser.id, role: newUser.role, accountType: newUser.account_type },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const usageInfo = await usageModel.getUsageByUserId(newUser.id);

  return responseHandler.success(
    res,
    'User registered successfully',
    {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        account_type: newUser.account_type,
        usage: usageInfo,
      },
    },
    201
  );
}

// 2. User Login
async function handleLogin(req, res) {
  const validationErr = validators.validateLoginInput(req.body);
  if (validationErr) {
    return responseHandler.error(res, validationErr, 400, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;
  const user = await userModel.findByEmail(email);

  if (!user) {
    return responseHandler.error(res, 'Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return responseHandler.error(res, 'Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
  }

  await userModel.updateLastLogin(user.id);
  const usageInfo = await usageModel.getUsageByUserId(user.id);

  await auditModel.logAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    details: { email: user.email },
    ipAddress: req.ip,
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, accountType: user.account_type },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return responseHandler.success(res, 'Login successful', {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      ats_ccs_access: user.ats_ccs_access,
      usage: usageInfo,
    },
  });
}

// 3. Create Resume
async function handleCreateResume(req, res) {
  if (!req.user) {
    return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  // Server-side Usage Limit Check (MANDATORY SECTION 8 REQUIREMENT)
  const usage = await usageModel.getUsageByUserId(req.user.id);
  if (usage.resumes_count >= usage.max_resumes) {
    return responseHandler.error(
      res,
      `Resume creation limit reached (${usage.resumes_count}/${usage.max_resumes}). Upgrade to Premium for higher limits.`,
      403,
      'LIMIT_EXCEEDED'
    );
  }

  const newResume = await resumeModel.createResume(req.user.id, req.body);
  await usageModel.incrementResumesCount(req.user.id);

  // Sync snapshot to Google Drive
  const driveResult = await googleDriveService.uploadResumeFile({
    userId: req.user.id,
    resumeId: newResume.id,
    version: 1,
    fileBuffer: Buffer.from(JSON.stringify(newResume, null, 2), 'utf-8'),
    fileName: `${(newResume.title || 'Resume').replace(/\s+/g, '_')}.json`,
  });

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'RESUME_CREATE',
    details: { resume_id: newResume.id, title: newResume.title, drive_reference: driveResult.referenceCode },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'Resume created successfully', { resume: newResume, google_drive: driveResult }, 201);
}

// 4. Save Draft
async function handleSaveDraft(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const { resume_id } = req.body;

  if (!resume_id) {
    return responseHandler.error(res, 'resume_id parameter is required to save draft', 400, 'MISSING_PARAM');
  }

  const updated = await resumeModel.updateResume(resume_id, req.user.id, req.body);

  if (!updated) {
    return responseHandler.error(res, 'Resume not found or access denied', 404, 'NOT_FOUND');
  }

  return responseHandler.success(res, 'Draft saved successfully', { resume: updated });
}

// 5. Duplicate Resume
async function handleDuplicateResume(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const { resume_id } = req.body;

  if (!resume_id) {
    return responseHandler.error(res, 'resume_id parameter is required', 400, 'MISSING_PARAM');
  }

  const usage = await usageModel.getUsageByUserId(req.user.id);
  if (usage.resumes_count >= usage.max_resumes) {
    return responseHandler.error(
      res,
      `Resume limit reached (${usage.resumes_count}/${usage.max_resumes}). Cannot duplicate.`,
      403,
      'LIMIT_EXCEEDED'
    );
  }

  const copy = await resumeModel.duplicateResume(resume_id, req.user.id);
  if (!copy) {
    return responseHandler.error(res, 'Source resume not found', 404, 'NOT_FOUND');
  }

  await usageModel.incrementResumesCount(req.user.id);
  return responseHandler.success(res, 'Resume duplicated successfully', { resume: copy }, 201);
}

// 6. Upload Resume
async function handleUploadResume(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  if (!req.file) {
    return responseHandler.error(res, 'No uploaded resume document found in request', 400, 'NO_FILE_UPLOADED');
  }

  const purpose = req.body.purpose || 'IMPORT';
  const parsedData = await resumeParser.parseResumeFile(req.file.path, req.file.originalname, req.file.mimetype);

  if (purpose === 'IMPORT') {
    const usage = await usageModel.getUsageByUserId(req.user.id);
    if (usage.resumes_count >= usage.max_resumes) {
      return responseHandler.error(res, `Resume limit reached (${usage.resumes_count}/${usage.max_resumes}). Cannot import file.`, 403, 'LIMIT_EXCEEDED');
    }

    const created = await resumeModel.createResume(req.user.id, {
      title: parsedData.parsed_title,
      template_id: 'modern_clean',
      sections: parsedData.sections,
    });
    await usageModel.incrementResumesCount(req.user.id);
    return responseHandler.success(res, 'Resume imported and created successfully', { resume: created, parsed_preview: parsedData }, 201);
  }

  return responseHandler.success(res, 'Resume parsed for ATS analysis', { parsed_data: parsedData });
}

// 7. Analyze Resume (ATS + CCS Pipeline)
async function handleAnalyzeResume(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  // Verify Admin ATS/CCS authorization password (SECTION 19 REQUIREMENT)
  const atsPassword =
    req.body?.ats_password ||
    req.body?.atsPassword ||
    req.body?.ats_ccs_password ||
    req.body?.atsCCSPassword ||
    req.query?.ats_password ||
    req.query?.atsPassword ||
    req.headers['x-ats-password'] ||
    req.headers['x-ats-ccs-password'] ||
    req.headers['ats-password'];
  const userHasAccess = Boolean(req.user.ats_ccs_access || req.user.role === 'ADMIN');

  if (atsPassword) {
    const isPasswordValid = env.verifyATSPassword(atsPassword);
    if (!isPasswordValid) {
      return responseHandler.error(res, 'Invalid administrator ATS/CCS password', 403, 'INVALID_ATS_PASSWORD');
    }
    // Update user access status in DB if not already set
    if (!req.user.ats_ccs_access) {
      await userModel.updateATSCCSAccess(req.user.id, true);
      req.user.ats_ccs_access = true;
    }
  } else if (!userHasAccess) {
    return responseHandler.error(
      res,
      'Administrator ATS/CCS password is required to run analysis',
      403,
      'ATS_PASSWORD_REQUIRED'
    );
  }

  const { resume_id, target_job_title, target_job_description, resume_data } = req.body;

  // If this request was just to verify password authorization from modal (no resume_id and no resume_data)
  if (!resume_id && !resume_data) {
    return responseHandler.success(res, 'ATS & CCS Authorization Granted', { authorized: true });
  }

  let resumeRecord = null;
  if (resume_id) {
    resumeRecord = await resumeModel.getResumeById(resume_id, req.user.id);
    if (!resumeRecord) {
      return responseHandler.error(
        res,
        'Resume not found for the authenticated user.',
        404,
        'RESUME_NOT_FOUND'
      );
    }
  }

  const rawResume = resumeRecord || resume_data;
  const normalizedResume = normalizeResume(rawResume);

  if (isResumeEmpty(normalizedResume)) {
    return responseHandler.error(
      res,
      'Resume contains no content. Please add sections before running analysis.',
      400,
      'RESUME_EMPTY'
    );
  }

  // Safe operational debug logging (No passwords, secrets, or raw resume blobs logged)
  const safeDebugMetrics = {
    resumeId: normalizedResume.id || resume_id,
    userId: req.user.id,
    hasResumeContent: !isResumeEmpty(normalizedResume),
    skillsCount: (normalizedResume.skills?.frontend?.length || 0) + (normalizedResume.skills?.backend?.length || 0),
    experienceCount: normalizedResume.experience?.length || 0,
    educationCount: normalizedResume.education?.length || 0,
    projectCount: normalizedResume.projects?.length || 0,
    certificationCount: normalizedResume.certifications?.length || 0,
  };
  const logger = require('../utils/logger');
  logger.info(`[ATS_CCS_ANALYSIS] Initiating evaluation for user ${req.user.id}`, safeDebugMetrics);

  const idempotencyKey = `ATSCCS-${req.user.id}-${resume_id || 'UPLOAD'}-${Date.now()}`;
  const analysisResult = await resumeAIService.analyzeResume(normalizedResume, target_job_title, target_job_description, idempotencyKey);

  // Save to DB
  const savedReport = await analysisModel.createAnalysis({
    userId: req.user.id,
    resumeId: resume_id || normalizedResume.id || null,
    targetJobTitle: target_job_title || normalizedResume.target_role || 'Software Engineer',
    targetJobDescription: target_job_description,
    atsScore: analysisResult.ats_score,
    ccsScore: analysisResult.ccs_score,
    overallStatus: analysisResult.overall_status,
    isApproved: analysisResult.is_approved,
    parameters: analysisResult.parameters,
    rawAnalysis: analysisResult,
  });

  // Sync report to Google Drive Report Folder
  const driveResult = await googleDriveService.uploadReportFile({
    userId: req.user.id,
    resumeId: resume_id || normalizedResume.id,
    analysisId: savedReport.id,
    reportData: savedReport,
  });

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'ATS_CCS_ANALYSIS',
    details: { analysis_id: savedReport.id, reference_code: savedReport.reference_code, drive_reference: driveResult.referenceCode },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'ATS + CCS Analysis completed successfully', { report: savedReport, google_drive: driveResult });
}

// 8. Search Jobs
async function handleSearchJobs(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const { target_role, location, skills, experience_years } = req.body;

  const searchId = await jobModel.createJobSearch(req.user.id, target_role || 'Software Engineer', location || '', { skills, experience_years });
  const discoveredJobs = await jobAIService.searchJobs({ targetRole: target_role, location, skills, experienceYears: experience_years });

  const jobMatches = [];
  for (const job of discoveredJobs) {
    const savedJobId = await jobModel.saveJob({
      jobSource: job.job_source,
      sourceJobId: job.source_job_id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobUrl: job.job_url,
      jobDescription: job.job_description,
    });

    const matchId = await jobModel.createJobMatch({
      userId: req.user.id,
      resumeId: req.body.resume_id || 'DEFAULT',
      jobId: savedJobId,
      searchId,
      matchScore: job.match_score,
      matchingSkills: job.matching_skills,
      missingSkills: job.missing_skills,
      relevanceSummary: job.job_description,
    });

    jobMatches.push({
      match_id: matchId,
      job_id: savedJobId,
      ...job,
    });
  }

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'JOB_SEARCH',
    details: { search_id: searchId, query: target_role, results_count: jobMatches.length },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'Job discovery search completed', { search_id: searchId, matches: jobMatches });
}

// 9. Optimize Resume For Job
async function handleOptimizeResumeForJob(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const usage = await usageModel.getUsageByUserId(req.user.id);
  if (usage.job_optimizations_count >= usage.max_job_optimizations) {
    return responseHandler.error(
      res,
      `Job-description optimization limit reached (${usage.job_optimizations_count}/${usage.max_job_optimizations}). Upgrade account for unlimited optimizations.`,
      403,
      'LIMIT_EXCEEDED'
    );
  }

  const { resume_id, job_description } = req.body;
  if (!resume_id || !job_description) {
    return responseHandler.error(res, 'resume_id and job_description parameters are required', 400, 'MISSING_PARAM');
  }

  const resume = await resumeModel.getResumeById(resume_id, req.user.id);
  if (!resume) {
    return responseHandler.error(res, 'Resume not found', 404, 'NOT_FOUND');
  }

  const optimization = await resumeAIService.optimizeResume(resume, job_description);
  await usageModel.incrementJobOptimizationsCount(req.user.id);

  const optId = await jobModel.saveOptimization({
    userId: req.user.id,
    resumeId: resume.id,
    optimizedResumeJson: optimization.optimized_resume || optimization,
    changesSummary: optimization.changes_summary || { wording_improvements: 'Optimized bullets and keywords' },
  });

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'RESUME_OPTIMIZE_JOB',
    details: { optimization_id: optId, resume_id: resume.id },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'Resume optimization completed', { optimization_id: optId, result: optimization });
}

// 10. Generate HR Email
async function handleGenerateHREmail(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const usage = await usageModel.getUsageByUserId(req.user.id);
  if (usage.ai_emails_count >= usage.max_ai_emails) {
    return responseHandler.error(
      res,
      `AI HR email generation limit reached (${usage.ai_emails_count}/${usage.max_ai_emails}). Upgrade account for higher limits.`,
      403,
      'LIMIT_EXCEEDED'
    );
  }

  const { job_title, company_name, recruiter_info, job_description, resume_id } = req.body;
  if (!job_title || !company_name) {
    return responseHandler.error(res, 'job_title and company_name parameters are required', 400, 'MISSING_PARAM');
  }

  let resumeData = {};
  if (resume_id) {
    resumeData = await resumeModel.getResumeById(resume_id, req.user.id);
  }

  const emailResult = await jobAIService.generateHREmail({ jobTitle: job_title, companyName: company_name, recruiterInfo: recruiter_info, jobDescription: job_description, resumeData });
  await usageModel.incrementAIEmailsCount(req.user.id);

  const savedEmailId = await jobModel.saveGeneratedEmail({
    userId: req.user.id,
    resumeId: resume_id,
    companyName: company_name,
    jobTitle: job_title,
    recruiterInfo: recruiter_info,
    content: JSON.stringify(emailResult),
  });

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'GENERATE_HR_EMAIL',
    details: { email_id: savedEmailId, company: company_name },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'AI HR Application Email generated successfully', { email_id: savedEmailId, email: emailResult });
}

// 11. Sync Google Drive
async function handleSyncGoogleDrive(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const { resume_id } = req.body;

  const resume = await resumeModel.getResumeById(resume_id, req.user.id);
  if (!resume) return responseHandler.error(res, 'Resume not found', 404, 'NOT_FOUND');

  const driveResult = await googleDriveService.uploadResumeFile({
    userId: req.user.id,
    resumeId: resume.id,
    version: resume.current_version,
    fileBuffer: Buffer.from(JSON.stringify(resume, null, 2), 'utf-8'),
    fileName: `${resume.title.replace(/\s+/g, '_')}_v${resume.current_version}.json`,
  });

  return responseHandler.success(res, 'Google Drive sync completed', { google_drive: driveResult });
}

// 12. Generate Resume PDF & Store
async function handleGenerateResumePDF(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const { resume_id, resume_data, template_id, template } = req.body;
  const activeTemplate = template_id || template || 'modern_clean';

  let resumeToProcess = null;

  if (resume_id) {
    if (resume_data) {
      await resumeModel.updateResume(resume_id, req.user.id, resume_data);
    }
    resumeToProcess = await resumeModel.getResumeById(resume_id, req.user.id);
  } else if (resume_data) {
    resumeToProcess = normalizeResume(resume_data);
  }

  if (!resumeToProcess) {
    return responseHandler.error(res, 'Resume content or valid resume_id is required', 400, 'RESUME_ID_MISSING');
  }

  try {
    const pdfBuffer = await pdfGeneratorService.generateResumePDF(resumeToProcess, activeTemplate);
    const titleClean = (resumeToProcess.title || resumeToProcess.personalInfo?.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${titleClean}_${activeTemplate}.pdf`;

    const driveResult = await googleDriveService.uploadResumeFile({
      userId: req.user.id,
      resumeId: resumeToProcess.id || resume_id,
      version: resumeToProcess.current_version || 1,
      fileBuffer: pdfBuffer,
      fileName,
      mimeType: 'application/pdf',
    });

    const fileRecord = await driveModel.getDriveFileByResumeId(resumeToProcess.id || resume_id, req.user.id);

    return responseHandler.success(res, 'Resume PDF generated and stored successfully', {
      file_id: fileRecord?.id,
      drive_file_id: driveResult.driveFileId,
      file_name: driveResult.fileName,
      reference_code: driveResult.referenceCode,
      resume_id: resumeToProcess.id,
      version: resumeToProcess.current_version || 1,
      template: activeTemplate,
      size_bytes: pdfBuffer.length,
    });
  } catch (err) {
    return responseHandler.error(res, `Unable to generate resume PDF: ${err.message}`, 500, 'RESUME_PDF_GENERATION_FAILED');
  }
}

// 13. Download Stored Resume PDF
async function handleDownloadResumeFile(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const fileId = req.query.file_id || req.body?.file_id;
  const resumeId = req.query.resume_id || req.body?.resume_id;

  let fileRecord = null;
  if (fileId) {
    fileRecord = await driveModel.getDriveFileById(fileId, req.user.id);
  } else if (resumeId) {
    fileRecord = await driveModel.getDriveFileByResumeId(resumeId, req.user.id);
  }

  if (!fileRecord && resumeId) {
    const resume = await resumeModel.getResumeById(resumeId, req.user.id);
    if (resume) {
      const pdfBuffer = await pdfGeneratorService.generateResumePDF(resume, resume.template_id || 'modern_clean');
      const titleClean = (resume.title || resume.personalInfo?.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${titleClean}.pdf`;
      await googleDriveService.uploadResumeFile({
        userId: req.user.id,
        resumeId: resume.id,
        version: resume.current_version || 1,
        fileBuffer: pdfBuffer,
        fileName,
        mimeType: 'application/pdf',
      });
      fileRecord = await driveModel.getDriveFileByResumeId(resumeId, req.user.id);
    }
  }

  if (!fileRecord || fileRecord.user_id !== req.user.id) {
    return responseHandler.error(res, 'File not found or access denied', 403, 'FILE_NOT_OWNED');
  }

  let fileBuffer = await googleDriveService.getResumeFileBuffer({
    userId: req.user.id,
    driveFileId: fileRecord.drive_file_id,
    fileName: fileRecord.file_name,
  });

  if (!fileBuffer && fileRecord.resume_id) {
    const resume = await resumeModel.getResumeById(fileRecord.resume_id, req.user.id);
    if (resume) {
      fileBuffer = await pdfGeneratorService.generateResumePDF(resume, resume.template_id || 'modern_clean');
    }
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    return responseHandler.error(res, 'PDF file content unavailable', 404, 'PDF_CONTENT_MISSING');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.file_name || 'Resume.pdf'}"`);
  res.setHeader('Content-Length', fileBuffer.length);
  return res.send(fileBuffer);
}

module.exports = {
  handlePost,
};
