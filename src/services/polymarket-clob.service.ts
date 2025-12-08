import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ApiError } from '../types';
import {
  OrderbookSummary,
  Order,
  Trade,
  MarketPrice,
  SignedOrder,
  GetTradesParams,
  CancelOrderParams,
} from '../types/polymarket.types';

export class PolymarketClobService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.polymarket.clobApiUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    logger.info('Polymarket CLOB client initialized');
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`CLOB API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`CLOB API Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`CLOB API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        const message = error.response?.data || error.message;
        logger.error(`CLOB API Response Error: ${message}`);
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
        case 401:
          return new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
        case 404:
          return new ApiError(404, 'Resource not found', 'NOT_FOUND');
        case 429:
          return new ApiError(429, 'Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
        default:
          return new ApiError(status, message, 'CLOB_API_ERROR');
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError(504, 'Request timeout', 'TIMEOUT');
    }

    return new ApiError(503, 'CLOB service unavailable', 'SERVICE_UNAVAILABLE');
  }

  async getOrderbook(tokenId: string): Promise<OrderbookSummary> {
    try {
      const response = await this.client.get<OrderbookSummary>('/orderbook', {
        params: { token_id: tokenId },
      });

      logger.info(`Fetched orderbook for token: ${tokenId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch orderbook for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getOrderbookDepth(tokenId: string, depth: number = 10): Promise<OrderbookSummary> {
    try {
      const response = await this.client.get<OrderbookSummary>('/orderbook', {
        params: { token_id: tokenId, depth },
      });

      logger.info(`Fetched orderbook depth ${depth} for token: ${tokenId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch orderbook depth for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getMarketPrice(tokenId: string): Promise<MarketPrice> {
    try {
      const response = await this.client.get<MarketPrice>(`/price`, {
        params: { token_id: tokenId },
      });

      logger.info(`Fetched market price for token: ${tokenId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch price for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getMidpointPrice(tokenId: string): Promise<number> {
    try {
      const response = await this.client.get<{ price: string }>('/midpoint', {
        params: { token_id: tokenId },
      });

      const price = parseFloat(response.data.price);
      logger.info(`Fetched midpoint price for token ${tokenId}: ${price}`);
      return price;
    } catch (error) {
      logger.error(`Failed to fetch midpoint price for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getSpread(tokenId: string): Promise<{ bid: string; ask: string; spread: string }> {
    try {
      const response = await this.client.get<{ bid: string; ask: string; spread: string }>(
        '/spread',
        {
          params: { token_id: tokenId },
        }
      );

      logger.info(`Fetched spread for token: ${tokenId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch spread for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getTrades(params: GetTradesParams): Promise<Trade[]> {
    try {
      const queryParams: any = {};
      if (params.market) queryParams.market = params.market;
      if (params.asset_id) queryParams.asset_id = params.asset_id;
      if (params.limit) queryParams.limit = params.limit;
      if (params.offset) queryParams.offset = params.offset;

      const response = await this.client.get<Trade[]>('/trades', {
        params: queryParams,
      });

      logger.info(`Fetched ${response.data.length} trades`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch trades: ${error}`);
      throw error;
    }
  }

  async getRecentTrades(tokenId: string, limit: number = 20): Promise<Trade[]> {
    try {
      const response = await this.client.get<Trade[]>('/trades', {
        params: { asset_id: tokenId, limit },
      });

      logger.info(`Fetched ${response.data.length} recent trades for token: ${tokenId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch recent trades for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getUserOrders(address: string): Promise<Order[]> {
    try {
      const response = await this.client.get<Order[]>('/orders', {
        params: { owner: address },
      });

      logger.info(`Fetched ${response.data.length} orders for user: ${address}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch orders for user ${address}: ${error}`);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await this.client.get<Order>(`/orders/${orderId}`);
      logger.info(`Fetched order: ${orderId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch order ${orderId}: ${error}`);
      throw error;
    }
  }

  async createOrder(order: SignedOrder): Promise<{ orderID: string; success: boolean }> {
    try {
      const response = await this.client.post<{ orderID: string; success: boolean }>(
        '/order',
        order
      );

      logger.info(`Created order: ${response.data.orderID}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create order: ${error}`);
      throw error;
    }
  }

  async cancelOrder(params: CancelOrderParams): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete<{ success: boolean }>('/order', {
        data: { orderID: params.orderID },
      });

      logger.info(`Cancelled order: ${params.orderID}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to cancel order ${params.orderID}: ${error}`);
      throw error;
    }
  }

  async cancelAllOrders(
    address: string,
    market?: string,
    assetId?: string
  ): Promise<{ cancelled: number }> {
    try {
      const data: any = { address };
      if (market) data.market = market;
      if (assetId) data.asset_id = assetId;

      const response = await this.client.delete<{ cancelled: number }>('/orders', {
        data,
      });

      logger.info(`Cancelled ${response.data.cancelled} orders for address: ${address}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to cancel all orders for ${address}: ${error}`);
      throw error;
    }
  }

  async getTickSize(tokenId: string): Promise<string> {
    try {
      const response = await this.client.get<{ tick_size: string }>('/tick-size', {
        params: { token_id: tokenId },
      });

      logger.info(`Fetched tick size for token ${tokenId}: ${response.data.tick_size}`);
      return response.data.tick_size;
    } catch (error) {
      logger.error(`Failed to fetch tick size for ${tokenId}: ${error}`);
      throw error;
    }
  }

  async getMinOrderSize(tokenId: string): Promise<string> {
    try {
      const response = await this.client.get<{ min_size: string }>('/min-order-size', {
        params: { token_id: tokenId },
      });

      logger.info(`Fetched min order size for token ${tokenId}: ${response.data.min_size}`);
      return response.data.min_size;
    } catch (error) {
      logger.error(`Failed to fetch min order size for ${tokenId}: ${error}`);
      throw error;
    }
  }
}

export const polymarketClobService = new PolymarketClobService();
