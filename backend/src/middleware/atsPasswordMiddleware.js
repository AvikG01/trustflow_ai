const env = require('../config/env');
const responseHandler = require('../utils/responseHandler');

function verifyATSPassword(req, res, next) {
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
  const userHasAccess = Boolean(req.user && (req.user.ats_ccs_access || req.user.role === 'ADMIN'));

  if (atsPassword) {
    const isMatch = env.verifyATSPassword(atsPassword);
    if (!isMatch) {
      return responseHandler.error(
        res,
        'Invalid administrator ATS/CCS authorization password',
        403,
        'INVALID_ATS_PASSWORD'
      );
    }
    return next();
  }

  if (!userHasAccess) {
    return responseHandler.error(
      res,
      'Administrator ATS/CCS password is required to execute analysis',
      403,
      'ATS_PASSWORD_REQUIRED',
      { hint: 'Please provide administrator-controlled ATS/CCS password' }
    );
  }

  next();
}

module.exports = verifyATSPassword;
