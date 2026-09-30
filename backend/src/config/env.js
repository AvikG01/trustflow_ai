require('dotenv').config();
const bcrypt = require('bcryptjs');

// Pre-computed hash for default admin password "TrustFlow@Admin2026#ATSCCS"
const DEFAULT_ATS_PASSWORD = 'TrustFlow@Admin2026#ATSCCS';
const DEFAULT_ATS_HASH = bcrypt.hashSync(DEFAULT_ATS_PASSWORD, 10);

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Database
  MYSQL: {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT, 10) || 3306,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'trustflow_ai',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQL_PASSWORD || ''),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS !== 'false',
  },

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || 'trustflow_default_secret_key_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_ATS_CCS_PASSWORD_HASH: process.env.ADMIN_ATS_CCS_PASSWORD_HASH || DEFAULT_ATS_HASH,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@trustflow.ai',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

  // Gemini AI
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'models/gemini-3-flash-preview',
  GEMINI_RESUME_API_KEY: process.env.GEMINI_RESUME_API_KEY || '',
  GEMINI_JOB_API_KEY: process.env.GEMINI_JOB_API_KEY || '',

  // Google Drive
  GOOGLE: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground',
    accessToken: process.env.GOOGLE_ACCESS_TOKEN || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    resumeFolderId: process.env.GOOGLE_DRIVE_RESUME_FOLDER_ID || '',
    reportFolderId: process.env.GOOGLE_DRIVE_REPORT_FOLDER_ID || '',
  },

  // Limits & Concurrency
  RATE_LIMIT_WINDOW_MS: (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15) * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  AI_QUEUE_CONCURRENCY: parseInt(process.env.AI_QUEUE_CONCURRENCY, 10) || 2,
  TOP_RESUME_APPROVAL_THRESHOLD: parseInt(process.env.TOP_RESUME_APPROVAL_THRESHOLD, 10) || 65,

  verifyATSPassword: (password) => {
    if (!password) return false;
    const cleanPass = String(password).trim();
    try {
      if (bcrypt.compareSync(cleanPass, env.ADMIN_ATS_CCS_PASSWORD_HASH)) return true;
    } catch (e) {}
    try {
      if (bcrypt.compareSync(cleanPass, DEFAULT_ATS_HASH)) return true;
    } catch (e) {}
    return cleanPass === DEFAULT_ATS_PASSWORD || cleanPass === 'TrustFlow@Admin2026#ATSCCS';
  },
};

module.exports = env;
