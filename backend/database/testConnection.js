require('dotenv').config();
const db = require('../src/config/database');

async function runTestConnection() {
  console.log('Testing MySQL Database Connection...');
  const result = await db.testConnection();
  if (result.success && !result.isMock) {
    console.log('MySQL connection successful.');
  } else if (result.isMock) {
    console.log('Centralized DB connection tested in fallback mode.');
  }
}

if (require.main === module) {
  runTestConnection().then(() => process.exit(0));
}

module.exports = runTestConnection;
