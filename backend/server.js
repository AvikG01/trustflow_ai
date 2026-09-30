const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const runDbInit = require('./src/database/initDb');

async function startServer() {
  try {
    // Initialize Database Tables & Default Seed Data
    await runDbInit();

    const PORT = env.PORT;
    const server = app.listen(PORT, () => {
      logger.info(`==================================================`);
      logger.info(`  TRUSTFLOW AI BACKEND RUNNING ON PORT: ${PORT}`);
      logger.info(`  Environment: ${env.NODE_ENV}`);
      logger.info(`  API Endpoints: /post, /get, /update, /delete`);
      logger.info(`==================================================`);
    });

    // Graceful Shutdown handling
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      server.close(() => {
        logger.info(`HTTP server closed. Exiting process.`);
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Fatal Server Startup Error: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

startServer();
