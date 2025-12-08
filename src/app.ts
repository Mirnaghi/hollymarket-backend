import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { config } from './config/env';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.cors.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(requestLogger);

  app.use(`/api/${config.server.apiVersion}`, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info('Express app configured successfully');

  return app;
};
