import { buildHmacSignature } from '@polymarket/builder-signing-sdk';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { SigningRequest, SigningResponse } from '../types/wallet.types';
import { ApiError } from '../types';

/**
 * Builder Signing Service
 * Generates HMAC signatures for Polymarket CLOB requests
 * This allows the frontend to make authenticated requests with builder attribution
 */
export class BuilderSigningService {
  private readonly apiKey: string;
  private readonly secret: string;
  private readonly passphrase: string;

  constructor() {
    this.apiKey = config.polymarket.builder.apiKey;
    this.secret = config.polymarket.builder.secret;
    this.passphrase = config.polymarket.builder.passphrase;

    if (!this.apiKey || !this.secret || !this.passphrase) {
      throw new Error(
        'Missing Polymarket builder credentials. Please set POLYMARKET_BUILDER_API_KEY, POLYMARKET_BUILDER_SECRET, and POLYMARKET_BUILDER_PASSPHRASE environment variables.'
      );
    }

    logger.info('Builder signing service initialized');
  }

  /**
   * Generate HMAC signature headers for a CLOB API request
   * @param request - The signing request containing method, path, and optional body
   * @returns Signature headers to be attached to the CLOB API request
   */
  sign(request: SigningRequest): SigningResponse {
    try {
      const { method, path, body } = request;
      const timestamp = Date.now();

      // Validate request
      if (!method || !path) {
        throw new ApiError(400, 'Missing required fields: method and path');
      }

      // Validate HTTP method
      const validMethods = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
      if (!validMethods.includes(method.toUpperCase())) {
        throw new ApiError(400, `Invalid HTTP method: ${method}`);
      }

      // Build the HMAC signature using the SDK
      const signature = buildHmacSignature(
        this.secret,
        timestamp,
        method.toUpperCase(),
        path,
        body || ''
      );

      logger.info(`Generated signature for ${method} ${path}`);
      logger.debug(`Timestamp: ${timestamp}, Body length: ${body?.length || 0}`);

      return {
        POLY_BUILDER_API_KEY: this.apiKey,
        POLY_BUILDER_SIGNATURE: signature,
        POLY_BUILDER_TIMESTAMP: timestamp,
        POLY_BUILDER_PASSPHRASE: this.passphrase,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Failed to generate signature: ${error}`);
      throw new ApiError(500, 'Failed to generate signature');
    }
  }

  /**
   * Validate a signing request before processing
   * @param request - The signing request to validate
   * @returns True if valid, throws error otherwise
   */
  validateRequest(request: SigningRequest): boolean {
    const { method, path, body } = request;

    if (!method || typeof method !== 'string') {
      throw new ApiError(400, 'Invalid or missing method');
    }

    if (!path || typeof path !== 'string' || !path.startsWith('/')) {
      throw new ApiError(400, 'Invalid or missing path. Path must start with /');
    }

    // If body is provided, it should be a string (JSON stringified)
    if (body !== undefined && typeof body !== 'string') {
      throw new ApiError(400, 'Body must be a JSON string');
    }

    // Validate that body is valid JSON if provided
    if (body) {
      try {
        JSON.parse(body);
      } catch {
        throw new ApiError(400, 'Body must be valid JSON');
      }
    }

    return true;
  }

  /**
   * Get builder configuration info (without sensitive data)
   * @returns Public builder information
   */
  getBuilderInfo() {
    return {
      apiKey: this.apiKey,
      hasSecret: !!this.secret,
      hasPassphrase: !!this.passphrase,
      configured: !!this.apiKey && !!this.secret && !!this.passphrase,
    };
  }
}

export const builderSigningService = new BuilderSigningService();
