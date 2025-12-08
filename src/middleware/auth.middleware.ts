import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest, AuthenticationError } from '../types';
import { logger } from '../utils/logger';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AuthenticationError('Missing access token');
    }

    const user = await authService.getUserFromToken(token);

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      logger.warn(`Authentication failed: ${error.message}`);
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    logger.error(`Authentication error: ${error}`);
    res.status(401).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTHENTICATION_ERROR',
      },
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const user = await authService.getUserFromToken(token);
        req.user = user;
      }
    }

    next();
  } catch (error) {
    logger.debug(`Optional auth failed: ${error}`);
    next();
  }
};
