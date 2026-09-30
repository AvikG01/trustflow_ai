const jwt = require('jsonwebtoken');
const env = require('../config/env');
const responseHandler = require('../utils/responseHandler');
const userModel = require('../models/userModel');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query.token;

  if (!token) {
    return responseHandler.error(res, 'Authentication token missing or invalid', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return responseHandler.error(res, 'User associated with token no longer exists', 401, 'UNAUTHORIZED');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      ats_ccs_access: user.ats_ccs_access,
    };
    next();
  } catch (err) {
    return responseHandler.error(res, 'Invalid or expired authentication token', 401, 'UNAUTHORIZED');
  }
}

module.exports = authenticateToken;
