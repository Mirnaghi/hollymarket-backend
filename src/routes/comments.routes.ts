import { Router } from 'express';
import { commentsController } from '../controllers/comments.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';
import 'express-async-errors';

const router = Router();

router.get('/', optionalAuth, validate(schemas.getComments), (req, res) =>
  commentsController.getComments(req, res)
);

export default router;
