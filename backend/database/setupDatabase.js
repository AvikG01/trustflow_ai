require('dotenv').config();
const createDatabase = require('./createDatabase');
const runMigrations = require('./migrationRunner');
const seedDatabase = require('./seedDatabase');
const verifyDatabase = require('./verifyDatabase');

async function setupDatabase() {
  console.log('====================================');
  console.log('TRUSTFLOW AI DATABASE SETUP');
  console.log('====================================\n');

  try {
    await createDatabase();
    await runMigrations();
    await seedDatabase();
    await verifyDatabase();
    console.log('Setup process completed successfully.\n');
    return true;
  } catch (err) {
    console.error(`Setup process failed: ${err.message}`);
    throw err;
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupDatabase;
