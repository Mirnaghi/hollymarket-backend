import { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from './supabase.service';
import { logger } from '../utils/logger';
import { AuthenticationError, ValidationError } from '../types';

export class AuthService {
  async signInWithOtp(email: string): Promise<void> {
    if (!email || !this.isValidEmail(email)) {
      throw new ValidationError('Invalid email address');
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        logger.error(`OTP sign-in failed for ${email}: ${error.message}`);
        throw new AuthenticationError(error.message);
      }

      logger.info(`OTP sent to ${email}`);
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Unexpected error during OTP sign-in: ${error}`);
      throw new AuthenticationError('Failed to send OTP');
    }
  }

  async verifyOtp(email: string, token: string): Promise<{ user: User; accessToken: string }> {
    if (!email || !token) {
      throw new ValidationError('Email and token are required');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error || !data.user || !data.session) {
        logger.error(`OTP verification failed for ${email}: ${error?.message}`);
        throw new AuthenticationError('Invalid or expired OTP');
      }

      logger.info(`User authenticated successfully: ${data.user.id}`);

      return {
        user: data.user,
        accessToken: data.session.access_token,
      };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Unexpected error during OTP verification: ${error}`);
      throw new AuthenticationError('Failed to verify OTP');
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new AuthenticationError('Invalid token');
      }

      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error(`Error getting user from token: ${error}`);
      throw new AuthenticationError('Invalid token');
    }
  }

  async signOut(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.signOut(token);

      if (error) {
        logger.error(`Sign out failed: ${error.message}`);
        throw new AuthenticationError('Failed to sign out');
      }

      logger.info('User signed out successfully');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error(`Unexpected error during sign out: ${error}`);
      throw new AuthenticationError('Failed to sign out');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error) {
        logger.error(`Failed to get user ${userId}: ${error.message}`);
        return null;
      }

      return user;
    } catch (error) {
      logger.error(`Unexpected error getting user: ${error}`);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        logger.error(`Failed to delete user ${userId}: ${error.message}`);
        throw new AuthenticationError('Failed to delete user');
      }

      logger.info(`User deleted successfully: ${userId}`);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error(`Unexpected error deleting user: ${error}`);
      throw new AuthenticationError('Failed to delete user');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();
