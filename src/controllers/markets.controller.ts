import { Request, Response } from 'express';
import { polymarketApiService } from '../services/polymarket-api.service';
import { ResponseBuilder } from '../utils/response';

export class MarketsController {
  async getEvents(req: Request, res: Response): Promise<Response> {
    const { limit, offset, active, closed, archived, tag_id, ascending } = req.query;

    const params = {
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      closed: closed === 'true' ? true : closed === 'false' ? false : undefined,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      ascending: ascending === 'true' ? true : ascending === 'false' ? false : undefined,
      tag: tag_id as string | undefined,
    };

    const events = await polymarketApiService.getEvents(params);

    return ResponseBuilder.success(res, {
      count: events.length,
      events,
    });
  }

  async getEventBySlug(req: Request, res: Response): Promise<Response> {
    const { slug } = req.params;

    const event = await polymarketApiService.getEventBySlug(slug);

    return ResponseBuilder.success(res, event);
  }

  async getMarkets(req: Request, res: Response): Promise<Response> {
    const { limit, offset, active, closed, archived, tag } = req.query;

    const params = {
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      closed: closed === 'true' ? true : closed === 'false' ? false : undefined,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      tag: tag as string | undefined,
    };

    const markets = await polymarketApiService.getMarkets(params);

    return ResponseBuilder.success(res, {
      count: markets.length,
      markets,
    });
  }

  async getMarketBySlug(req: Request, res: Response): Promise<Response> {
    const { slug } = req.params;

    const market = await polymarketApiService.getMarketBySlug(slug);

    return ResponseBuilder.success(res, market);
  }

  async getMarketById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const market = await polymarketApiService.getMarketById(id);

    return ResponseBuilder.success(res, market);
  }

  async searchMarkets(req: Request, res: Response): Promise<Response> {
    const { q } = req.query;

    if (!q) {
      return ResponseBuilder.error(res, 'Search query is required', 400, 'VALIDATION_ERROR');
    }

    const markets = await polymarketApiService.searchMarkets(q as string);

    return ResponseBuilder.success(res, {
      count: markets.length,
      query: q,
      markets,
    });
  }

  async getFeaturedMarkets(_req: Request, res: Response): Promise<Response> {
    const markets = await polymarketApiService.getFeaturedMarkets();

    return ResponseBuilder.success(res, {
      count: markets.length,
      markets,
    });
  }

  async getTrendingMarkets(_req: Request, res: Response): Promise<Response> {
    const markets = await polymarketApiService.getTrendingMarkets();

    return ResponseBuilder.success(res, {
      count: markets.length,
      markets,
    });
  }

  async getTags(_req: Request, res: Response): Promise<Response> {
    const tags = await polymarketApiService.getTags();

    return ResponseBuilder.success(res, {
      count: tags.length,
      tags,
    });
  }

  async getEventsByTag(req: Request, res: Response): Promise<Response> {
    const { tagId } = req.params;
    const { limit, offset, active, closed, archived } = req.query;

    const params = {
      limit: limit ? parseInt(limit as string, 10) : 200,
      offset: offset ? parseInt(offset as string, 10) : 0,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      closed: closed === 'true' ? true : closed === 'false' ? false : undefined,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
    };

    const events = await polymarketApiService.getEventsByTag(tagId, params);

    return ResponseBuilder.success(res, {
      count: events.length,
      tagId,
      events,
    });
  }
}

export const marketsController = new MarketsController();
