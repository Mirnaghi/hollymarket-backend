# HollyMarket API Backend

A production-grade TypeScript API backend for a prediction market application, integrating Polymarket's infrastructure with Supabase authentication.

## Features

- 🔐 **Supabase Authentication** - Magic link/OTP email authentication
- 📊 **Polymarket Integration** - Full access to events, markets, and orderbook
- 📈 **Trading Support** - Create, cancel, and manage orders on Polymarket CLOB
- 🏆 **Builder Attribution** - Remote signing endpoint for Polymarket builder credit
- 💬 **Comments Service** - Fetch and display Polymarket community comments
- 🏗️ **Clean Architecture** - Modular, maintainable, and testable code structure
- 🔒 **Type Safety** - Full TypeScript support with strict type checking
- 📝 **Comprehensive Logging** - Winston logger with file and console outputs
- 🛡️ **Security** - Helmet, CORS, input validation with Zod
- ⚡ **Performance** - Async/await, error handling, graceful shutdown

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Supabase Auth
- **Market Data**: Polymarket API & CLOB
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS

## Project Structure

```
api-backend/
├── src/
│   ├── config/
│   │   └── env.ts                 # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts     # Authentication endpoints
│   │   ├── markets.controller.ts  # Markets & events endpoints
│   │   └── trading.controller.ts  # Trading & orderbook endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── error.middleware.ts    # Global error handler
│   │   ├── request-logger.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── markets.routes.ts
│   │   ├── trading.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── auth.service.ts        # Supabase auth logic
│   │   ├── supabase.service.ts    # Supabase client
│   │   ├── polymarket-api.service.ts  # Polymarket API client
│   │   └── polymarket-clob.service.ts # CLOB trading client
│   ├── types/
│   │   ├── index.ts               # Common types
│   │   └── polymarket.types.ts    # Polymarket-specific types
│   ├── utils/
│   │   ├── logger.ts              # Winston logger setup
│   │   └── response.ts            # Response builder utility
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Server entry point
├── logs/                          # Application logs
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Yarn package manager
- Supabase account
- Access to Polymarket APIs

### Installation

1. **Clone the repository**

```bash
cd api-backend
```

2. **Install dependencies**

```bash
yarn install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Polymarket
POLYMARKET_API_URL=https://gamma-api.polymarket.com
POLYMARKET_CLOB_API_URL=https://clob.polymarket.com
POLYMARKET_CHAIN_ID=137
POLYMARKET_FUNDER_PRIVATE_KEY=optional_for_signing

# Polymarket Builder Credentials (for builder attribution)
POLYMARKET_BUILDER_API_KEY=your_builder_api_key
POLYMARKET_BUILDER_SECRET=your_builder_secret
POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. **Run the development server**

```bash
yarn dev
```

The server will start on `http://localhost:3000`

### Build for Production

```bash
yarn build
yarn start
```

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Sign In with OTP

```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP

```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "accessToken": "jwt_token"
  }
}
```

#### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Sign Out

```http
POST /api/v1/auth/signout
Authorization: Bearer <token>
```

### Markets Endpoints

#### Get Tags

```http
GET /api/v1/markets/tags
```

Returns all available tags/categories from Polymarket.

#### Get Events

```http
GET /api/v1/markets/events?limit=50&offset=0&active=true&tag_id=politics
```

Supports filtering by tag_id, active status, closed, and archived.

#### Get Events by Tag

```http
GET /api/v1/markets/events/tag/:tagId?limit=50&active=true
```

Fetch events filtered by a specific tag ID.

#### Get Event by Slug

```http
GET /api/v1/markets/events/:slug
```

#### Get Markets

```http
GET /api/v1/markets?limit=50&offset=0&active=true&tag=politics
```

#### Get Featured Markets

```http
GET /api/v1/markets/featured
```

#### Get Trending Markets

```http
GET /api/v1/markets/trending
```

#### Search Markets

```http
GET /api/v1/markets/search?q=bitcoin
```

#### Get Market by Slug

```http
GET /api/v1/markets/slug/:slug
```

#### Get Market by ID

```http
GET /api/v1/markets/:id
```

### Trading Endpoints

#### Get Orderbook

```http
GET /api/v1/trading/orderbook/:tokenId?depth=10
```

#### Get Market Price

```http
GET /api/v1/trading/price/:tokenId
```

#### Get Midpoint Price

```http
GET /api/v1/trading/midpoint/:tokenId
```

#### Get Spread

```http
GET /api/v1/trading/spread/:tokenId
```

#### Get Trades

```http
GET /api/v1/trading/trades?limit=20&market=market_id
```

#### Get Recent Trades for Token

```http
GET /api/v1/trading/trades/:tokenId?limit=20
```

#### Get User Orders (Protected)

```http
GET /api/v1/trading/orders/:address
Authorization: Bearer <token>
```

#### Create Order (Protected)

```http
POST /api/v1/trading/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "salt": 123456,
  "maker": "0x...",
  "signer": "0x...",
  "taker": "0x...",
  "tokenId": "token_id",
  "makerAmount": "100",
  "takerAmount": "50",
  "side": "BUY",
  "expiration": "1234567890",
  "nonce": "1",
  "feeRateBps": "0",
  "signatureType": 0,
  "signature": "0x..."
}
```

#### Cancel Order (Protected)

```http
DELETE /api/v1/trading/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderID": "order_id"
}
```

#### Cancel All Orders (Protected)

```http
DELETE /api/v1/trading/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "0x...",
  "market": "market_id",
  "asset_id": "asset_id"
}
```

#### Get Tick Size

```http
GET /api/v1/trading/tick-size/:tokenId
```

#### Get Min Order Size

```http
GET /api/v1/trading/min-order-size/:tokenId
```

### Comments Endpoints

#### Get Comments

```http
GET /api/v1/comments?limit=50&offset=0&parent_entity_type=Event&parent_entity_id=123
```

Query parameters:
- `limit` - Number of comments to return (>= 0)
- `offset` - Number of comments to skip (>= 0)
- `order` - Comma-separated fields to order by
- `ascending` - Sort order (true/false)
- `parent_entity_type` - Filter by entity type (Event, Series, market)
- `parent_entity_id` - Filter by parent entity ID
- `get_positions` - Include position data (true/false)
- `holders_only` - Only show comments from token holders (true/false)

### Polymarket CLOB Builder Endpoints

#### Remote Signing Endpoint

```http
POST /api/v1/polymarket/sign
Content-Type: application/json

{
  "method": "POST",
  "path": "/order",
  "body": "{\"market\":\"0x123...\",\"side\":\"BUY\",...}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "POLY_BUILDER_API_KEY": "your_api_key",
    "POLY_BUILDER_SIGNATURE": "signature_hash",
    "POLY_BUILDER_TIMESTAMP": 1703001234567,
    "POLY_BUILDER_PASSPHRASE": "your_passphrase"
  }
}
```

This endpoint is automatically called by the Polymarket CLOB client on the frontend for builder attribution.

#### Builder Configuration Status

```http
GET /api/v1/polymarket/builder-info
```

### Health Check

```http
GET /api/v1/health
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable

## Development

### Code Style

- ESLint for linting
- Prettier for formatting
- Strict TypeScript configuration

```bash
# Run linter
yarn lint

# Format code
yarn format

# Type check
yarn type-check
```

### Logging

Logs are written to:
- Console (all environments)
- `logs/all.log` (all logs)
- `logs/error.log` (errors only)

## Security Best Practices

- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ JWT authentication
- ✅ Environment variable validation
- ✅ Rate limiting ready
- ✅ SQL injection prevention (via Supabase)
- ✅ XSS protection

## Documentation

### Complete Guides

- **[POLYMARKET_CLOB_INTEGRATION.md](POLYMARKET_CLOB_INTEGRATION.md)** - Complete guide for implementing Polymarket CLOB trading with remote builder signing
- **[FRONTEND_REQUIREMENTS.md](FRONTEND_REQUIREMENTS.md)** - Frontend developer checklist and quick reference for CLOB integration
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide for getting started
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture documentation
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend integration examples and best practices
- **[TAGS_API_GUIDE.md](TAGS_API_GUIDE.md)** - Guide for using tags to filter events and markets

## Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Build the application: `yarn build`
4. Start the server: `yarn start`

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
