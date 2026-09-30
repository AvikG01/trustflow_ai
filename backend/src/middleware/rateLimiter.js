const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const responseHandler = require('../utils/responseHandler');

const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return responseHandler.error(
      res,
      'Too many requests received from this IP. Please try again later.',
      429,
      'TOO_MANY_REQUESTS'
    );
  },
});

module.exports = {
  globalRateLimiter,
};
