import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '../utils/logger';

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        logger.warn(`Validation failed: ${JSON.stringify(errors)}`);

        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        });
        return;
      }

      next(error);
    }
  };

export const schemas = {
  signInWithOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),

  verifyOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      token: z.string().min(6, 'Token must be at least 6 characters'),
    }),
  }),

  getQuote: z.object({
    params: z.object({
      symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
    }),
  }),

  getMultipleQuotes: z.object({
    body: z.object({
      symbols: z.array(z.string().min(1)).min(1, 'At least one symbol is required'),
    }),
  }),

  getHistoricalData: z.object({
    params: z.object({
      symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
    }),
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      interval: z.enum(['1m', '5m', '15m', '30m', '1h', '1d', '1w', '1mo']).default('1d'),
    }),
  }),

  getMarketNews: z.object({
    query: z.object({
      symbols: z.string().optional(),
      limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
    }),
  }),

  searchSymbols: z.object({
    query: z.object({
      q: z.string().min(1, 'Search query is required'),
    }),
  }),

  getComments: z.object({
    query: z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || val >= 0, {
          message: 'Limit must be >= 0',
        }),
      offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || val >= 0, {
          message: 'Offset must be >= 0',
        }),
      order: z.string().optional(),
      ascending: z.enum(['true', 'false']).optional(),
      parent_entity_type: z.enum(['Event', 'Series', 'market']).optional(),
      parent_entity_id: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
      get_positions: z.enum(['true', 'false']).optional(),
      holders_only: z.enum(['true', 'false']).optional(),
    }),
  }),
};
