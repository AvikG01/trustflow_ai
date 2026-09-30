const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function logAudit({ userId = null, action, details = {}, ipAddress = null }) {
  const id = uuidv4();
  // Filter out any passwords/secrets if passed in details
  const cleanDetails = { ...details };
  delete cleanDetails.password;
  delete cleanDetails.password_hash;
  delete cleanDetails.ats_password;
  delete cleanDetails.jwt;

  try {
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, details_json, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, userId, action, JSON.stringify(cleanDetails), ipAddress || '127.0.0.1']
    );
  } catch (err) {
    console.error('Audit Logging Error:', err.message);
  }
}

async function getAuditLogs(limit = 100) {
  return await db.query(
    `SELECT id, user_id, action, details_json, ip_address, created_at
     FROM audit_logs ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
}

module.exports = {
  logAudit,
  getAuditLogs,
};
