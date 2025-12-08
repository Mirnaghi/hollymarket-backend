import { Router } from 'express';
import { tradingController } from '../controllers/trading.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import 'express-async-errors';

const router = Router();

router.get('/orderbook/:tokenId', optionalAuth, (req, res) =>
  tradingController.getOrderbook(req, res)
);

router.get('/price/:tokenId', optionalAuth, (req, res) =>
  tradingController.getMarketPrice(req, res)
);

router.get('/midpoint/:tokenId', optionalAuth, (req, res) =>
  tradingController.getMidpointPrice(req, res)
);

router.get('/spread/:tokenId', optionalAuth, (req, res) => tradingController.getSpread(req, res));

router.get('/trades', optionalAuth, (req, res) => tradingController.getTrades(req, res));

router.get('/trades/:tokenId', optionalAuth, (req, res) =>
  tradingController.getRecentTrades(req, res)
);

router.get('/tick-size/:tokenId', optionalAuth, (req, res) =>
  tradingController.getTickSize(req, res)
);

router.get('/min-order-size/:tokenId', optionalAuth, (req, res) =>
  tradingController.getMinOrderSize(req, res)
);

router.get('/orders/:address', authenticate, (req, res) =>
  tradingController.getUserOrders(req, res)
);

router.get('/order/:orderId', authenticate, (req, res) =>
  tradingController.getOrderById(req, res)
);

router.post('/order', authenticate, (req, res) => tradingController.createOrder(req, res));

router.delete('/order', authenticate, (req, res) => tradingController.cancelOrder(req, res));

router.delete('/orders', authenticate, (req, res) => tradingController.cancelAllOrders(req, res));

export default router;
