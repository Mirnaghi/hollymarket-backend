import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';
import 'express-async-errors';

const router = Router();

/**
 * POST /api/polymarket/sign
 * Remote signing endpoint for Polymarket CLOB builder attribution
 * This endpoint is called by the frontend CLOB client to get builder signature headers
 */
router.post('/sign', optionalAuth, validate(schemas.signRequest), (req, res) =>
  walletController.sign(req, res)
);

/**
 * GET /api/polymarket/builder-info
 * Get builder configuration status
 */
router.get('/builder-info', optionalAuth, (req, res) =>
  walletController.getBuilderInfo(req, res)
);

export default router;
