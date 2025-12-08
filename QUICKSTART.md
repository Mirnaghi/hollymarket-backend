# Quick Start Guide - HollyMarket API

## Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed
- **Yarn** package manager
- A **Supabase account** ([sign up here](https://supabase.com))
- Access to **Polymarket APIs**

## Setup Steps

### 1. Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

5. Enable Email Auth:
   - Go to **Authentication** → **Providers**
   - Enable **Email** provider
   - Configure email templates for magic links/OTP

### 2. Update Environment Variables

Edit your [.env](.env) file and add your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

All other settings are already configured for development!

### 3. Install Dependencies

```bash
yarn install
```

### 4. Start Development Server

```bash
yarn dev
```

The server will start at `http://localhost:3000`

## Test Your Setup

### 1. Check Health Endpoint

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "v1",
    "environment": "development",
    "services": {
      "polymarket": {
        "api": "https://gamma-api.polymarket.com",
        "clob": "https://clob.polymarket.com"
      }
    }
  }
}
```

### 2. Test Authentication

**Sign in with email:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Check your email for the OTP code, then verify:

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "token": "123456"}'
```

You'll receive an access token in the response!

### 3. Test Market Data

**Get trending markets:**

```bash
curl http://localhost:3000/api/v1/markets/trending
```

**Search markets:**

```bash
curl "http://localhost:3000/api/v1/markets/search?q=bitcoin"
```

**Get market events:**

```bash
curl "http://localhost:3000/api/v1/markets/events?limit=10&active=true"
```

### 4. Test Trading Endpoints

**Get orderbook for a token:**

```bash
curl http://localhost:3000/api/v1/trading/orderbook/TOKEN_ID
```

**Get market price:**

```bash
curl http://localhost:3000/api/v1/trading/price/TOKEN_ID
```

**Get recent trades:**

```bash
curl http://localhost:3000/api/v1/trading/trades/TOKEN_ID
```

## Project Structure Overview

```
api-backend/
├── src/
│   ├── config/          # Environment & configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API routes
│   ├── services/        # Business logic & external APIs
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities (logger, response builder)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── logs/                # Application logs
├── .env                 # Your environment variables
└── package.json
```

## Key Features

✅ **Supabase Auth** - Magic link/OTP authentication
✅ **Polymarket Integration** - Markets, events, orderbook, trading
✅ **Type Safety** - Full TypeScript support
✅ **Error Handling** - Comprehensive error responses
✅ **Logging** - Winston logger with file outputs
✅ **Validation** - Zod schema validation
✅ **Security** - Helmet, CORS, JWT auth

## Available Scripts

```bash
# Development
yarn dev              # Start dev server with hot reload

# Production
yarn build            # Build TypeScript to JavaScript
yarn start            # Run production server

# Code Quality
yarn lint             # Run ESLint
yarn format           # Format code with Prettier
yarn type-check       # Check TypeScript types
```

## API Documentation

Full API documentation is available in [README.md](README.md)

## Troubleshooting

### "Missing or invalid environment variables"

Make sure all required variables in `.env` are set, especially:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### "Polymarket API errors"

The Polymarket API endpoints are public and should work out of the box. If you're getting errors, check:
- Your internet connection
- The Polymarket API status
- Rate limiting (wait a few minutes and try again)

### "Port 3000 already in use"

Change the PORT in your `.env` file:
```env
PORT=3001
```

## Next Steps

1. **Configure your frontend** to connect to this API
2. **Add custom business logic** in the services layer
3. **Implement user profiles** using Supabase database
4. **Add WebSocket support** for real-time updates
5. **Deploy to production** (Vercel, Railway, Render, etc.)

## Need Help?

- Check the [README.md](README.md) for full documentation
- Review TypeScript types in `src/types/`
- Look at controller examples in `src/controllers/`

Happy coding! 🚀
