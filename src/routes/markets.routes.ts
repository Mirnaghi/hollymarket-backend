import { Router } from 'express';
import { marketsController } from '../controllers/markets.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import 'express-async-errors';

const router = Router();

router.get('/events', optionalAuth, (req, res) => marketsController.getEvents(req, res));

router.get('/events/:slug', optionalAuth, (req, res) =>
  marketsController.getEventBySlug(req, res)
);

router.get('/', optionalAuth, (req, res) => marketsController.getMarkets(req, res));

router.get('/featured', optionalAuth, (req, res) =>
  marketsController.getFeaturedMarkets(req, res)
);

router.get('/trending', optionalAuth, (req, res) =>
  marketsController.getTrendingMarkets(req, res)
);

router.get('/search', optionalAuth, (req, res) => marketsController.searchMarkets(req, res));

router.get('/slug/:slug', optionalAuth, (req, res) =>
  marketsController.getMarketBySlug(req, res)
);

router.get('/:id', optionalAuth, (req, res) => marketsController.getMarketById(req, res));

export default router;
