const responseHandler = require('../utils/responseHandler');
const userModel = require('../models/userModel');
const usageModel = require('../models/usageModel');
const resumeModel = require('../models/resumeModel');
const analysisModel = require('../models/analysisModel');
const jobModel = require('../models/jobModel');
const driveModel = require('../models/driveModel');
const auditModel = require('../models/auditModel');
const { RESUME_TEMPLATES } = require('../config/constants');
const googleDriveService = require('../services/googleDrive/googleDriveService');
const pdfGeneratorService = require('../services/pdf/pdfGeneratorService');

async function handleGet(req, res, next) {
  try {
    const action = req.query.action || req.body?.action || req.headers['x-action'];

    if (!action) {
      return responseHandler.error(res, 'Action parameter missing in GET request', 400, 'ACTION_REQUIRED');
    }

    switch (action) {
      case 'getProfile':
        return await handleGetProfile(req, res);

      case 'getResumes':
        return await handleGetResumes(req, res);

      case 'getResume':
        return await handleGetResume(req, res);

      case 'getResumeVersions':
        return await handleGetResumeVersions(req, res);

      case 'getResumeVersion':
        return await handleGetResumeVersion(req, res);

      case 'getAnalysis':
        return await handleGetAnalysis(req, res);

      case 'getAnalysisHistory':
        return await handleGetAnalysisHistory(req, res);

      case 'getJobSearches':
        return await handleGetJobSearches(req, res);

      case 'getJobMatches':
        return await handleGetJobMatches(req, res);

      case 'getDriveFiles':
        return await handleGetDriveFiles(req, res);

      case 'downloadResumeFile':
      case 'download_resume_file':
        return await handleDownloadResumeFile(req, res);

      case 'getUsageLimits':
        return await handleGetUsageLimits(req, res);

      case 'getResumeTemplates':
        return responseHandler.success(res, 'Resume templates retrieved', { templates: RESUME_TEMPLATES });

      case 'getAdminUsers':
        return await handleGetAdminUsers(req, res);

      case 'getAdminAuditLogs':
        return await handleGetAdminAuditLogs(req, res);

      case 'getAdminStats':
        return await handleGetAdminStats(req, res);

      default:
        return responseHandler.error(res, `Unknown GET action: ${action}`, 400, 'INVALID_ACTION');
    }
  } catch (err) {
    next(err);
  }
}

async function handleGetProfile(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const user = await userModel.findById(req.user.id);
  const usage = await usageModel.getUsageByUserId(req.user.id);
  return responseHandler.success(res, 'Profile retrieved', { user, usage });
}

async function handleGetResumes(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const resumes = await resumeModel.getResumesByUserId(req.user.id);
  return responseHandler.success(res, 'Resumes retrieved', { resumes });
}

async function handleGetResume(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const resumeId = req.query.resume_id || req.body?.resume_id;

  if (!resumeId) return responseHandler.error(res, 'resume_id parameter is required', 400, 'MISSING_PARAM');

  const resume = await resumeModel.getResumeById(resumeId, req.user.id);
  if (!resume) return responseHandler.error(res, 'Resume not found', 404, 'NOT_FOUND');

  return responseHandler.success(res, 'Resume details retrieved', { resume });
}

async function handleGetResumeVersions(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const resumeId = req.query.resume_id || req.body?.resume_id;

  if (!resumeId) return responseHandler.error(res, 'resume_id parameter is required', 400, 'MISSING_PARAM');

  const versions = await resumeModel.getResumeVersions(resumeId, req.user.id);
  if (!versions) return responseHandler.error(res, 'Resume not found', 404, 'NOT_FOUND');

  return responseHandler.success(res, 'Resume version history retrieved', { versions });
}

async function handleGetResumeVersion(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const resumeId = req.query.resume_id || req.body?.resume_id;
  const versionNum = parseInt(req.query.version || req.body?.version || 1, 10);

  if (!resumeId) return responseHandler.error(res, 'resume_id parameter is required', 400, 'MISSING_PARAM');

  const versionDetail = await resumeModel.getResumeVersionDetail(resumeId, versionNum, req.user.id);
  if (!versionDetail) return responseHandler.error(res, 'Resume version snapshot not found', 404, 'NOT_FOUND');

  return responseHandler.success(res, 'Resume version snapshot retrieved', { version: versionDetail });
}

async function handleGetAnalysis(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const analysisId = req.query.analysis_id || req.body?.analysis_id;

  if (!analysisId) return responseHandler.error(res, 'analysis_id parameter is required', 400, 'MISSING_PARAM');

  const report = await analysisModel.getAnalysisById(analysisId, req.user.id);
  if (!report) return responseHandler.error(res, 'Analysis report not found', 404, 'NOT_FOUND');

  return responseHandler.success(res, 'Analysis report retrieved', { report });
}

async function handleGetAnalysisHistory(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const history = await analysisModel.getAnalysisHistoryByUserId(req.user.id);
  return responseHandler.success(res, 'Analysis history retrieved', { history });
}

async function handleGetJobSearches(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const searches = await jobModel.getJobSearchesByUserId(req.user.id);
  return responseHandler.success(res, 'Job searches retrieved', { searches });
}

async function handleGetJobMatches(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const matches = await jobModel.getJobMatchesByUserId(req.user.id);
  return responseHandler.success(res, 'Job matches retrieved', { matches });
}

async function handleGetDriveFiles(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const files = await driveModel.getDriveFilesByUserId(req.user.id);
  return responseHandler.success(res, 'Google Drive files retrieved', { files });
}

async function handleGetUsageLimits(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
  const usage = await usageModel.getUsageByUserId(req.user.id);
  return responseHandler.success(res, 'Usage limits retrieved', { usage });
}

// Admin handlers
async function handleGetAdminUsers(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') return responseHandler.error(res, 'Admin privileges required', 403, 'FORBIDDEN');
  const users = await userModel.getAllUsers();
  return responseHandler.success(res, 'Admin: Users list retrieved', { users });
}

async function handleGetAdminAuditLogs(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') return responseHandler.error(res, 'Admin privileges required', 403, 'FORBIDDEN');
  const limit = parseInt(req.query.limit || 100, 10);
  const logs = await auditModel.getAuditLogs(limit);
  return responseHandler.success(res, 'Admin: Audit logs retrieved', { logs });
}

async function handleGetAdminStats(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') return responseHandler.error(res, 'Admin privileges required', 403, 'FORBIDDEN');
  const users = await userModel.getAllUsers();
  const logs = await auditModel.getAuditLogs(10);
  return responseHandler.success(res, 'Admin: System statistics retrieved', {
    total_users: users.length,
    free_users: users.filter((u) => u.account_type === 'FREE').length,
    premium_users: users.filter((u) => u.account_type === 'PREMIUM').length,
    recent_activity: logs,
  });
}

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
  handleGet,
};
