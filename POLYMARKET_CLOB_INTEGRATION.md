# Polymarket CLOB Trading Integration Guide

This guide explains how to implement the complete Polymarket CLOB trading flow with **Remote Builder Signing** for your HollyMarket application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation (Complete ✅)](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Trading Flow](#trading-flow)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Remote Signing Architecture

Your HollyMarket API uses a **Remote Signing** architecture to keep your **Builder Secret** secure on the server while allowing users to trade with their own wallets.

```
┌─────────────┐          ┌─────────────┐          ┌──────────────┐
│   Browser   │          │  Your API   │          │  Polymarket  │
│  (Frontend) │          │  (Backend)  │          │     CLOB     │
└──────┬──────┘          └──────┬──────┘          └──────┬───────┘
       │                        │                        │
       │ 1. User signs order    │                        │
       │    with wallet         │                        │
       │                        │                        │
       │ 2. Request builder     │                        │
       │    signature headers   │                        │
       ├───────────────────────>│                        │
       │  POST /polymarket/sign │                        │
       │                        │                        │
       │                        │ 3. Generate HMAC       │
       │                        │    signature with      │
       │                        │    Builder Secret      │
       │                        │                        │
       │ 4. Return headers      │                        │
       │<───────────────────────┤                        │
       │                        │                        │
       │ 5. Submit order with   │                        │
       │    user + builder sigs │                        │
       ├────────────────────────┴───────────────────────>│
       │                                                  │
       │ 6. Order executed                               │
       │    (Builder gets credit)                        │
       │<─────────────────────────────────────────────────┤
```

### Key Components

**Backend (Your API - ✅ Complete)**
- Builder credentials stored securely
- `/api/polymarket/sign` endpoint for remote signing
- HMAC signature generation using `@polymarket/builder-signing-sdk`

**Frontend (Your React/Next.js App - To Implement)**
- Wallet connection (MetaMask, WalletConnect, Privy)
- Gnosis Safe proxy deployment
- CLOB client with remote signing config
- Trading UI

---

## Backend Implementation

### ✅ What's Already Built

Your backend is **fully configured** with:

1. **Environment Variables** (`.env`)
```env
POLYMARKET_BUILDER_API_KEY=019b0006-4209-7adf-bcd2-3ffa76b7979b
POLYMARKET_BUILDER_SECRET=oUUUfnRb5z3jBAJ98dRhjNSkU3ceP0RYQ4BXoFuGrT4=
POLYMARKET_BUILDER_PASSPHRASE=ce46ed53b4dea23e2b3d7073142f20391a49365db8e074ca9449508c26fa17a6
```

2. **Builder Signing Service** (`src/services/builder-signing.service.ts`)
   - Generates HMAC signatures for CLOB requests
   - Validates signing requests
   - Returns builder authentication headers

3. **Wallet Controller** (`src/controllers/wallet.controller.ts`)
   - `/api/polymarket/sign` - Remote signing endpoint
   - `/api/polymarket/builder-info` - Builder config status

4. **API Routes** (`src/routes/wallet.routes.ts`)
   - Mounted at `/api/polymarket/*`

### Backend API Endpoints

#### POST `/api/polymarket/sign`

Generate builder signature headers for CLOB API requests.

**Request:**
```json
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
    "POLY_BUILDER_API_KEY": "019b0006-4209-7adf-bcd2-3ffa76b7979b",
    "POLY_BUILDER_SIGNATURE": "abc123...",
    "POLY_BUILDER_TIMESTAMP": 1703001234567,
    "POLY_BUILDER_PASSPHRASE": "ce46ed53..."
  }
}
```

#### GET `/api/polymarket/builder-info`

Check builder configuration status.

**Response:**
```json
{
  "success": true,
  "data": {
    "builder": {
      "apiKey": "019b0006-4209-7adf-bcd2-3ffa76b7979b",
      "hasSecret": true,
      "hasPassphrase": true,
      "configured": true
    },
    "message": "Builder credentials are configured"
  }
}
```

---

## Frontend Implementation

### Prerequisites

Install required packages:

```bash
npm install @polymarket/builder-relayer-client @polymarket/clob-client ethers@5.7.2
# or
yarn add @polymarket/builder-relayer-client @polymarket/clob-client ethers@5.7.2
```

**Important:** Use ethers v5, not v6. Polymarket SDKs are not compatible with ethers v6.

### Step 1: Wallet Connection

Create a wallet connection hook or service.

**Example with wagmi (recommended):**

```typescript
// hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEthersSigner } from './useEthersSigner'; // Convert wagmi to ethers signer

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const signer = useEthersSigner({ chainId });

  return {
    address,
    isConnected,
    chainId,
    signer,
    connect: () => connect({ connector: connectors[0] }), // MetaMask
    disconnect,
  };
}
```

**Example with ethers directly:**

```typescript
// services/wallet.service.ts
import { ethers } from 'ethers';

export class WalletService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async connect() {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet detected');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.provider.send('eth_requestAccounts', []);
    this.signer = this.provider.getSigner();

    const address = await this.signer.getAddress();
    const chainId = await this.signer.getChainId();

    return { address, chainId, signer: this.signer };
  }

  getSigner() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return this.signer;
  }
}

export const walletService = new WalletService();
```

### Step 2: Relayer Client Setup

Deploy the user's Gnosis Safe proxy and enable token approvals.

```typescript
// services/relayer.service.ts
import { RelayClient } from '@polymarket/builder-relayer-client';
import { ethers } from 'ethers';

const RELAYER_URL = 'https://relayer.polymarket.com'; // Production
const CHAIN_ID = 137; // Polygon
const YOUR_BACKEND_URL = 'https://your-api.com'; // Your backend

export class RelayerService {
  private client: RelayClient | null = null;

  async initialize(signer: ethers.Signer) {
    this.client = new RelayClient(RELAYER_URL, CHAIN_ID, signer, {
      remoteBuilderConfig: {
        url: `${YOUR_BACKEND_URL}/api/polymarket/sign`,
      },
    });

    return this.client;
  }

  /**
   * Deploy user's Gnosis Safe proxy (if not already deployed)
   */
  async deployProxyWallet() {
    if (!this.client) throw new Error('Relayer client not initialized');

    // Check if already deployed
    const isDeployed = await this.client.isDeployed();

    if (!isDeployed) {
      console.log('Deploying proxy wallet...');
      await this.client.deploy();
      console.log('Proxy wallet deployed!');
    } else {
      console.log('Proxy wallet already deployed');
    }

    return this.client.getProxyAddress();
  }

  /**
   * Approve USDC.e token for trading
   * This allows the Polymarket exchange to move funds
   */
  async approveTokens() {
    if (!this.client) throw new Error('Relayer client not initialized');

    console.log('Approving USDC.e tokens...');
    await this.client.approve();
    console.log('Tokens approved!');
  }

  /**
   * Get user's proxy wallet address
   */
  async getProxyAddress() {
    if (!this.client) throw new Error('Relayer client not initialized');
    return this.client.getProxyAddress();
  }
}

export const relayerService = new RelayerService();
```

### Step 3: CLOB Client Setup

Configure the CLOB client with remote signing.

```typescript
// services/clob.service.ts
import { ClobClient } from '@polymarket/clob-client';
import { ethers } from 'ethers';

const CLOB_API_URL = 'https://clob.polymarket.com';
const CHAIN_ID = 137;
const YOUR_BACKEND_URL = 'https://your-api.com';

export class ClobService {
  private client: ClobClient | null = null;

  /**
   * Initialize CLOB client with L2 credentials
   * @param signer - User's wallet signer
   * @param apiKey - User's CLOB API key (from L2 auth)
   * @param secret - User's CLOB secret (from L2 auth)
   * @param passphrase - User's CLOB passphrase (from L2 auth)
   * @param funderAddress - Optional funder address (use proxy wallet)
   */
  async initialize(
    signer: ethers.Signer,
    credentials: {
      apiKey: string;
      secret: string;
      passphrase: string;
    },
    funderAddress?: string
  ) {
    this.client = new ClobClient(
      CLOB_API_URL,
      CHAIN_ID,
      signer,
      credentials,
      2, // signature type
      funderAddress,
      {
        remoteBuilderConfig: {
          url: `${YOUR_BACKEND_URL}/api/polymarket/sign`,
        },
      }
    );

    return this.client;
  }

  /**
   * Create L2 authentication credentials
   * User signs a message once to generate CLOB API credentials
   */
  async deriveApiCredentials(signer: ethers.Signer) {
    if (!this.client) {
      // Temporarily create client to derive credentials
      this.client = new ClobClient(
        CLOB_API_URL,
        CHAIN_ID,
        signer,
        undefined, // No credentials yet
        2
      );
    }

    const credentials = await this.client.deriveApiKey();
    return credentials;
  }

  /**
   * Create a market order
   */
  async createOrder(orderParams: {
    tokenID: string;
    price: number;
    size: number;
    side: 'BUY' | 'SELL';
  }) {
    if (!this.client) throw new Error('CLOB client not initialized');

    const order = await this.client.createOrder({
      tokenID: orderParams.tokenID,
      price: orderParams.price,
      size: orderParams.size,
      side: orderParams.side,
    });

    return order;
  }

  /**
   * Get order book for a token
   */
  async getOrderBook(tokenID: string) {
    if (!this.client) throw new Error('CLOB client not initialized');
    return this.client.getOrderBook(tokenID);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderID: string) {
    if (!this.client) throw new Error('CLOB client not initialized');
    return this.client.cancelOrder(orderID);
  }

  /**
   * Get user's open orders
   */
  async getOrders() {
    if (!this.client) throw new Error('CLOB client not initialized');
    return this.client.getOrders();
  }
}

export const clobService = new ClobService();
```

### Step 4: Complete Trading Flow Component

Put it all together in a React component.

```typescript
// components/TradingSetup.tsx
import React, { useState, useEffect } from 'react';
import { walletService } from '../services/wallet.service';
import { relayerService } from '../services/relayer.service';
import { clobService } from '../services/clob.service';

export function TradingSetup() {
  const [status, setStatus] = useState('disconnected');
  const [address, setAddress] = useState('');
  const [proxyAddress, setProxyAddress] = useState('');
  const [credentials, setCredentials] = useState(null);

  // Step 1: Connect wallet
  const connectWallet = async () => {
    try {
      setStatus('connecting');
      const { address, signer } = await walletService.connect();
      setAddress(address);
      setStatus('wallet-connected');

      // Initialize relayer
      await relayerService.initialize(signer);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setStatus('error');
    }
  };

  // Step 2: Setup proxy wallet
  const setupProxyWallet = async () => {
    try {
      setStatus('deploying-proxy');
      const proxy = await relayerService.deployProxyWallet();
      setProxyAddress(proxy);
      setStatus('proxy-deployed');
    } catch (error) {
      console.error('Failed to deploy proxy:', error);
      setStatus('error');
    }
  };

  // Step 3: Approve tokens
  const approveTokens = async () => {
    try {
      setStatus('approving-tokens');
      await relayerService.approveTokens();
      setStatus('tokens-approved');
    } catch (error) {
      console.error('Failed to approve tokens:', error);
      setStatus('error');
    }
  };

  // Step 4: Generate CLOB credentials
  const generateCredentials = async () => {
    try {
      setStatus('generating-credentials');
      const signer = walletService.getSigner();
      const creds = await clobService.deriveApiCredentials(signer);

      // Store credentials securely (consider encrypted local storage)
      setCredentials(creds);
      localStorage.setItem('clob_credentials', JSON.stringify(creds));

      setStatus('credentials-generated');
    } catch (error) {
      console.error('Failed to generate credentials:', error);
      setStatus('error');
    }
  };

  // Step 5: Initialize CLOB client
  const initializeClobClient = async () => {
    try {
      setStatus('initializing-clob');
      const signer = walletService.getSigner();
      await clobService.initialize(signer, credentials!, proxyAddress);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to initialize CLOB client:', error);
      setStatus('error');
    }
  };

  return (
    <div className="trading-setup">
      <h2>Trading Setup</h2>

      <div className="steps">
        {/* Step 1 */}
        <div className={`step ${status === 'wallet-connected' ? 'complete' : ''}`}>
          <h3>1. Connect Wallet</h3>
          <button onClick={connectWallet} disabled={status !== 'disconnected'}>
            Connect MetaMask
          </button>
          {address && <p>Connected: {address}</p>}
        </div>

        {/* Step 2 */}
        <div className={`step ${status === 'proxy-deployed' ? 'complete' : ''}`}>
          <h3>2. Deploy Proxy Wallet</h3>
          <button
            onClick={setupProxyWallet}
            disabled={status !== 'wallet-connected'}
          >
            Deploy Gnosis Safe
          </button>
          {proxyAddress && <p>Proxy: {proxyAddress}</p>}
        </div>

        {/* Step 3 */}
        <div className={`step ${status === 'tokens-approved' ? 'complete' : ''}`}>
          <h3>3. Approve USDC.e</h3>
          <button
            onClick={approveTokens}
            disabled={status !== 'proxy-deployed'}
          >
            Approve Tokens
          </button>
        </div>

        {/* Step 4 */}
        <div className={`step ${status === 'credentials-generated' ? 'complete' : ''}`}>
          <h3>4. Generate API Credentials</h3>
          <button
            onClick={generateCredentials}
            disabled={status !== 'tokens-approved'}
          >
            Sign Message
          </button>
        </div>

        {/* Step 5 */}
        <div className={`step ${status === 'ready' ? 'complete' : ''}`}>
          <h3>5. Initialize Trading</h3>
          <button
            onClick={initializeClobClient}
            disabled={status !== 'credentials-generated'}
          >
            Start Trading
          </button>
        </div>
      </div>

      {status === 'ready' && (
        <div className="success">
          ✅ Ready to trade! You can now place orders.
        </div>
      )}
    </div>
  );
}
```

### Step 5: Trading Component

```typescript
// components/TradingInterface.tsx
import React, { useState } from 'react';
import { clobService } from '../services/clob.service';

export function TradingInterface({ tokenID }: { tokenID: string }) {
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    try {
      setLoading(true);
      const order = await clobService.createOrder({
        tokenID,
        price: parseFloat(price),
        size: parseFloat(size),
        side: 'BUY',
      });
      console.log('Order created:', order);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    try {
      setLoading(true);
      const order = await clobService.createOrder({
        tokenID,
        price: parseFloat(price),
        size: parseFloat(size),
        side: 'SELL',
      });
      console.log('Order created:', order);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trading-interface">
      <h3>Place Order</h3>

      <input
        type="number"
        placeholder="Price (0.00 - 1.00)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        min="0"
        max="1"
        step="0.01"
      />

      <input
        type="number"
        placeholder="Size (shares)"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        min="1"
      />

      <div className="buttons">
        <button
          onClick={handleBuy}
          disabled={loading || !price || !size}
          className="buy-button"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          disabled={loading || !price || !size}
          className="sell-button"
        >
          Sell
        </button>
      </div>
    </div>
  );
}
```

---

## Trading Flow

### Complete User Journey

1. **User connects wallet** (MetaMask, WalletConnect, etc.)
2. **Deploy Gnosis Safe proxy** (one-time, gasless with relayer)
3. **Approve USDC.e** (one-time, allows exchange to move funds)
4. **Generate L2 credentials** (sign message to create CLOB API keys)
5. **Initialize CLOB client** with remote signing config
6. **User creates order** → Frontend prompts user to sign
7. **CLOB client calls your `/sign` endpoint** → Backend returns builder headers
8. **Order submitted to Polymarket** with both signatures
9. **Order executed** → You get builder attribution credit! 🎉

---

## API Reference

### Your Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/polymarket/sign` | POST | Generate builder signature headers |
| `/api/polymarket/builder-info` | GET | Check builder configuration status |

### Polymarket CLOB Client Methods

Already available in your backend via `polymarket-clob.service.ts`:

```typescript
// Market data
await clobService.getOrderBook(tokenID);
await clobService.getMarketPrice(tokenID);
await clobService.getTrades(params);

// Trading
await clobService.createOrder(signedOrder);
await clobService.cancelOrder(orderID);
await clobService.cancelAllOrders(address);

// User data
await clobService.getUserOrders(address);
await clobService.getOrderById(orderID);
```

---

## Testing

### 1. Test Builder Signing Endpoint

```bash
curl -X POST http://localhost:4000/api/polymarket/sign \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/order",
    "body": "{\"test\":\"data\"}"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "POLY_BUILDER_API_KEY": "019b0006...",
    "POLY_BUILDER_SIGNATURE": "abc123...",
    "POLY_BUILDER_TIMESTAMP": 1703001234567,
    "POLY_BUILDER_PASSPHRASE": "ce46ed53..."
  }
}
```

### 2. Test Builder Info Endpoint

```bash
curl http://localhost:4000/api/polymarket/builder-info
```

### 3. Test Frontend Integration

1. Connect wallet on Polygon (chainId 137)
2. Check console for "Deploying proxy wallet..." logs
3. Verify proxy deployment on Polygonscan
4. Check for "Tokens approved!" confirmation
5. Place a test order

---

## Troubleshooting

### Common Issues

**1. "Builder credentials are missing"**
- Check your `.env` file has all three builder variables
- Restart your server after updating `.env`
- Verify with `/api/polymarket/builder-info` endpoint

**2. "Wrong network" / "Switch to Polygon"**
- CLOB only works on Polygon (chainId 137)
- Prompt user to switch networks in MetaMask

**3. "Insufficient USDC.e balance"**
- Users need USDC.e on Polygon to trade
- Bridge from Ethereum or buy on Polygon

**4. "ethers v6 compatibility error"**
- Polymarket SDKs require ethers v5
- Downgrade: `npm install ethers@5.7.2`

**5. "Signature verification failed"**
- Ensure you're passing body as JSON string (not object) to `/sign`
- Check timestamp is current (< 30 seconds old)

### Debug Mode

Enable detailed logging in your frontend:

```typescript
// Add to your CLOB service
console.log('Requesting builder signature for:', { method, path, body });
```

Check backend logs:
```bash
# Backend logs show signing requests
Signing request received: POST /order
Generated signature for POST /order
```

---

## Security Best Practices

1. **Never expose builder credentials in frontend code**
2. **Use HTTPS for your backend** (required for production)
3. **Store user CLOB credentials securely** (encrypted local storage or secure cookies)
4. **Validate all user inputs** before creating orders
5. **Implement rate limiting** on `/sign` endpoint (already configured)
6. **Monitor builder volume** to detect unusual activity

---

## Next Steps

1. ✅ Backend is ready - deploy to production
2. ⚙️ Implement frontend wallet connection
3. ⚙️ Add proxy deployment UI
4. ⚙️ Build trading interface
5. ⚙️ Test on Polygon Mumbai testnet first
6. 🚀 Launch on Polygon mainnet

---

## Support

- **Polymarket Docs:** https://docs.polymarket.com
- **Builder Program:** https://polymarket.com/builders
- **Discord:** https://discord.gg/polymarket

Your backend is production-ready! Focus on implementing the frontend components described in this guide.
