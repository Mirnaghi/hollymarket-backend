import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ApiError } from '../types';
import { Comment, GetCommentsParams } from '../types/comments.types';

export class CommentsService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.POLYMARKET_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error(`Polymarket comments API error: ${error.message}`);
        throw new ApiError(
          error.response?.data?.message || 'Failed to fetch comments from Polymarket',
          error.response?.status || 500
        );
      }
    );
  }

  async getComments(params?: GetCommentsParams): Promise<Comment[]> {
    try {
      const queryParams: any = {};

      if (params?.limit !== undefined) queryParams.limit = params.limit;
      if (params?.offset !== undefined) queryParams.offset = params.offset;
      if (params?.order) queryParams.order = params.order;
      if (params?.ascending !== undefined) queryParams.ascending = params.ascending;
      if (params?.parent_entity_type) queryParams.parent_entity_type = params.parent_entity_type;
      if (params?.parent_entity_id !== undefined)
        queryParams.parent_entity_id = params.parent_entity_id;
      if (params?.get_positions !== undefined) queryParams.get_positions = params.get_positions;
      if (params?.holders_only !== undefined) queryParams.holders_only = params.holders_only;

      logger.info(`Fetching comments with params: ${JSON.stringify(queryParams)}`);

      const response = await this.client.get<Comment[]>('/comments', {
        params: queryParams,
      });

      logger.info(`Fetched ${response.data.length} comments`);

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Unexpected error fetching comments: ${error}`);
      throw new ApiError('Failed to fetch comments', 500);
    }
  }
}

export const commentsService = new CommentsService();
