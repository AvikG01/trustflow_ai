require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function checkStatus() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.existsSync(migrationsDir)
    ? fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()
    : [];

  let executedList = [];
  try {
    executedList = await db.query('SELECT * FROM schema_migrations');
  } catch (e) {}

  const executedMap = new Map();
  if (Array.isArray(executedList)) {
    executedList.forEach((row) => executedMap.set(row.migration_name, row.executed_at));
  }

  console.log('=========================================');
  console.log('TRUSTFLOW AI MIGRATION STATUS');
  console.log('=========================================');
  console.log('Migration Name                            | Status   | Executed At');
  console.log('-----------------------------------------------------------------');

  let executedCount = 0;
  let pendingCount = 0;

  files.forEach((file) => {
    const isExecuted = executedMap.has(file);
    if (isExecuted) executedCount++;
    else pendingCount++;

    const statusStr = isExecuted ? 'EXECUTED' : 'PENDING ';
    const timeStr = isExecuted ? new Date(executedMap.get(file)).toISOString().replace('T', ' ').substring(0, 19) : '-';
    const paddedName = file.padEnd(42, ' ');
    console.log(`${paddedName}| ${statusStr} | ${timeStr}`);
  });

  console.log('-----------------------------------------------------------------');
  console.log(`Total Migrations: ${files.length} | Executed: ${executedCount} | Pending: ${pendingCount}`);
  console.log('=========================================\n');
}

if (require.main === module) {
  checkStatus().then(() => process.exit(0));
}

module.exports = checkStatus;
