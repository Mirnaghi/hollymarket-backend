import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { logger } from '../utils/logger';

class SupabaseService {
  private static instance: SupabaseService;
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;

  private constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    this.adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info('Supabase client initialized');
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.supabase;
  }

  public getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}

export const supabaseService = SupabaseService.getInstance();
export const supabase = supabaseService.getClient();
export const supabaseAdmin = supabaseService.getAdminClient();
