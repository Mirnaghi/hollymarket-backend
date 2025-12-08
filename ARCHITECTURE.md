# Architecture Documentation - HollyMarket API

## Overview

HollyMarket API is a production-grade TypeScript backend designed for prediction market trading applications. It integrates Polymarket's infrastructure with Supabase authentication, following clean architecture principles and industry best practices.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
│            (Web, Mobile, Desktop Applications)              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    HollyMarket API Server                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Express.js Middleware Layer              │  │
│  │  • CORS • Helmet • Body Parser • Request Logger      │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Route Layer                         │  │
│  │  • /auth     • /markets     • /trading               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Authentication Middleware                   │  │
│  │  • JWT Validation  • User Context                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Validation Middleware (Zod)                │  │
│  │  • Request Schema Validation                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Controller Layer                      │  │
│  │  • AuthController  • MarketsController               │  │
│  │  • TradingController                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Service Layer                        │  │
│  │  • AuthService     • PolymarketApiService            │  │
│  │  • SupabaseService • PolymarketClobService           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Error Handling Middleware                │  │
│  │  • Global Error Handler  • Not Found Handler         │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────┬─────────────────────────┘
               │                      │
               ▼                      ▼
    ┌──────────────────┐   ┌──────────────────────┐
    │  Supabase Auth   │   │   Polymarket APIs    │
    │  • Magic Links   │   │   • Gamma API        │
    │  • OTP           │   │   • CLOB API         │
    │  • User Mgmt     │   │   • Orderbook        │
    └──────────────────┘   └──────────────────────┘
```

## Layer Responsibilities

### 1. Configuration Layer (`src/config/`)

**Purpose:** Centralized environment configuration and validation

**Files:**
- `env.ts` - Environment variable validation with Zod, configuration exports

**Key Features:**
- Type-safe environment variables
- Validation on startup (fail fast)
- Centralized configuration object
- Separate configs for server, auth, polymarket, CORS, rate limiting

### 2. Types Layer (`src/types/`)

**Purpose:** TypeScript type definitions and custom error classes

**Files:**
- `index.ts` - Common types, API responses, custom error classes
- `polymarket.types.ts` - Polymarket-specific types (events, markets, orders, trades)

**Key Types:**
- `AuthenticatedRequest` - Extended Express request with user context
- `ApiResponse<T>` - Standardized API response format
- Custom error classes: `ApiError`, `ValidationError`, `AuthenticationError`, etc.
- Polymarket domain types: `PolymarketEvent`, `PolymarketMarket`, `Order`, `Trade`

### 3. Utilities Layer (`src/utils/`)

**Purpose:** Reusable utility functions and helpers

**Files:**
- `logger.ts` - Winston logger configuration (console + file logging)
- `response.ts` - Response builder for consistent API responses

**Features:**
- Centralized logging with different levels (error, warn, info, http, debug)
- Log rotation and file storage
- Consistent response formatting (success/error)

### 4. Service Layer (`src/services/`)

**Purpose:** Business logic and external API integration

**Files:**
- `supabase.service.ts` - Supabase client singleton
- `auth.service.ts` - Authentication business logic
- `polymarket-api.service.ts` - Polymarket Gamma API client
- `polymarket-clob.service.ts` - Polymarket CLOB (trading) API client

**Design Patterns:**
- Singleton pattern for service instances
- Dependency injection ready
- Clear separation of concerns
- Error transformation and handling

**Service Responsibilities:**

#### AuthService
- OTP generation and verification
- User authentication and session management
- Token validation
- User CRUD operations

#### PolymarketApiService
- Fetch events and markets
- Search and filter markets
- Get featured/trending markets
- Market metadata retrieval

#### PolymarketClobService
- Orderbook retrieval and depth
- Market price queries (spot, midpoint, spread)
- Trade history
- Order management (create, cancel, query)
- Trading parameters (tick size, min order size)

### 5. Middleware Layer (`src/middleware/`)

**Purpose:** Request/response processing, validation, and authentication

**Files:**
- `auth.middleware.ts` - JWT authentication (required and optional)
- `validation.middleware.ts` - Zod schema validation
- `error.middleware.ts` - Global error handling and not found handler
- `request-logger.middleware.ts` - HTTP request logging

**Middleware Flow:**
1. Request Logger → logs incoming requests
2. Authentication → validates JWT (if required)
3. Validation → validates request schema
4. Controller → processes request
5. Error Handler → catches and formats errors

### 6. Controller Layer (`src/controllers/`)

**Purpose:** Handle HTTP requests and orchestrate services

**Files:**
- `auth.controller.ts` - Authentication endpoints
- `markets.controller.ts` - Market and event endpoints
- `trading.controller.ts` - Trading and orderbook endpoints

**Responsibilities:**
- Extract request data (params, query, body)
- Call service methods
- Build and send responses
- Error propagation to error handler

**Pattern:**
- Each controller is a class with async methods
- Methods are thin - delegate to services
- Use ResponseBuilder for consistent responses

### 7. Routes Layer (`src/routes/`)

**Purpose:** API endpoint definitions and middleware composition

**Files:**
- `auth.routes.ts` - Authentication routes
- `markets.routes.ts` - Market and event routes
- `trading.routes.ts` - Trading routes
- `index.ts` - Route aggregation and health check

**Route Patterns:**

**Public Routes** (no auth):
- GET `/api/v1/health`
- POST `/api/v1/auth/signin`
- POST `/api/v1/auth/verify`

**Optional Auth Routes** (auth enhances response):
- GET `/api/v1/markets/*`
- GET `/api/v1/trading/orderbook/:tokenId`
- GET `/api/v1/trading/price/:tokenId`

**Protected Routes** (auth required):
- GET `/api/v1/auth/me`
- POST `/api/v1/auth/signout`
- POST `/api/v1/trading/order`
- DELETE `/api/v1/trading/order`

### 8. Application Layer (`src/`)

**Files:**
- `app.ts` - Express app configuration
- `server.ts` - Server startup and lifecycle management

**App Setup:**
1. Security headers (Helmet)
2. CORS configuration
3. Body parsing (JSON, URL-encoded)
4. Request logging
5. Route mounting
6. Error handling

**Server Features:**
- Graceful shutdown (SIGTERM, SIGINT)
- Uncaught exception handling
- Process error handlers
- Startup banner with configuration info

## Data Flow

### Authentication Flow

```
1. User requests OTP
   POST /auth/signin { email }
   ↓
2. AuthController.signInWithOtp()
   ↓
3. AuthService.signInWithOtp()
   ↓
4. Supabase sends OTP email
   ↓
5. Response: { message: "OTP sent" }

---

6. User submits OTP
   POST /auth/verify { email, token }
   ↓
7. AuthController.verifyOtp()
   ↓
8. AuthService.verifyOtp()
   ↓
9. Supabase validates OTP
   ↓
10. Response: { user, accessToken }
```

### Protected Request Flow

```
1. Client request with JWT
   GET /auth/me
   Authorization: Bearer <token>
   ↓
2. authenticate middleware
   ↓
3. Extract and validate token
   ↓
4. AuthService.getUserFromToken()
   ↓
5. Supabase validates token
   ↓
6. User added to req.user
   ↓
7. Controller processes request
   ↓
8. Response with user data
```

### Market Data Flow

```
1. Client request
   GET /markets?active=true&limit=10
   ↓
2. Optional auth (if token present)
   ↓
3. MarketsController.getMarkets()
   ↓
4. Parse query parameters
   ↓
5. PolymarketApiService.getMarkets()
   ↓
6. HTTP request to Polymarket API
   ↓
7. Transform response
   ↓
8. Response: { count, markets }
```

### Trading Flow

```
1. Client request orderbook
   GET /trading/orderbook/:tokenId
   ↓
2. TradingController.getOrderbook()
   ↓
3. PolymarketClobService.getOrderbook()
   ↓
4. HTTP request to CLOB API
   ↓
5. Response: { bids, asks, timestamp }
```

## Error Handling Strategy

### Error Hierarchy

```
Error (base)
  └─ ApiError
       ├─ ValidationError (400)
       ├─ AuthenticationError (401)
       ├─ AuthorizationError (403)
       └─ NotFoundError (404)
```

### Error Flow

```
1. Error thrown in service/controller
   ↓
2. Express async error catcher
   ↓
3. errorHandler middleware
   ↓
4. Error type checking
   ↓
5. Appropriate status code
   ↓
6. Standardized error response
   ↓
7. Logged to Winston
   ↓
8. Sent to client
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE",
    "details": { }
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

## Security Measures

### Authentication & Authorization
- JWT-based authentication via Supabase
- Token validation on protected routes
- User context propagation
- Secure session management

### Input Validation
- Zod schema validation for all inputs
- Type-safe request handling
- SQL injection prevention (Supabase handles this)
- XSS prevention through sanitization

### HTTP Security
- Helmet.js security headers
- CORS configuration with origin whitelist
- Request size limits (10MB)
- Rate limiting ready (configuration in place)

### Environment Security
- Environment variable validation
- No secrets in code
- Separate configs for dev/prod
- Service role key protection

## Performance Considerations

### Optimization Strategies
- Async/await throughout (non-blocking)
- Connection pooling (Axios keep-alive)
- Request/response streaming
- Efficient error handling (fail fast)

### Caching Opportunities
- Market data caching (Redis recommended)
- Orderbook snapshots
- User session caching
- API response caching

### Monitoring
- Winston logging to files
- Request/response logging
- Error tracking
- Performance metrics ready

## Scalability

### Horizontal Scaling
- Stateless design (JWT auth)
- No in-memory state
- Load balancer ready
- Database connection pooling

### Vertical Scaling
- Efficient async operations
- Stream-based processing ready
- Memory-efficient logging
- Resource cleanup on shutdown

## Testing Strategy

### Unit Tests (Recommended)
- Service layer methods
- Utility functions
- Error handling
- Type validation

### Integration Tests (Recommended)
- API endpoints
- Middleware chain
- External API mocking
- Database operations

### E2E Tests (Recommended)
- Complete user flows
- Authentication flow
- Trading flow
- Error scenarios

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Set up Supabase production project
4. Configure CORS for production domains

### Build Process
```bash
yarn build        # Compile TypeScript
yarn start        # Run production server
```

### Recommended Platforms
- **Vercel** - Serverless deployment
- **Railway** - Container deployment
- **Render** - Managed deployment
- **AWS/GCP** - Full control
- **Docker** - Containerized deployment

### Production Checklist
- [ ] All environment variables set
- [ ] Supabase production project configured
- [ ] CORS origins updated
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error monitoring set up
- [ ] Health check endpoint verified
- [ ] SSL/TLS certificates configured
- [ ] Database backups enabled
- [ ] Monitoring dashboards set up

## Future Enhancements

### Recommended Features
1. **Rate Limiting** - Implement per-user rate limits
2. **Caching Layer** - Redis for market data
3. **WebSocket Support** - Real-time price updates
4. **User Profiles** - Extended user data in Supabase
5. **Trading History** - Store user trades in database
6. **Analytics** - User behavior and market trends
7. **Notifications** - Email/push for trades and events
8. **Admin Panel** - User management interface
9. **API Versioning** - Support multiple API versions
10. **GraphQL API** - Alternative to REST

### Technical Improvements
- Add comprehensive test suite
- Implement circuit breakers for external APIs
- Add request tracing (OpenTelemetry)
- Implement feature flags
- Add API documentation (Swagger/OpenAPI)
- Set up CI/CD pipeline
- Add database migrations
- Implement background jobs (Bull/BullMQ)

## Maintenance

### Regular Tasks
- Review and rotate logs
- Monitor error rates
- Update dependencies
- Review security advisories
- Performance profiling
- Database optimization

### Debugging
- Check Winston logs in `logs/` directory
- Use `yarn type-check` for type errors
- Set `NODE_ENV=development` for verbose logging
- Use health endpoint to verify services

## Contact & Support

For architecture questions or clarifications, refer to:
- [README.md](README.md) - Usage documentation
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- Source code comments
- TypeScript types as documentation
