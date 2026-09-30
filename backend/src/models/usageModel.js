const db = require('../database/db');
const { DEFAULT_LIMITS } = require('../config/constants');

async function getUsageByUserId(userId) {
  const rows = await db.query(
    `SELECT u.account_type, u.ats_ccs_access, ul.resumes_count, ul.job_optimizations_count, ul.ai_emails_count, ul.ats_ccs_access_granted
     FROM users u
     LEFT JOIN usage_limits ul ON u.id = ul.user_id
     WHERE u.id = ?`,
    [userId]
  );

  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  const accountType = row.account_type || 'FREE';
  const limits = DEFAULT_LIMITS[accountType] || DEFAULT_LIMITS.FREE;

  return {
    account_type: accountType,
    resumes_count: row.resumes_count || 0,
    max_resumes: limits.MAX_RESUMES,
    job_optimizations_count: row.job_optimizations_count || 0,
    max_job_optimizations: limits.MAX_JOB_OPTIMIZATIONS,
    ai_emails_count: row.ai_emails_count || 0,
    max_ai_emails: limits.MAX_AI_EMAILS,
    ats_ccs_access: Boolean(row.ats_ccs_access || row.ats_ccs_access_granted),
  };
}

async function incrementResumesCount(userId) {
  await db.query('UPDATE usage_limits SET resumes_count = resumes_count + 1 WHERE user_id = ?', [userId]);
}

async function decrementResumesCount(userId) {
  await db.query('UPDATE usage_limits SET resumes_count = GREATEST(0, resumes_count - 1) WHERE user_id = ?', [userId]);
}

async function incrementJobOptimizationsCount(userId) {
  await db.query('UPDATE usage_limits SET job_optimizations_count = job_optimizations_count + 1 WHERE user_id = ?', [userId]);
}

async function incrementAIEmailsCount(userId) {
  await db.query('UPDATE usage_limits SET ai_emails_count = ai_emails_count + 1 WHERE user_id = ?', [userId]);
}

async function updateUsageLimits(userId, { resumes_count, job_optimizations_count, ai_emails_count, ats_ccs_access_granted }) {
  await db.query(
    `UPDATE usage_limits
     SET resumes_count = COALESCE(?, resumes_count),
         job_optimizations_count = COALESCE(?, job_optimizations_count),
         ai_emails_count = COALESCE(?, ai_emails_count),
         ats_ccs_access_granted = COALESCE(?, ats_ccs_access_granted)
     WHERE user_id = ?`,
    [resumes_count, job_optimizations_count, ai_emails_count, ats_ccs_access_granted, userId]
  );
}

module.exports = {
  getUsageByUserId,
  incrementResumesCount,
  decrementResumesCount,
  incrementJobOptimizationsCount,
  incrementAIEmailsCount,
  updateUsageLimits,
};
