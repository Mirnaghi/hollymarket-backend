import { Request, Response } from 'express';
import { polymarketClobService } from '../services/polymarket-clob.service';
import { ResponseBuilder } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

export class TradingController {
  async getOrderbook(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;
    const { depth } = req.query;

    let orderbook;
    if (depth) {
      orderbook = await polymarketClobService.getOrderbookDepth(
        tokenId,
        parseInt(depth as string, 10)
      );
    } else {
      orderbook = await polymarketClobService.getOrderbook(tokenId);
    }

    return ResponseBuilder.success(res, orderbook);
  }

  async getMarketPrice(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;

    const price = await polymarketClobService.getMarketPrice(tokenId);

    return ResponseBuilder.success(res, price);
  }

  async getMidpointPrice(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;

    const price = await polymarketClobService.getMidpointPrice(tokenId);

    return ResponseBuilder.success(res, {
      tokenId,
      midpointPrice: price,
    });
  }

  async getSpread(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;

    const spread = await polymarketClobService.getSpread(tokenId);

    return ResponseBuilder.success(res, {
      tokenId,
      ...spread,
    });
  }

  async getTrades(req: Request, res: Response): Promise<Response> {
    const { market, asset_id, limit, offset } = req.query;

    const params = {
      market: market as string | undefined,
      asset_id: asset_id as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : 20,
      offset: offset ? parseInt(offset as string, 10) : 0,
    };

    const trades = await polymarketClobService.getTrades(params);

    return ResponseBuilder.success(res, {
      count: trades.length,
      trades,
    });
  }

  async getRecentTrades(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;
    const { limit } = req.query;

    const trades = await polymarketClobService.getRecentTrades(
      tokenId,
      limit ? parseInt(limit as string, 10) : 20
    );

    return ResponseBuilder.success(res, {
      count: trades.length,
      tokenId,
      trades,
    });
  }

  async getUserOrders(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { address } = req.params;

    const orders = await polymarketClobService.getUserOrders(address);

    return ResponseBuilder.success(res, {
      count: orders.length,
      address,
      orders,
    });
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    const { orderId } = req.params;

    const order = await polymarketClobService.getOrderById(orderId);

    return ResponseBuilder.success(res, order);
  }

  async createOrder(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const signedOrder = req.body;

    const result = await polymarketClobService.createOrder(signedOrder);

    logger.info(`Order created by user ${req.user?.id}: ${result.orderID}`);

    return ResponseBuilder.created(res, result);
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { orderID } = req.body;

    const result = await polymarketClobService.cancelOrder({ orderID });

    logger.info(`Order cancelled by user ${req.user?.id}: ${orderID}`);

    return ResponseBuilder.success(res, result);
  }

  async cancelAllOrders(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { address, market, asset_id } = req.body;

    const result = await polymarketClobService.cancelAllOrders(address, market, asset_id);

    logger.info(`${result.cancelled} orders cancelled for address ${address}`);

    return ResponseBuilder.success(res, result);
  }

  async getTickSize(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;

    const tickSize = await polymarketClobService.getTickSize(tokenId);

    return ResponseBuilder.success(res, {
      tokenId,
      tickSize,
    });
  }

  async getMinOrderSize(req: Request, res: Response): Promise<Response> {
    const { tokenId } = req.params;

    const minSize = await polymarketClobService.getMinOrderSize(tokenId);

    return ResponseBuilder.success(res, {
      tokenId,
      minOrderSize: minSize,
    });
  }
}

export const tradingController = new TradingController();
