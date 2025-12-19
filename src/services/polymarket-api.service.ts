import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ApiError } from '../types';
import {
  PolymarketEvent,
  PolymarketMarket,
  PolymarketTag,
  GetMarketsParams,
  GetEventsParams,
} from '../types/polymarket.types';

export class PolymarketApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.polymarket.apiUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    logger.info('Polymarket API client initialized');
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Polymarket API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`Polymarket API Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Polymarket API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        const message = error.response?.data || error.message;
        logger.error(`Polymarket API Response Error: ${message}`);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || error.message;

      switch (status) {
        case 400:
          return new ApiError(400, message, 'BAD_REQUEST');
        case 404:
          return new ApiError(404, 'Resource not found', 'NOT_FOUND');
        case 429:
          return new ApiError(429, 'Polymarket API rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
        case 500:
          return new ApiError(500, 'Polymarket API server error', 'SERVER_ERROR');
        default:
          return new ApiError(status, message, 'POLYMARKET_API_ERROR');
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError(504, 'Polymarket API request timeout', 'TIMEOUT');
    }

    return new ApiError(503, 'Polymarket API service unavailable', 'SERVICE_UNAVAILABLE');
  }

  async getEvents(params?: GetEventsParams): Promise<PolymarketEvent[]> {
    try {
      const queryParams: any = {};
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.offset) queryParams.offset = params.offset;
      if (params?.active !== undefined) queryParams.active = params.active;
      if (params?.closed !== undefined) queryParams.closed = params.closed;
      if (params?.archived !== undefined) queryParams.archived = params.archived;
      if (params?.tag) queryParams.tag_id = params.tag;

      const response = await this.client.get<PolymarketEvent[]>('/events', {
        params: queryParams,
      });

      logger.info(`Fetched ${response.data.length} events from Polymarket`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch events: ${error}`);
      throw error;
    }
  }

  async getEventBySlug(slug: string): Promise<PolymarketEvent> {
    try {
      const response = await this.client.get<PolymarketEvent>(`/events/${slug}`);
      logger.info(`Fetched event: ${slug}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch event ${slug}: ${error}`);
      throw error;
    }
  }

  async getMarkets(params?: GetMarketsParams): Promise<PolymarketMarket[]> {
    try {
      const queryParams: any = {};
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.offset) queryParams.offset = params.offset;
      if (params?.active !== undefined) queryParams.active = params.active;
      if (params?.closed !== undefined) queryParams.closed = params.closed;
      if (params?.archived !== undefined) queryParams.archived = params.archived;
      if (params?.tag) queryParams.tag = params.tag;

      const response = await this.client.get<PolymarketMarket[]>('/markets', {
        params: queryParams,
      });

      logger.info(`Fetched ${response.data.length} markets from Polymarket`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch markets: ${error}`);
      throw error;
    }
  }

  async getMarketBySlug(slug: string): Promise<PolymarketMarket> {
    try {
      const response = await this.client.get<PolymarketMarket>(`/markets/${slug}`);
      logger.info(`Fetched market: ${slug}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch market ${slug}: ${error}`);
      throw error;
    }
  }

  async getMarketById(id: string): Promise<PolymarketMarket> {
    try {
      const response = await this.client.get<PolymarketMarket>(`/markets/id/${id}`);
      logger.info(`Fetched market by ID: ${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch market ${id}: ${error}`);
      throw error;
    }
  }

  async searchMarkets(query: string): Promise<PolymarketMarket[]> {
    try {
      const response = await this.client.get<PolymarketMarket[]>('/markets/search', {
        params: { query },
      });

      logger.info(`Searched markets with query: ${query}, found ${response.data.length} results`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to search markets: ${error}`);
      throw error;
    }
  }

  async getFeaturedMarkets(): Promise<PolymarketMarket[]> {
    try {
      const response = await this.client.get<PolymarketMarket[]>('/markets/featured');
      logger.info(`Fetched ${response.data.length} featured markets`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch featured markets: ${error}`);
      throw error;
    }
  }

  async getTrendingMarkets(): Promise<PolymarketMarket[]> {
    try {
      const response = await this.client.get<PolymarketMarket[]>('/markets/trending');
      logger.info(`Fetched ${response.data.length} trending markets`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch trending markets: ${error}`);
      throw error;
    }
  }

  async getTags(): Promise<PolymarketTag[]> {
    try {
      const response = await this.client.get<PolymarketTag[]>('/tags');
      logger.info(`Fetched ${response.data.length} tags from Polymarket`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch tags: ${error}`);
      throw error;
    }
  }

  async getEventsByTag(tagId: string, params?: GetEventsParams): Promise<PolymarketEvent[]> {
    try {
      const queryParams: any = { tag_id: tagId };
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.offset) queryParams.offset = params.offset;
      if (params?.active !== undefined) queryParams.active = params.active;
      if (params?.closed !== undefined) queryParams.closed = params.closed;
      if (params?.archived !== undefined) queryParams.archived = params.archived;

      const response = await this.client.get<PolymarketEvent[]>('/events', {
        params: queryParams,
      });

      logger.info(`Fetched ${response.data.length} events for tag: ${tagId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch events by tag ${tagId}: ${error}`);
      throw error;
    }
  }
}

export const polymarketApiService = new PolymarketApiService();
