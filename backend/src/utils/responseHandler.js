/**
 * Standard API Response Utilities for TrustFlow AI Backend
 */

function success(res, message = 'Success', data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function error(res, message = 'An error occurred', statusCode = 400, errorCode = 'BAD_REQUEST', details = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
  });
}

module.exports = {
  success,
  error,
};
