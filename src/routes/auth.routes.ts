import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';
import 'express-async-errors';

const router = Router();

router.post('/signin', validate(schemas.signInWithOtp), (req, res) =>
  authController.signInWithOtp(req, res)
);

router.post('/verify', validate(schemas.verifyOtp), (req, res) =>
  authController.verifyOtp(req, res)
);

router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req, res));

router.post('/signout', authenticate, (req, res) => authController.signOut(req, res));

export default router;
