const responseHandler = require('../utils/responseHandler');
const resumeModel = require('../models/resumeModel');
const userModel = require('../models/userModel');
const usageModel = require('../models/usageModel');
const auditModel = require('../models/auditModel');
const googleDriveService = require('../services/googleDrive/googleDriveService');

async function handleUpdate(req, res, next) {
  try {
    const action = req.body?.action || req.query?.action || req.headers['x-action'];

    if (!action) {
      return responseHandler.error(res, 'Action parameter missing in UPDATE request', 400, 'ACTION_REQUIRED');
    }

    switch (action) {
      case 'updateResume':
        return await handleUpdateResume(req, res);

      case 'updateUserProfile':
        return await handleUpdateUserProfile(req, res);

      case 'grantATSCCS':
        return await handleGrantATSCCS(req, res);

      case 'updateUsageLimits':
        return await handleUpdateUsageLimits(req, res);

      default:
        return responseHandler.error(res, `Unknown UPDATE action: ${action}`, 400, 'INVALID_ACTION');
    }
  } catch (err) {
    next(err);
  }
}

async function handleUpdateResume(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const { resume_id } = req.body;
  if (!resume_id) {
    return responseHandler.error(res, 'resume_id parameter is required', 400, 'MISSING_PARAM');
  }

  const updatedResume = await resumeModel.updateResume(resume_id, req.user.id, req.body);

  if (!updatedResume) {
    return responseHandler.error(res, 'Resume not found or access denied', 404, 'NOT_FOUND');
  }

  // Upload updated version to Google Drive
  const driveResult = await googleDriveService.uploadResumeFile({
    userId: req.user.id,
    resumeId: updatedResume.id,
    version: updatedResume.current_version,
    fileBuffer: Buffer.from(JSON.stringify(updatedResume, null, 2), 'utf-8'),
    fileName: `${updatedResume.title.replace(/\s+/g, '_')}_v${updatedResume.current_version}.json`,
  });

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'RESUME_UPDATE',
    details: { resume_id: updatedResume.id, new_version: updatedResume.current_version, drive_reference: driveResult.referenceCode },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'Resume updated successfully and new version created', {
    resume: updatedResume,
    google_drive: driveResult,
  });
}

async function handleUpdateUserProfile(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const { name } = req.body;
  if (name) {
    const db = require('../database/db');
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
  }

  const updatedUser = await userModel.findById(req.user.id);
  return responseHandler.success(res, 'User profile updated', { user: updatedUser });
}

async function handleGrantATSCCS(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return responseHandler.error(res, 'Admin privileges required', 403, 'FORBIDDEN');
  }

  const { target_user_id, grant } = req.body;
  if (!target_user_id) {
    return responseHandler.error(res, 'target_user_id parameter is required', 400, 'MISSING_PARAM');
  }

  await userModel.updateATSCCSAccess(target_user_id, Boolean(grant));

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'ADMIN_GRANT_ATS_CCS',
    details: { target_user_id, granted: Boolean(grant) },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, `ATS/CCS access ${grant ? 'granted' : 'revoked'} for user`);
}

async function handleUpdateUsageLimits(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return responseHandler.error(res, 'Admin privileges required', 403, 'FORBIDDEN');
  }

  const { target_user_id, resumes_count, job_optimizations_count, ai_emails_count, ats_ccs_access_granted } = req.body;
  if (!target_user_id) {
    return responseHandler.error(res, 'target_user_id parameter is required', 400, 'MISSING_PARAM');
  }

  await usageModel.updateUsageLimits(target_user_id, {
    resumes_count,
    job_optimizations_count,
    ai_emails_count,
    ats_ccs_access_granted,
  });

  return responseHandler.success(res, 'User usage limits updated by Admin');
}

module.exports = {
  handleUpdate,
};
