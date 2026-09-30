const db = require('../config/database');

module.exports = {
  pool: db.pool,
  query: db.query,
  testConnection: db.testConnection,
  initializeTables: async () => {
    // Legacy helper compatibility proxying to migration system
    const setupDatabase = require('../../database/setupDatabase');
    return await setupDatabase();
  },
  isMockMode: db.isMockMode,
  getMemoryStore: db.getMemoryStore,
};
