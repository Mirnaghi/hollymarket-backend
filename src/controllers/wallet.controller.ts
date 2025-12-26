import { Request, Response } from 'express';
import { builderSigningService } from '../services/builder-signing.service';
import { ResponseBuilder } from '../utils/response';
import { SigningRequest } from '../types/wallet.types';
import { logger } from '../utils/logger';

/**
 * Wallet Controller
 * Handles wallet-related endpoints including remote signing for Polymarket CLOB
 */
export class WalletController {
  /**
   * POST /api/polymarket/sign
   * Generate builder signature headers for CLOB API requests
   * This endpoint is called by the frontend CLOB client for builder attribution
   */
  async sign(req: Request, res: Response): Promise<Response> {
    const signingRequest: SigningRequest = req.body;

    logger.info(
      `Signing request received: ${signingRequest.method} ${signingRequest.path}`
    );

    // Validate the request
    builderSigningService.validateRequest(signingRequest);

    // Generate signature headers
    const signatureHeaders = builderSigningService.sign(signingRequest);

    logger.info('Signature generated successfully');

    return ResponseBuilder.success(res, signatureHeaders);
  }

  /**
   * GET /api/polymarket/builder-info
   * Get builder configuration status (without sensitive data)
   */
  async getBuilderInfo(_req: Request, res: Response): Promise<Response> {
    const builderInfo = builderSigningService.getBuilderInfo();

    return ResponseBuilder.success(res, {
      builder: builderInfo,
      message: builderInfo.configured
        ? 'Builder credentials are configured'
        : 'Builder credentials are missing or incomplete',
    });
  }
}

export const walletController = new WalletController();
