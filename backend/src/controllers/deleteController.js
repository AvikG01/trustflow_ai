const responseHandler = require('../utils/responseHandler');
const resumeModel = require('../models/resumeModel');
const analysisModel = require('../models/analysisModel');
const userModel = require('../models/userModel');
const usageModel = require('../models/usageModel');
const auditModel = require('../models/auditModel');

async function handleDelete(req, res, next) {
  try {
    const action = req.query?.action || req.body?.action || req.headers['x-action'];

    if (!action) {
      return responseHandler.error(res, 'Action parameter missing in DELETE request', 400, 'ACTION_REQUIRED');
    }

    switch (action) {
      case 'deleteResume':
        return await handleDeleteResume(req, res);

      case 'deleteAnalysis':
        return await handleDeleteAnalysis(req, res);

      case 'deleteUser':
        return await handleDeleteUser(req, res);

      default:
        return responseHandler.error(res, `Unknown DELETE action: ${action}`, 400, 'INVALID_ACTION');
    }
  } catch (err) {
    next(err);
  }
}

async function handleDeleteResume(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const resumeId = req.query?.resume_id || req.body?.resume_id;
  if (!resumeId) {
    return responseHandler.error(res, 'resume_id parameter is required', 400, 'MISSING_PARAM');
  }

  const success = await resumeModel.deleteResume(resumeId, req.user.id);
  if (!success) {
    return responseHandler.error(res, 'Resume not found or access denied', 404, 'NOT_FOUND');
  }

  await usageModel.decrementResumesCount(req.user.id);

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'RESUME_DELETE',
    details: { resume_id: resumeId },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'Resume deleted successfully');
}

async function handleDeleteAnalysis(req, res) {
  if (!req.user) return responseHandler.error(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const analysisId = req.query?.analysis_id || req.body?.analysis_id;
  if (!analysisId) {
    return responseHandler.error(res, 'analysis_id parameter is required', 400, 'MISSING_PARAM');
  }

  const success = await analysisModel.deleteAnalysis(analysisId, req.user.id);
  if (!success) {
    return responseHandler.error(res, 'Analysis report not found or access denied', 404, 'NOT_FOUND');
  }

  return responseHandler.success(res, 'Analysis report deleted successfully');
}

async function handleDeleteUser(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return responseHandler.error(res, 'Admin privileges required', 403, 'FORBIDDEN');
  }

  const targetUserId = req.query?.target_user_id || req.body?.target_user_id;
  if (!targetUserId) {
    return responseHandler.error(res, 'target_user_id parameter is required', 400, 'MISSING_PARAM');
  }

  await userModel.deleteUser(targetUserId);

  await auditModel.logAudit({
    userId: req.user.id,
    action: 'ADMIN_DELETE_USER',
    details: { target_user_id: targetUserId },
    ipAddress: req.ip,
  });

  return responseHandler.success(res, 'User account deleted by Admin');
}

module.exports = {
  handleDelete,
};
