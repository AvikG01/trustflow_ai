require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../src/config/database');
const createDatabase = require('./createDatabase');
const env = require('../src/config/env');

async function runMigrations() {
  console.log(`Connecting to MySQL database: ${env.MYSQL.database}...`);
  await createDatabase();

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    return false;
  }

  // Ensure schema_migrations exists first
  const initSqlPath = path.join(migrationsDir, '000_create_schema_migrations.sql');
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await db.query(initSql);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log('\nExecuting Migrations:');

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    // Check if migration has already been executed
    const executed = await db.query('SELECT * FROM schema_migrations WHERE migration_name = ?', [file]);

    if (executed && executed.length > 0) {
      console.log(`  [${file}] ${'.'.repeat(Math.max(2, 45 - file.length))} SKIPPED (Already Executed)`);
      continue;
    }

    try {
      const statements = content
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await db.query(statement);
      }

      await db.query(
        'INSERT INTO schema_migrations (migration_name, executed_at, checksum) VALUES (?, NOW(), ?)',
        [file, checksum]
      );

      console.log(`  [${file}] ${'.'.repeat(Math.max(2, 45 - file.length))} SUCCESS`);
    } catch (err) {
      console.error(`  [${file}] ${'.'.repeat(Math.max(2, 45 - file.length))} FAILED: ${err.message}`);
      throw err;
    }
  }

  console.log('\nDatabase migration completed successfully.\n');
  return true;
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration execution error:', err.message);
      process.exit(1);
    });
}

module.exports = runMigrations;
