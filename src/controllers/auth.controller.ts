import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ResponseBuilder } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

export class AuthController {
  async signInWithOtp(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    await authService.signInWithOtp(email);

    logger.info(`OTP requested for email: ${email}`);

    return ResponseBuilder.success(res, {
      message: 'OTP sent to your email address',
      email,
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { email, token } = req.body;

    const result = await authService.verifyOtp(email, token);

    logger.info(`User authenticated: ${result.user.id}`);

    return ResponseBuilder.success(res, {
      user: {
        id: result.user.id,
        email: result.user.email,
        createdAt: result.user.created_at,
      },
      accessToken: result.accessToken,
    });
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const user = req.user;

    if (!user) {
      return ResponseBuilder.error(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    return ResponseBuilder.success(res, {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
    });
  }

  async signOut(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (token) {
      await authService.signOut(token);
    }

    logger.info(`User signed out: ${req.user?.id}`);

    return ResponseBuilder.success(res, {
      message: 'Successfully signed out',
    });
  }
}

export const authController = new AuthController();
