import { Request, Response } from 'express';
import { commentsService } from '../services/comments.service';
import { ResponseBuilder } from '../utils/response';
import { GetCommentsParams } from '../types/comments.types';
import { logger } from '../utils/logger';

export class CommentsController {
  async getComments(req: Request, res: Response): Promise<Response> {
    const params: GetCommentsParams = {
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      order: req.query.order as string | undefined,
      ascending: req.query.ascending === 'true' ? true : req.query.ascending === 'false' ? false : undefined,
      parent_entity_type: req.query.parent_entity_type as 'Event' | 'Series' | 'market' | undefined,
      parent_entity_id: req.query.parent_entity_id
        ? parseInt(req.query.parent_entity_id as string, 10)
        : undefined,
      get_positions: req.query.get_positions === 'true' ? true : req.query.get_positions === 'false' ? false : undefined,
      holders_only: req.query.holders_only === 'true' ? true : req.query.holders_only === 'false' ? false : undefined,
    };

    logger.info(`Getting comments with params: ${JSON.stringify(params)}`);

    const comments = await commentsService.getComments(params);

    return ResponseBuilder.success(res, {
      count: comments.length,
      comments,
    });
  }
}

export const commentsController = new CommentsController();
