const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function findByEmail(email) {
  const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return users && users.length > 0 ? users[0] : null;
}

async function findById(id) {
  const users = await db.query(
    'SELECT id, name, email, role, account_type, ats_ccs_access, last_login, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return users && users.length > 0 ? users[0] : null;
}

async function createUser({ name, email, passwordHash, role = 'USER', accountType = 'FREE' }) {
  const id = uuidv4();
  await db.query(
    `INSERT INTO users (id, name, email, password_hash, role, account_type, ats_ccs_access, created_at)
     VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())`,
    [id, name, email, passwordHash, role, accountType]
  );

  // Initialize usage limits table
  const usageId = uuidv4();
  await db.query(
    `INSERT INTO usage_limits (id, user_id, resumes_count, job_optimizations_count, ai_emails_count, ats_ccs_access_granted)
     VALUES (?, ?, 0, 0, 0, FALSE)`,
    [usageId, id]
  );

  return findById(id);
}

async function updateLastLogin(id) {
  await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
}

async function updateATSCCSAccess(userId, granted = true) {
  await db.query('UPDATE users SET ats_ccs_access = ? WHERE id = ?', [granted, userId]);
  await db.query('UPDATE usage_limits SET ats_ccs_access_granted = ? WHERE user_id = ?', [granted, userId]);
}

async function getAllUsers() {
  return await db.query(
    'SELECT id, name, email, role, account_type, ats_ccs_access, last_login, created_at FROM users ORDER BY created_at DESC'
  );
}

async function deleteUser(id) {
  return await db.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateLastLogin,
  updateATSCCSAccess,
  getAllUsers,
  deleteUser,
};
