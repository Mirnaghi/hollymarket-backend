export interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  markets: PolymarketMarket[];
  tags?: string[];
  commentCount?: number;
  liquidity?: number;
  volume?: number;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: number;
  volume: number;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  outcomes: string[];
  outcomePrices: string[];
  clobTokenIds: string[];
  description?: string;
  category?: string;
  marketMakerAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderbookSummary {
  market: string;
  asset_id: string;
  hash: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: number;
}

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface Order {
  id: string;
  market: string;
  asset_id: string;
  owner: string;
  side: 'BUY' | 'SELL';
  price: string;
  size: string;
  filled_size: string;
  remaining_size: string;
  status: 'LIVE' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
  created_at: number;
  updated_at: number;
  expiration: number;
}

export interface CreateOrderParams {
  tokenID: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  feeRateBps?: number;
  nonce?: number;
  expiration?: number;
}

export interface SignedOrder {
  salt: number;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  side: 'BUY' | 'SELL';
  expiration: string;
  nonce: string;
  feeRateBps: string;
  signatureType: number;
  signature: string;
}

export interface Trade {
  id: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  price: string;
  size: string;
  timestamp: number;
  maker_address: string;
  taker_address?: string;
}

export interface MarketPrice {
  market: string;
  asset_id: string;
  price: string;
  timestamp: number;
}

export interface UserPosition {
  market: string;
  asset_id: string;
  side: 'YES' | 'NO';
  size: string;
  value: string;
  averagePrice: string;
  pnl: string;
}

export interface PolymarketApiResponse<T> {
  data: T;
  count?: number;
  next_cursor?: string;
}

export interface PolymarketTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  eventCount?: number;
  marketCount?: number;
}

export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  LIVE = 'LIVE',
  MATCHED = 'MATCHED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface GetMarketsParams {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  tag?: string;
}

export interface GetEventsParams {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  tag?: string;
}

export interface GetOrderbookParams {
  token_id: string;
}

export interface GetTradesParams {
  market?: string;
  asset_id?: string;
  limit?: number;
  offset?: number;
}

export interface CancelOrderParams {
  orderID: string;
}

export interface CancelAllOrdersParams {
  market?: string;
  asset_id?: string;
}
