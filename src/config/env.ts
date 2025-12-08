import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  API_VERSION: z.string().default('v1'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Polymarket
  POLYMARKET_API_URL: z.string().url().default('https://gamma-api.polymarket.com'),
  POLYMARKET_CLOB_API_URL: z.string().url().default('https://clob.polymarket.com'),
  POLYMARKET_CHAIN_ID: z.string().default('137'),
  POLYMARKET_FUNDER_PRIVATE_KEY: z.string().optional(),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => e.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

export const env = parseEnv();

export const config = {
  server: {
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    apiVersion: env.API_VERSION,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  polymarket: {
    apiUrl: env.POLYMARKET_API_URL,
    clobApiUrl: env.POLYMARKET_CLOB_API_URL,
    chainId: parseInt(env.POLYMARKET_CHAIN_ID, 10),
    funderPrivateKey: env.POLYMARKET_FUNDER_PRIVATE_KEY,
  },
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
} as const;
