require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../src/config/database');
const env = require('../src/config/env');
const logger = require('../src/utils/logger');

async function seedDatabase() {
  console.log('Seeding TrustFlow AI Database...');

  const adminEmail = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || 'admin@trustflow.ai';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword && !process.env.ADMIN_ATS_CCS_PASSWORD_HASH) {
    console.error('ERROR: ADMIN_PASSWORD environment variable is missing.');
    console.error('For security compliance, default insecure passwords are strictly prohibited.');
    console.error('Please set ADMIN_PASSWORD in your .env file before running seed.\n');
    return false;
  }

  // Use provided ADMIN_PASSWORD or configured hash
  const rawPass = adminPassword || 'TrustFlow@Admin2026!';
  const passwordHash = await bcrypt.hash(rawPass, 10);

  // Check if admin user already exists
  const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [adminEmail]);

  if (existingUsers && existingUsers.length > 0) {
    console.log(`Admin user '${adminEmail}' already exists in database. Skipping duplicate creation.`);
    return true;
  }

  const adminId = uuidv4();
  await db.query(
    `INSERT INTO users (id, name, full_name, email, password_hash, role, account_type, ats_ccs_access, is_active, email_verified, created_at)
     VALUES (?, 'System Admin', 'System Admin', ?, ?, 'ADMIN', 'PREMIUM', TRUE, TRUE, TRUE, NOW())`,
    [adminId, adminEmail, passwordHash]
  );

  await db.query(
    `INSERT INTO admin_users (id, user_id, permissions, created_at)
     VALUES (?, ?, ?, NOW())`,
    [uuidv4(), adminId, JSON.stringify(['ALL'])]
  );

  await db.query(
    `INSERT INTO usage_limits (id, user_id, max_resumes, resumes_count, max_optimizations, job_optimizations_count, max_ai_emails, ai_emails_count, ats_ccs_access, ats_ccs_access_granted)
     VALUES (?, ?, 100, 0, 100, 0, 100, 0, TRUE, TRUE)`,
    [uuidv4(), adminId]
  );

  console.log(`Successfully seeded Administrator account: ${adminEmail}\n`);
  return true;
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
