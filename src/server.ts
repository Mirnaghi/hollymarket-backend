import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    const app = createApp();

    const server = app.listen(config.server.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🎯 HollyMarket API Server                            ║
║                                                        ║
║   Environment: ${config.server.env.padEnd(39)} ║
║   Port: ${String(config.server.port).padEnd(45)} ║
║   API Version: ${config.server.apiVersion.padEnd(40)} ║
║                                                        ║
║   📊 Polymarket Integration                            ║
║   API: ${config.polymarket.apiUrl.substring(0, 37).padEnd(43)} ║
║   CLOB: ${config.polymarket.clobApiUrl.substring(0, 36).padEnd(42)} ║
║                                                        ║
║   🔐 Supabase Auth: Enabled                            ║
║                                                        ║
║   Ready to accept requests!                            ║
║   Docs: http://localhost:${config.server.port}/api/${config.server.apiVersion}/health${' '.repeat(12)}║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('Server closed. Exiting process.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
