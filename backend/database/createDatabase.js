require('dotenv').config();
const mysql = require('mysql2/promise');
const env = require('../src/config/env');
const logger = require('../src/utils/logger');

async function createDatabase() {
  const dbName = env.MYSQL.database || 'trustflow_ai';
  logger.info(`Checking database existence: ${dbName}...`);

  try {
    const connection = await mysql.createConnection({
      host: env.MYSQL.host,
      port: env.MYSQL.port,
      user: env.MYSQL.user,
      password: env.MYSQL.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`Database '${dbName}' created or already exists.`);
    return true;
  } catch (err) {
    logger.warn(`Could not connect to live MySQL server (${err.message}). Defaulting to mock fallback mode.`);
    return false;
  }
}

if (require.main === module) {
  createDatabase().then(() => process.exit(0));
}

module.exports = createDatabase;
