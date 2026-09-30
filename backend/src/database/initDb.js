const setupDatabase = require('../../database/setupDatabase');
const logger = require('../utils/logger');

async function runInit() {
  try {
    logger.info('Initializing TrustFlow AI Database via Migration System...');
    await setupDatabase();
    logger.info('Database initialization finished successfully.');
  } catch (err) {
    logger.error(`Database Initialization Error: ${err.message}`);
  }
}

if (require.main === module) {
  runInit().then(() => process.exit(0));
}

module.exports = runInit;
