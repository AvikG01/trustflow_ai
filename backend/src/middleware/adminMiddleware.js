const responseHandler = require('../utils/responseHandler');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return responseHandler.error(res, 'Access denied. Administrator privileges required.', 403, 'FORBIDDEN');
  }
  next();
}

module.exports = requireAdmin;
