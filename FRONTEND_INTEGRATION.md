# Frontend Integration Guide - Next.js

Complete guide for integrating HollyMarket API with your Next.js application, including TypeScript types, API client setup, and real response examples.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [API Client Setup](#api-client-setup)
3. [TypeScript Types](#typescript-types)
4. [Authentication Integration](#authentication-integration)
5. [Markets & Events Integration](#markets--events-integration)
6. [Trading Integration](#trading-integration)
7. [Response Examples](#response-examples)
8. [Error Handling](#error-handling)
9. [React Hooks Examples](#react-hooks-examples)

---

## Setup & Configuration

### Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

### Environment Variables

Create `.env.local` in your Next.js root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## API Client Setup

### Create API Client (`lib/api-client.ts`)

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  // Auth methods
  async signIn(email: string) {
    const { data } = await this.client.post('/auth/signin', { email });
    return data;
  }

  async verifyOtp(email: string, token: string) {
    const { data } = await this.client.post('/auth/verify', { email, token });
    if (data.success && data.data.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async signOut() {
    const { data } = await this.client.post('/auth/signout');
    this.clearToken();
    return data;
  }

  // Markets methods
  async getEvents(params?: { limit?: number; offset?: number; active?: boolean }) {
    const { data } = await this.client.get('/markets/events', { params });
    return data;
  }

  async getEventBySlug(slug: string) {
    const { data } = await this.client.get(`/markets/events/${slug}`);
    return data;
  }

  async getMarkets(params?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    archived?: boolean;
    tag?: string;
  }) {
    const { data } = await this.client.get('/markets', { params });
    return data;
  }

  async getMarketBySlug(slug: string) {
    const { data } = await this.client.get(`/markets/slug/${slug}`);
    return data;
  }

  async getMarketById(id: string) {
    const { data } = await this.client.get(`/markets/${id}`);
    return data;
  }

  async searchMarkets(query: string) {
    const { data } = await this.client.get('/markets/search', { params: { q: query } });
    return data;
  }

  async getFeaturedMarkets() {
    const { data } = await this.client.get('/markets/featured');
    return data;
  }

  async getTrendingMarkets() {
    const { data } = await this.client.get('/markets/trending');
    return data;
  }

  // Trading methods
  async getOrderbook(tokenId: string, depth?: number) {
    const { data } = await this.client.get(`/trading/orderbook/${tokenId}`, {
      params: depth ? { depth } : undefined,
    });
    return data;
  }

  async getMarketPrice(tokenId: string) {
    const { data } = await this.client.get(`/trading/price/${tokenId}`);
    return data;
  }

  async getMidpointPrice(tokenId: string) {
    const { data } = await this.client.get(`/trading/midpoint/${tokenId}`);
    return data;
  }

  async getSpread(tokenId: string) {
    const { data } = await this.client.get(`/trading/spread/${tokenId}`);
    return data;
  }

  async getRecentTrades(tokenId: string, limit?: number) {
    const { data } = await this.client.get(`/trading/trades/${tokenId}`, {
      params: limit ? { limit } : undefined,
    });
    return data;
  }

  async getUserOrders(address: string) {
    const { data } = await this.client.get(`/trading/orders/${address}`);
    return data;
  }

  async createOrder(signedOrder: any) {
    const { data } = await this.client.post('/trading/order', signedOrder);
    return data;
  }

  async cancelOrder(orderID: string) {
    const { data } = await this.client.delete('/trading/order', { data: { orderID } });
    return data;
  }
}

export const apiClient = new ApiClient();
```

---

## TypeScript Types

### Create Types (`types/api.ts`)

```typescript
// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Event types
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

// Market types
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

// Orderbook types
export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface OrderbookSummary {
  market: string;
  asset_id: string;
  hash: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: number;
}

// Order types
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

// Trade types
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

// Price types
export interface MarketPrice {
  market: string;
  asset_id: string;
  price: string;
  timestamp: number;
}

export interface SpreadData {
  tokenId: string;
  bid: string;
  ask: string;
  spread: string;
}
```

---

## Authentication Integration

### Login Component Example

```typescript
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.signIn(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.verifyOtp(email, otp);
      if (response.success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
        <p className="mb-4 text-gray-600">
          We sent a code to {email}
        </p>
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full p-3 border rounded mb-4"
            maxLength={6}
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        <button
          onClick={() => setStep('email')}
          className="mt-4 text-blue-500 hover:underline"
        >
          ← Back to email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <form onSubmit={handleSendOtp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 border rounded mb-4"
          required
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
```

---

## Markets & Events Integration

### Markets List Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketMarket } from '@/types/api';

export default function MarketsPage() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'featured' | 'trending' | 'all'>('featured');

  useEffect(() => {
    loadMarkets();
  }, [filter]);

  const loadMarkets = async () => {
    setLoading(true);
    try {
      let response;
      if (filter === 'featured') {
        response = await apiClient.getFeaturedMarkets();
      } else if (filter === 'trending') {
        response = await apiClient.getTrendingMarkets();
      } else {
        response = await apiClient.getMarkets({ active: true, limit: 50 });
      }

      setMarkets(response.data.markets);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading markets...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Prediction Markets</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('featured')}
          className={`px-4 py-2 rounded ${
            filter === 'featured' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Featured
        </button>
        <button
          onClick={() => setFilter('trending')}
          className={`px-4 py-2 rounded ${
            filter === 'trending' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          All Markets
        </button>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: PolymarketMarket }) {
  const yesPrice = parseFloat(market.outcomePrices[0] || '0') * 100;
  const noPrice = 100 - yesPrice;

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <h3 className="font-semibold mb-2">{market.question}</h3>

      {market.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {market.description}
        </p>
      )}

      <div className="flex justify-between mb-4">
        <div className="flex-1 mr-2">
          <div className="text-sm text-gray-600">YES</div>
          <div className="text-2xl font-bold text-green-500">
            {yesPrice.toFixed(1)}¢
          </div>
        </div>
        <div className="flex-1 ml-2">
          <div className="text-sm text-gray-600">NO</div>
          <div className="text-2xl font-bold text-red-500">
            {noPrice.toFixed(1)}¢
          </div>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>Vol: ${(market.volume / 1000000).toFixed(1)}M</span>
        <span>Liq: ${(market.liquidity / 1000000).toFixed(1)}M</span>
      </div>

      <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Trade
      </button>
    </div>
  );
}
```

### Events Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketEvent } from '@/types/api';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await apiClient.getEvents({ active: true, limit: 20 });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading events...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Event Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: PolymarketEvent }) {
  return (
    <Link href={`/events/${event.slug}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">{event.title}</h2>

          {event.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-200 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>{event.markets.length} markets</span>
            {event.volume && (
              <span>Vol: ${(event.volume / 1000000).toFixed(1)}M</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

### Event Detail Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { PolymarketEvent } from '@/types/api';

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<PolymarketEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      loadEvent(params.slug as string);
    }
  }, [params.slug]);

  const loadEvent = async (slug: string) => {
    try {
      const response = await apiClient.getEventBySlug(slug);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center p-8">Event not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

      {event.description && (
        <p className="text-gray-600 mb-6 text-lg">{event.description}</p>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Markets ({event.markets.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.markets.map((market) => (
            <div key={market.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{market.question}</h3>

              <div className="flex justify-between mb-2">
                <span className="text-green-500">
                  YES {(parseFloat(market.outcomePrices[0]) * 100).toFixed(1)}¢
                </span>
                <span className="text-red-500">
                  NO {(100 - parseFloat(market.outcomePrices[0]) * 100).toFixed(1)}¢
                </span>
              </div>

              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Trade
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Response Examples

### 1. Get Events Response

**Request:**
```bash
GET /api/v1/markets/events?limit=2&active=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "events": [
      {
        "id": "21442",
        "slug": "2024-presidential-election",
        "title": "2024 Presidential Election",
        "description": "Who will win the 2024 United States presidential election?",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-11-06T00:00:00.000Z",
        "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/2024-presidential-election.png",
        "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/icon.png",
        "active": true,
        "closed": false,
        "archived": false,
        "markets": [
          {
            "id": "0x123abc...",
            "question": "Will Donald Trump win the 2024 Presidential Election?",
            "slug": "will-donald-trump-win-2024",
            "conditionId": "0x456def...",
            "resolutionSource": "Electoral College",
            "endDate": "2024-11-06T00:00:00.000Z",
            "liquidity": 5420000,
            "volume": 15800000,
            "active": true,
            "closed": false,
            "archived": false,
            "new": false,
            "featured": true,
            "submitted_by": "Polymarket",
            "outcomes": ["Yes", "No"],
            "outcomePrices": ["0.52", "0.48"],
            "clobTokenIds": ["token_yes_123", "token_no_456"],
            "description": "This market will resolve to Yes if Donald Trump wins...",
            "category": "Politics"
          }
        ],
        "tags": ["Politics", "US Election", "2024"],
        "commentCount": 1250,
        "liquidity": 5420000,
        "volume": 15800000
      },
      {
        "id": "21443",
        "slug": "bitcoin-price-2024",
        "title": "Bitcoin Price Predictions",
        "description": "Bitcoin price milestones for 2024",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.000Z",
        "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/bitcoin-2024.png",
        "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/btc-icon.png",
        "active": true,
        "closed": false,
        "archived": false,
        "markets": [
          {
            "id": "0x789ghi...",
            "question": "Will Bitcoin reach $100,000 in 2024?",
            "slug": "bitcoin-100k-2024",
            "conditionId": "0xabc123...",
            "resolutionSource": "CoinGecko",
            "endDate": "2024-12-31T23:59:59.000Z",
            "liquidity": 2300000,
            "volume": 8900000,
            "active": true,
            "closed": false,
            "archived": false,
            "new": false,
            "featured": true,
            "submitted_by": "CryptoTrader",
            "outcomes": ["Yes", "No"],
            "outcomePrices": ["0.38", "0.62"],
            "clobTokenIds": ["token_yes_789", "token_no_012"],
            "description": "Resolves Yes if Bitcoin reaches $100,000 on CoinGecko...",
            "category": "Crypto"
          }
        ],
        "tags": ["Crypto", "Bitcoin", "Price"],
        "commentCount": 890,
        "liquidity": 2300000,
        "volume": 8900000
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Featured Markets Response

**Request:**
```bash
GET /api/v1/markets/featured
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "markets": [
      {
        "id": "0x123abc...",
        "question": "Will AI replace more than 50% of jobs by 2030?",
        "slug": "ai-jobs-2030",
        "conditionId": "0x456def...",
        "resolutionSource": "Bureau of Labor Statistics",
        "endDate": "2030-12-31T23:59:59.000Z",
        "liquidity": 3200000,
        "volume": 9500000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": false,
        "featured": true,
        "submitted_by": "TechFuturist",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.24", "0.76"],
        "clobTokenIds": ["token_yes_ai1", "token_no_ai1"],
        "description": "This market will resolve to Yes if AI replaces...",
        "category": "Technology",
        "marketMakerAddress": "0xmarket123...",
        "createdAt": "2024-01-15T00:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "0x789xyz...",
        "question": "Will SpaceX land humans on Mars before 2030?",
        "slug": "spacex-mars-2030",
        "conditionId": "0xabc789...",
        "resolutionSource": "NASA / SpaceX Official Announcement",
        "endDate": "2030-12-31T23:59:59.000Z",
        "liquidity": 1800000,
        "volume": 4200000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": true,
        "featured": true,
        "submitted_by": "SpaceEnthusiast",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.15", "0.85"],
        "clobTokenIds": ["token_yes_mars", "token_no_mars"],
        "description": "Resolves Yes if SpaceX successfully lands humans...",
        "category": "Space"
      },
      {
        "id": "0xdef456...",
        "question": "Will global temperatures rise above 1.5°C by 2025?",
        "slug": "climate-15c-2025",
        "conditionId": "0x321fed...",
        "resolutionSource": "NOAA / NASA Climate Data",
        "endDate": "2025-12-31T23:59:59.000Z",
        "liquidity": 950000,
        "volume": 2800000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": false,
        "featured": true,
        "submitted_by": "ClimateWatch",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.68", "0.32"],
        "clobTokenIds": ["token_yes_temp", "token_no_temp"],
        "description": "This market resolves to Yes if global average...",
        "category": "Climate"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 3. Get Trending Markets Response

**Request:**
```bash
GET /api/v1/markets/trending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "markets": [
      {
        "id": "0xabc999...",
        "question": "Will Apple release AR glasses in 2025?",
        "slug": "apple-ar-glasses-2025",
        "conditionId": "0x111bbb...",
        "resolutionSource": "Apple Official Release",
        "endDate": "2025-12-31T23:59:59.000Z",
        "liquidity": 2100000,
        "volume": 12500000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": true,
        "featured": false,
        "submitted_by": "AppleWatcher",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.42", "0.58"],
        "clobTokenIds": ["token_yes_apple", "token_no_apple"],
        "category": "Technology"
      },
      {
        "id": "0xdef888...",
        "question": "Will Ethereum switch to PoS 2.0 in 2025?",
        "slug": "ethereum-pos2-2025",
        "conditionId": "0x222ccc...",
        "resolutionSource": "Ethereum Foundation",
        "endDate": "2025-12-31T23:59:59.000Z",
        "liquidity": 1600000,
        "volume": 7800000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": false,
        "featured": false,
        "submitted_by": "EthDev",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.65", "0.35"],
        "clobTokenIds": ["token_yes_eth", "token_no_eth"],
        "category": "Crypto"
      },
      {
        "id": "0xghi777...",
        "question": "Will there be a recession in the US in 2025?",
        "slug": "us-recession-2025",
        "conditionId": "0x333ddd...",
        "resolutionSource": "NBER (National Bureau of Economic Research)",
        "endDate": "2025-12-31T23:59:59.000Z",
        "liquidity": 4500000,
        "volume": 18200000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": false,
        "featured": true,
        "submitted_by": "EconAnalyst",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.28", "0.72"],
        "clobTokenIds": ["token_yes_rec", "token_no_rec"],
        "category": "Economics"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Search Markets Response

**Request:**
```bash
GET /api/v1/markets/search?q=bitcoin
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "query": "bitcoin",
    "markets": [
      {
        "id": "0x789ghi...",
        "question": "Will Bitcoin reach $100,000 in 2024?",
        "slug": "bitcoin-100k-2024",
        "conditionId": "0xabc123...",
        "resolutionSource": "CoinGecko",
        "endDate": "2024-12-31T23:59:59.000Z",
        "liquidity": 2300000,
        "volume": 8900000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": false,
        "featured": true,
        "submitted_by": "CryptoTrader",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.38", "0.62"],
        "clobTokenIds": ["token_yes_789", "token_no_012"],
        "category": "Crypto"
      },
      {
        "id": "0xjkl456...",
        "question": "Will Bitcoin ETF be approved in 2024?",
        "slug": "bitcoin-etf-2024",
        "conditionId": "0xdef456...",
        "resolutionSource": "SEC Official Announcement",
        "endDate": "2024-12-31T23:59:59.000Z",
        "liquidity": 1800000,
        "volume": 6500000,
        "active": true,
        "closed": false,
        "archived": false,
        "new": false,
        "featured": false,
        "submitted_by": "ETFWatcher",
        "outcomes": ["Yes", "No"],
        "outcomePrices": ["0.88", "0.12"],
        "clobTokenIds": ["token_yes_etf", "token_no_etf"],
        "category": "Crypto"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 5. Get Market by Slug Response

**Request:**
```bash
GET /api/v1/markets/slug/bitcoin-100k-2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "0x789ghi...",
    "question": "Will Bitcoin reach $100,000 in 2024?",
    "slug": "bitcoin-100k-2024",
    "conditionId": "0xabc123...",
    "resolutionSource": "CoinGecko",
    "endDate": "2024-12-31T23:59:59.000Z",
    "liquidity": 2300000,
    "volume": 8900000,
    "active": true,
    "closed": false,
    "archived": false,
    "new": false,
    "featured": true,
    "submitted_by": "CryptoTrader",
    "outcomes": ["Yes", "No"],
    "outcomePrices": ["0.38", "0.62"],
    "clobTokenIds": ["token_yes_789", "token_no_012"],
    "description": "This market will resolve to Yes if Bitcoin (BTC) reaches or exceeds $100,000 USD on CoinGecko at any point during 2024. The resolution will be based on the highest price recorded on CoinGecko's Bitcoin USD price chart during the calendar year 2024 (January 1, 2024 00:00:00 UTC to December 31, 2024 23:59:59 UTC).",
    "category": "Crypto",
    "marketMakerAddress": "0xmarket456...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:25:00.000Z"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 6. Get Orderbook Response

**Request:**
```bash
GET /api/v1/trading/orderbook/token_yes_789?depth=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "market": "0x789ghi...",
    "asset_id": "token_yes_789",
    "hash": "0xhash123...",
    "bids": [
      {
        "price": "0.37",
        "size": "5000"
      },
      {
        "price": "0.36",
        "size": "8500"
      },
      {
        "price": "0.35",
        "size": "12000"
      },
      {
        "price": "0.34",
        "size": "15000"
      },
      {
        "price": "0.33",
        "size": "20000"
      }
    ],
    "asks": [
      {
        "price": "0.38",
        "size": "4500"
      },
      {
        "price": "0.39",
        "size": "7000"
      },
      {
        "price": "0.40",
        "size": "10000"
      },
      {
        "price": "0.41",
        "size": "13000"
      },
      {
        "price": "0.42",
        "size": "18000"
      }
    ],
    "timestamp": 1705318200000
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 7. Get Market Price Response

**Request:**
```bash
GET /api/v1/trading/price/token_yes_789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "market": "0x789ghi...",
    "asset_id": "token_yes_789",
    "price": "0.38",
    "timestamp": 1705318200000
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 8. Get Recent Trades Response

**Request:**
```bash
GET /api/v1/trading/trades/token_yes_789?limit=3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "tokenId": "token_yes_789",
    "trades": [
      {
        "id": "trade_001",
        "market": "0x789ghi...",
        "asset_id": "token_yes_789",
        "side": "BUY",
        "price": "0.38",
        "size": "500",
        "timestamp": 1705318200000,
        "maker_address": "0xmaker123...",
        "taker_address": "0xtaker456..."
      },
      {
        "id": "trade_002",
        "market": "0x789ghi...",
        "asset_id": "token_yes_789",
        "side": "SELL",
        "price": "0.37",
        "size": "750",
        "timestamp": 1705318140000,
        "maker_address": "0xmaker789...",
        "taker_address": "0xtaker012..."
      },
      {
        "id": "trade_003",
        "market": "0x789ghi...",
        "asset_id": "token_yes_789",
        "side": "BUY",
        "price": "0.38",
        "size": "1000",
        "timestamp": 1705318080000,
        "maker_address": "0xmaker345...",
        "taker_address": "0xtaker678..."
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 9. Authentication Response

**Sign In Request:**
```bash
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Sign In Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your email address",
    "email": "user@example.com"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

**Verify OTP Request:**
```bash
POST /api/v1/auth/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}
```

**Verify OTP Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 10. Error Response Example

**Request:**
```bash
GET /api/v1/markets/slug/non-existent-market
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## React Hooks Examples

### useMarkets Hook

```typescript
// hooks/useMarkets.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketMarket } from '@/types/api';

export function useMarkets(filter: 'featured' | 'trending' | 'all' = 'all') {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets();
  }, [filter]);

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (filter) {
        case 'featured':
          response = await apiClient.getFeaturedMarkets();
          break;
        case 'trending':
          response = await apiClient.getTrendingMarkets();
          break;
        default:
          response = await apiClient.getMarkets({ active: true, limit: 50 });
      }

      setMarkets(response.data.markets);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => loadMarkets();

  return { markets, loading, error, refresh };
}
```

### useMarketDetail Hook

```typescript
// hooks/useMarketDetail.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketMarket } from '@/types/api';

export function useMarketDetail(slug: string) {
  const [market, setMarket] = useState<PolymarketMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadMarket();
    }
  }, [slug]);

  const loadMarket = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getMarketBySlug(slug);
      setMarket(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load market');
    } finally {
      setLoading(false);
    }
  };

  return { market, loading, error, refresh: loadMarket };
}
```

### useOrderbook Hook

```typescript
// hooks/useOrderbook.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { OrderbookSummary } from '@/types/api';

export function useOrderbook(tokenId: string, depth: number = 10) {
  const [orderbook, setOrderbook] = useState<OrderbookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenId) {
      loadOrderbook();

      // Refresh every 5 seconds
      const interval = setInterval(loadOrderbook, 5000);
      return () => clearInterval(interval);
    }
  }, [tokenId, depth]);

  const loadOrderbook = async () => {
    try {
      const response = await apiClient.getOrderbook(tokenId, depth);
      setOrderbook(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load orderbook');
    } finally {
      setLoading(false);
    }
  };

  return { orderbook, loading, error, refresh: loadOrderbook };
}
```

### useAuth Hook

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return { user, loading, isAuthenticated, signOut, refresh: checkAuth };
}
```

---

## Error Handling

### Global Error Handler

```typescript
// lib/error-handler.ts
import { AxiosError } from 'axios';

export function handleApiError(error: any): string {
  if (error.response) {
    // Server responded with error
    const apiError = error.response.data?.error;
    return apiError?.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
}
```

### Usage in Components

```typescript
import { handleApiError } from '@/lib/error-handler';

try {
  await apiClient.getMarkets();
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage);
}
```

---

## Next Steps

1. **Copy the API client** to your Next.js project
2. **Copy the TypeScript types** for type safety
3. **Implement the components** based on examples above
4. **Add error boundaries** for better error handling
5. **Add loading states** for better UX
6. **Implement caching** with React Query or SWR (optional)
7. **Add WebSocket support** for real-time updates (future enhancement)

## Support

For questions or issues:
- Check the main [README.md](README.md)
- Review [QUICKSTART.md](QUICKSTART.md)
- Test endpoints with the examples above
