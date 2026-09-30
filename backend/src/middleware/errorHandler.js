const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.isOperational ? err.message : 'An unexpected internal server error occurred';

  const details = env.NODE_ENV === 'development' ? { stack: err.stack } : {};

  return responseHandler.error(res, message, statusCode, errorCode, details);
}

module.exports = errorHandler;
