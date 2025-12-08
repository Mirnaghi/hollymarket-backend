import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    logger.warn(`API Error: ${error.message}`, {
      statusCode: error.statusCode,
      code: error.code,
      path: req.path,
    });

    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  logger.error(`Unhandled error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      message: config.server.isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      ...(config.server.isDevelopment && { stack: error.stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
