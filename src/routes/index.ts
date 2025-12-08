import { Router } from 'express';
import authRoutes from './auth.routes';
import marketsRoutes from './markets.routes';
import tradingRoutes from './trading.routes';
import { config } from '../config/env';

const router = Router();

router.use('/auth', authRoutes);
router.use('/markets', marketsRoutes);
router.use('/trading', tradingRoutes);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.server.apiVersion,
      environment: config.server.env,
      services: {
        polymarket: {
          api: config.polymarket.apiUrl,
          clob: config.polymarket.clobApiUrl,
        },
      },
    },
  });
});

export default router;
