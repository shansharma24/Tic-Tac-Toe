import http from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { setupSocketServer } from './sockets/socketHandler.js';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();
    const server = http.createServer(app);
    const io = setupSocketServer(server);

    server.listen(ENV.PORT, () => {
      logger.info(`====================================================`);
      logger.info(`🚀 Floyd Technology Hub - Tic-Tac-Toe Server running`);
      logger.info(`🌐 Port: ${ENV.PORT} | Mode: ${ENV.NODE_ENV}`);
      logger.info(`🔗 API Base: http://localhost:${ENV.PORT}/api/v1`);
      logger.info(`⚡ Socket.IO Ready`);
      logger.info(`====================================================`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      io.close(() => logger.info('Socket.IO connections closed.'));
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
