/**
 * Centralized Logging Utility
 */
const env = require('../config/env');

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`.trim();
}

const logger = {
  info: (msg, meta) => {
    console.log(formatMessage('info', msg, meta));
  },
  warn: (msg, meta) => {
    console.warn(formatMessage('warn', msg, meta));
  },
  error: (msg, meta) => {
    console.error(formatMessage('error', msg, meta));
  },
  debug: (msg, meta) => {
    if (env.NODE_ENV !== 'production') {
      console.log(formatMessage('debug', msg, meta));
    }
  },
};

module.exports = logger;
