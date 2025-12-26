# Frontend Requirements for Polymarket CLOB Trading

## Quick Start Checklist

This is what your frontend developer needs to implement to enable trading on Polymarket CLOB.

---

## 1. Install Required Packages

```bash
npm install @polymarket/builder-relayer-client @polymarket/clob-client ethers@5.7.2
```

⚠️ **Important:** Must use ethers v5 (not v6). Polymarket SDKs are incompatible with ethers v6.

---

## 2. Required Environment Variables (Frontend)

Create a `.env` file in your frontend project:

```env
# Your backend API URL
NEXT_PUBLIC_API_URL=https://your-api.com

# Polymarket endpoints (Production)
NEXT_PUBLIC_RELAYER_URL=https://relayer.polymarket.com
NEXT_PUBLIC_CLOB_API_URL=https://clob.polymarket.com
NEXT_PUBLIC_CHAIN_ID=137

# For testing (Mumbai testnet)
# NEXT_PUBLIC_RELAYER_URL=https://relayer-mumbai.polymarket.com
# NEXT_PUBLIC_CLOB_API_URL=https://clob-mumbai.polymarket.com
# NEXT_PUBLIC_CHAIN_ID=80001
```

---

## 3. Core Services to Implement

### A. Wallet Service

**Purpose:** Connect user's Web3 wallet (MetaMask, WalletConnect, etc.)

**Key Methods:**
- `connect()` - Connect wallet and get signer
- `disconnect()` - Disconnect wallet
- `getSigner()` - Get ethers.js signer for signing transactions

**Technologies:**
- Option 1: `wagmi` + `viem` (recommended for modern React apps)
- Option 2: `ethers.js` directly
- Option 3: `web3-react`

### B. Relayer Service

**Purpose:** Deploy Gnosis Safe proxy and approve tokens

**Required Methods:**
```typescript
- initialize(signer: ethers.Signer)
- deployProxyWallet() // One-time, gasless
- approveTokens() // One-time, allows trading
- getProxyAddress()
```

**Uses:** `@polymarket/builder-relayer-client`

**Config:**
```typescript
new RelayClient(RELAYER_URL, CHAIN_ID, signer, {
  remoteBuilderConfig: {
    url: `${YOUR_API_URL}/api/polymarket/sign`
  }
});
```

### C. CLOB Service

**Purpose:** Interact with Polymarket orderbook for trading

**Required Methods:**
```typescript
- initialize(signer, credentials, funderAddress)
- deriveApiCredentials(signer) // L2 auth, one-time
- createOrder({ tokenID, price, size, side })
- cancelOrder(orderID)
- getOrderBook(tokenID)
- getOrders() // User's orders
```

**Uses:** `@polymarket/clob-client`

**Config:**
```typescript
new ClobClient(
  CLOB_API_URL,
  CHAIN_ID,
  signer,
  credentials, // From deriveApiCredentials
  2, // signature type
  funderAddress, // Proxy wallet address
  {
    remoteBuilderConfig: {
      url: `${YOUR_API_URL}/api/polymarket/sign`
    }
  }
);
```

---

## 4. User Flow Implementation

### Step-by-Step Setup Flow

```typescript
// 1. Connect Wallet
const { address, signer } = await walletService.connect();

// 2. Initialize Relayer
await relayerService.initialize(signer);

// 3. Deploy Proxy Wallet (if not already deployed)
const proxyAddress = await relayerService.deployProxyWallet();

// 4. Approve USDC.e Tokens (one-time)
await relayerService.approveTokens();

// 5. Generate L2 API Credentials (sign message)
const credentials = await clobService.deriveApiCredentials(signer);
// Store credentials securely (localStorage or encrypted)

// 6. Initialize CLOB Client
await clobService.initialize(signer, credentials, proxyAddress);

// 7. Ready to trade! 🎉
```

### Trading Flow

```typescript
// Place a buy order
await clobService.createOrder({
  tokenID: '0x123...', // Market token ID
  price: 0.65, // 0.00 - 1.00
  size: 10, // Number of shares
  side: 'BUY'
});

// Place a sell order
await clobService.createOrder({
  tokenID: '0x123...',
  price: 0.70,
  size: 5,
  side: 'SELL'
});

// Cancel an order
await clobService.cancelOrder(orderID);
```

---

## 5. UI Components Needed

### A. Wallet Connection Component

```typescript
<WalletConnect>
  - Connect button
  - Wallet address display
  - Network switcher (must be Polygon)
  - Disconnect button
</WalletConnect>
```

### B. Setup Wizard Component

```typescript
<TradingSetup>
  Step 1: Connect Wallet ✓
  Step 2: Deploy Proxy Wallet ✓
  Step 3: Approve Tokens ✓
  Step 4: Generate Credentials ✓
  Step 5: Ready to Trade ✓
</TradingSetup>
```

### C. Trading Interface Component

```typescript
<TradingInterface>
  - Market selector
  - Orderbook display (bids/asks)
  - Order form (price, size, buy/sell)
  - Open orders list
  - Order history
  - Cancel order buttons
</TradingInterface>
```

---

## 6. Backend Integration

Your backend provides the **Remote Signing** endpoint that the CLOB client calls automatically.

### Endpoint Used by Frontend

**POST** `https://your-api.com/api/polymarket/sign`

This is called **automatically** by the CLOB client when you create/cancel orders. You don't need to call it manually.

**How it works:**
1. User signs order with their wallet
2. CLOB client intercepts the request
3. CLOB client calls your `/sign` endpoint
4. Your backend returns builder signature headers
5. CLOB client attaches both signatures
6. Order submitted to Polymarket with builder attribution

---

## 7. State Management

You'll need to track:

```typescript
interface TradingState {
  // Wallet
  isWalletConnected: boolean;
  walletAddress: string | null;
  chainId: number | null;

  // Setup status
  isProxyDeployed: boolean;
  proxyAddress: string | null;
  areTokensApproved: boolean;
  hasCredentials: boolean;

  // Trading
  isReadyToTrade: boolean;
  openOrders: Order[];
  positions: Position[];

  // UI
  isLoading: boolean;
  error: string | null;
}
```

**Recommended:** Use React Context, Zustand, or Redux for state management.

---

## 8. Error Handling

Handle these common scenarios:

```typescript
// Wrong network
if (chainId !== 137) {
  await switchNetwork(137); // Polygon
}

// Insufficient balance
if (usdcBalance < orderSize) {
  showError('Insufficient USDC.e balance');
}

// Wallet not connected
if (!walletAddress) {
  showConnectWalletModal();
}

// Setup incomplete
if (!isProxyDeployed) {
  showSetupWizard();
}
```

---

## 9. Security Considerations

### ✅ DO:
- Validate all user inputs (price, size)
- Store CLOB credentials securely (encrypted localStorage)
- Check wallet connection before trading
- Verify user is on Polygon network
- Show transaction confirmations before submitting

### ❌ DON'T:
- Never store private keys
- Never expose builder credentials (they're on backend)
- Don't skip the setup wizard steps
- Don't allow trading without token approval

---

## 10. Testing Checklist

- [ ] Wallet connects successfully
- [ ] Network switches to Polygon (137)
- [ ] Proxy wallet deploys (check Polygonscan)
- [ ] Tokens approve successfully
- [ ] L2 credentials generate
- [ ] CLOB client initializes
- [ ] Order book loads
- [ ] Buy order places successfully
- [ ] Sell order places successfully
- [ ] Order cancels successfully
- [ ] Open orders display correctly
- [ ] Error handling works

---

## 11. Example Code Structure

```
src/
├── services/
│   ├── wallet.service.ts       # Wallet connection
│   ├── relayer.service.ts      # Proxy deployment
│   └── clob.service.ts         # Trading operations
├── hooks/
│   ├── useWallet.ts            # Wallet state
│   ├── useTrading.ts           # Trading state
│   └── useTradingSetup.ts      # Setup flow
├── components/
│   ├── WalletConnect.tsx       # Connect button
│   ├── TradingSetup.tsx        # Setup wizard
│   ├── TradingInterface.tsx    # Trading UI
│   ├── OrderBook.tsx           # Bid/ask display
│   └── OrderForm.tsx           # Create order form
└── types/
    └── trading.types.ts        # TypeScript types
```

---

## 12. Key Documentation Links

- **Full Implementation Guide:** See `POLYMARKET_CLOB_INTEGRATION.md`
- **Polymarket Docs:** https://docs.polymarket.com/developers/CLOB/introduction
- **Builder Program:** https://polymarket.com/builders
- **Relayer Client:** https://github.com/Polymarket/relayer-client
- **CLOB Client:** https://github.com/Polymarket/clob-client

---

## 13. Quick Test with cURL

Test your backend is working:

```bash
curl -X POST https://your-api.com/api/polymarket/sign \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/order",
    "body": "{\"test\":\"data\"}"
  }'
```

Expected: Should return signature headers with 200 status.

---

## Summary

Your backend is **100% ready** for Polymarket CLOB trading with builder attribution.

**Frontend developer needs to:**
1. Install 3 packages
2. Implement 3 services (wallet, relayer, CLOB)
3. Create setup wizard UI
4. Create trading interface UI
5. Handle errors and edge cases

**Estimated effort:** 2-3 days for experienced React developer

All the complex signature generation and builder attribution is handled automatically by your backend! 🎉
