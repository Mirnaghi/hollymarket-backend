# Wallet Connect Modal - Frontend Implementation Guide

This guide shows how to implement a **separate modal** for wallet connection in your frontend application.

---

## Table of Contents

1. [Component Structure](#component-structure)
2. [Installation](#installation)
3. [Implementation](#implementation)
4. [Usage Examples](#usage-examples)
5. [Styling](#styling)

---

## Component Structure

```
src/
├── components/
│   ├── WalletConnectModal/
│   │   ├── WalletConnectModal.tsx      # Main modal component
│   │   ├── WalletConnectModal.css      # Styles
│   │   └── index.ts                    # Export
│   └── WalletButton/
│       ├── WalletButton.tsx            # Trigger button
│       └── index.ts
├── hooks/
│   └── useWallet.ts                    # Wallet state management
├── services/
│   └── wallet.service.ts               # Wallet connection logic
└── types/
    └── wallet.types.ts                 # TypeScript types
```

---

## Installation

### Required Packages

```bash
# For Web3 wallet connection
npm install ethers@5.7.2

# Optional: For better wallet support (recommended)
npm install wagmi viem @wagmi/core
npm install @rainbow-me/rainbowkit

# For modal UI (or use your own)
npm install framer-motion react-modal
```

---

## Implementation

### 1. Types Definition

```typescript
// src/types/wallet.types.ts

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase' | 'privy';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: WalletProvider | null;
  error: string | null;
}

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}
```

---

### 2. Wallet Service

```typescript
// src/services/wallet.service.ts

import { ethers } from 'ethers';

export class WalletService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask
   */
  async connectMetaMask(): Promise<{
    address: string;
    chainId: number;
    signer: ethers.Signer;
  }> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    try {
      // Request account access
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send('eth_requestAccounts', []);

      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = network.chainId;

      return { address, chainId, signer: this.signer };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      }
      throw new Error(`Failed to connect to MetaMask: ${error.message}`);
    }
  }

  /**
   * Switch to Polygon network
   */
  async switchToPolygon(): Promise<void> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const polygonChainId = '0x89'; // 137 in hex

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: polygonChainId }],
      });
    } catch (switchError: any) {
      // Chain not added, let's add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: polygonChainId,
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Get current signer
   */
  getSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return this.signer;
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Listen to account changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  /**
   * Listen to chain changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

export const walletService = new WalletService();
```

---

### 3. Wallet Hook

```typescript
// src/hooks/useWallet.ts

import { useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/wallet.service';
import type { WalletState, WalletProvider } from '../types/wallet.types';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    error: null,
  });

  // Connect wallet
  const connect = useCallback(async (provider: WalletProvider = 'metamask') => {
    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      if (provider === 'metamask') {
        const { address, chainId, signer } = await walletService.connectMetaMask();

        setWallet({
          address,
          chainId,
          isConnected: true,
          isConnecting: false,
          provider: 'metamask',
          error: null,
        });

        // Check if on Polygon, if not, prompt to switch
        if (chainId !== 137) {
          try {
            await walletService.switchToPolygon();
          } catch (error) {
            console.warn('Failed to switch to Polygon:', error);
          }
        }
      } else {
        throw new Error(`Provider ${provider} not yet implemented`);
      }
    } catch (error: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    walletService.disconnect();
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      error: null,
    });
  }, []);

  // Switch to Polygon
  const switchToPolygon = useCallback(async () => {
    try {
      await walletService.switchToPolygon();
    } catch (error: any) {
      setWallet((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  // Listen to account/chain changes
  useEffect(() => {
    walletService.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet((prev) => ({ ...prev, address: accounts[0] }));
      }
    });

    walletService.onChainChanged((chainId) => {
      const numericChainId = parseInt(chainId, 16);
      setWallet((prev) => ({ ...prev, chainId: numericChainId }));
    });
  }, [disconnect]);

  return {
    ...wallet,
    connect,
    disconnect,
    switchToPolygon,
    getSigner: () => walletService.getSigner(),
  };
}
```

---

### 4. Wallet Connect Modal Component

```tsx
// src/components/WalletConnectModal/WalletConnectModal.tsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import type { WalletConnectModalProps } from '../../types/wallet.types';
import './WalletConnectModal.css';

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const { connect, isConnecting, error } = useWallet();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleConnect = async (provider: 'metamask' | 'walletconnect' | 'coinbase') => {
    try {
      await connect(provider);

      // Get the connected address
      const signer = walletService.getSigner();
      const address = await signer.getAddress();

      onConnect?.(address);
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="wallet-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="wallet-modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="wallet-modal">
              {/* Header */}
              <div className="wallet-modal-header">
                <h2>Connect Wallet</h2>
                <button
                  className="wallet-modal-close"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="wallet-modal-content">
                <p className="wallet-modal-description">
                  Connect your wallet to start trading on Polymarket
                </p>

                {/* Error Message */}
                {error && (
                  <div className="wallet-modal-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                {/* Wallet Options */}
                <div className="wallet-options">
                  {/* MetaMask */}
                  <button
                    className="wallet-option"
                    onClick={() => handleConnect('metamask')}
                    disabled={isConnecting}
                  >
                    <div className="wallet-option-icon">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                        alt="MetaMask"
                      />
                    </div>
                    <div className="wallet-option-info">
                      <h3>MetaMask</h3>
                      <p>Connect using MetaMask</p>
                    </div>
                    {isConnecting && <div className="wallet-option-spinner" />}
                  </button>

                  {/* WalletConnect */}
                  <button
                    className="wallet-option"
                    onClick={() => handleConnect('walletconnect')}
                    disabled={isConnecting}
                  >
                    <div className="wallet-option-icon">
                      <img
                        src="https://docs.walletconnect.com/img/walletconnect-logo.svg"
                        alt="WalletConnect"
                      />
                    </div>
                    <div className="wallet-option-info">
                      <h3>WalletConnect</h3>
                      <p>Scan with mobile wallet</p>
                    </div>
                    {isConnecting && <div className="wallet-option-spinner" />}
                  </button>

                  {/* Coinbase Wallet */}
                  <button
                    className="wallet-option"
                    onClick={() => handleConnect('coinbase')}
                    disabled={isConnecting}
                  >
                    <div className="wallet-option-icon">
                      <img
                        src="https://www.coinbase.com/img/favicon/favicon-32x32.png"
                        alt="Coinbase Wallet"
                      />
                    </div>
                    <div className="wallet-option-info">
                      <h3>Coinbase Wallet</h3>
                      <p>Connect using Coinbase</p>
                    </div>
                    {isConnecting && <div className="wallet-option-spinner" />}
                  </button>
                </div>

                {/* Network Notice */}
                <div className="wallet-modal-notice">
                  <p>
                    <strong>Note:</strong> Trading requires Polygon network. You'll be
                    prompted to switch if on a different network.
                  </p>
                </div>

                {/* Terms */}
                <div className="wallet-modal-terms">
                  <p>
                    By connecting, you agree to our{' '}
                    <a href="/terms" target="_blank">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

### 5. Wallet Button Component

```tsx
// src/components/WalletButton/WalletButton.tsx

import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { WalletConnectModal } from '../WalletConnectModal';

export function WalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected, chainId, disconnect } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    if (!id) return '';
    switch (id) {
      case 137:
        return 'Polygon';
      case 1:
        return 'Ethereum';
      case 80001:
        return 'Mumbai';
      default:
        return `Chain ${id}`;
    }
  };

  const handleConnect = (connectedAddress: string) => {
    console.log('Wallet connected:', connectedAddress);
    // Additional logic after connection
  };

  if (isConnected && address) {
    return (
      <div className="wallet-button-connected">
        <div className="wallet-info">
          <span className="wallet-network">{getNetworkName(chainId)}</span>
          <span className="wallet-address">{formatAddress(address)}</span>
        </div>
        <button className="wallet-disconnect-btn" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="wallet-connect-btn" onClick={() => setIsModalOpen(true)}>
        Connect Wallet
      </button>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  );
}
```

---

### 6. Styling (CSS)

```css
/* src/components/WalletConnectModal/WalletConnectModal.css */

/* Backdrop */
.wallet-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9998;
}

/* Modal Container */
.wallet-modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Modal */
.wallet-modal {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
.wallet-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e5e7eb;
}

.wallet-modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.wallet-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: 8px;
  transition: all 0.2s;
}

.wallet-modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Content */
.wallet-modal-content {
  padding: 28px;
}

.wallet-modal-description {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 15px;
  text-align: center;
}

/* Error */
.wallet-modal-error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin-bottom: 20px;
}

.wallet-modal-error span {
  font-size: 20px;
}

.wallet-modal-error p {
  margin: 0;
  color: #991b1b;
  font-size: 14px;
  flex: 1;
}

/* Wallet Options */
.wallet-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.wallet-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.wallet-option:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.wallet-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-option-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.wallet-option-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.wallet-option-info {
  flex: 1;
  text-align: left;
}

.wallet-option-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.wallet-option-info p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.wallet-option-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Notice */
.wallet-modal-notice {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.wallet-modal-notice p {
  margin: 0;
  font-size: 13px;
  color: #1e40af;
}

.wallet-modal-notice strong {
  font-weight: 600;
}

/* Terms */
.wallet-modal-terms {
  text-align: center;
}

.wallet-modal-terms p {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.wallet-modal-terms a {
  color: #6366f1;
  text-decoration: none;
}

.wallet-modal-terms a:hover {
  text-decoration: underline;
}

/* Wallet Button (Connected State) */
.wallet-button-connected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 12px;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wallet-network {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.wallet-address {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.wallet-disconnect-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-disconnect-btn:hover {
  background: #dc2626;
}

/* Connect Button (Not Connected) */
.wallet-connect-btn {
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-connect-btn:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .wallet-modal {
    background: #1f2937;
  }

  .wallet-modal-header {
    border-bottom-color: #374151;
  }

  .wallet-modal-header h2 {
    color: #f9fafb;
  }

  .wallet-modal-close {
    color: #9ca3af;
  }

  .wallet-modal-close:hover {
    background: #374151;
    color: #f9fafb;
  }

  .wallet-modal-description {
    color: #9ca3af;
  }

  .wallet-option {
    background: #374151;
    border-color: #4b5563;
  }

  .wallet-option:hover:not(:disabled) {
    background: #4b5563;
  }

  .wallet-option-info h3 {
    color: #f9fafb;
  }

  .wallet-option-info p {
    color: #9ca3af;
  }

  .wallet-button-connected {
    background: #374151;
  }

  .wallet-address {
    color: #f9fafb;
  }
}
```

---

## Usage Examples

### Example 1: Basic Usage

```tsx
// src/App.tsx

import React from 'react';
import { WalletButton } from './components/WalletButton';

export default function App() {
  return (
    <div className="app">
      <header>
        <nav>
          <h1>HollyMarket</h1>
          <WalletButton />
        </nav>
      </header>

      <main>
        {/* Your app content */}
      </main>
    </div>
  );
}
```

### Example 2: With Custom Trigger

```tsx
// src/pages/Trading.tsx

import React, { useState } from 'react';
import { WalletConnectModal } from '../components/WalletConnectModal';
import { useWallet } from '../hooks/useWallet';

export function TradingPage() {
  const [showModal, setShowModal] = useState(false);
  const { isConnected, address } = useWallet();

  const handleConnect = (connectedAddress: string) => {
    console.log('Connected:', connectedAddress);
    // Initialize trading services
  };

  if (!isConnected) {
    return (
      <div className="trading-page-locked">
        <h2>Connect Wallet to Trade</h2>
        <button onClick={() => setShowModal(true)}>
          Connect Wallet
        </button>

        <WalletConnectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConnect={handleConnect}
        />
      </div>
    );
  }

  return (
    <div className="trading-page">
      <h1>Trading Interface</h1>
      <p>Connected: {address}</p>
      {/* Trading UI */}
    </div>
  );
}
```

### Example 3: Programmatic Control

```tsx
// src/components/Header.tsx

import React, { useState } from 'react';
import { WalletConnectModal } from './WalletConnectModal';
import { useWallet } from '../hooks/useWallet';

export function Header() {
  const [modalOpen, setModalOpen] = useState(false);
  const { isConnected, address, disconnect, chainId, switchToPolygon } = useWallet();

  const handleAfterConnect = async (addr: string) => {
    console.log('Wallet connected:', addr);

    // Check if on Polygon
    if (chainId !== 137) {
      try {
        await switchToPolygon();
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
  };

  return (
    <header>
      <div className="logo">HollyMarket</div>

      <div className="header-actions">
        {isConnected ? (
          <div className="wallet-info">
            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            {chainId !== 137 && (
              <button onClick={switchToPolygon}>Switch to Polygon</button>
            )}
            <button onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <button onClick={() => setModalOpen(true)}>
            Connect Wallet
          </button>
        )}
      </div>

      <WalletConnectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnect={handleAfterConnect}
      />
    </header>
  );
}
```

---

## Alternative: Using RainbowKit (Recommended)

For a more robust solution with built-in support for multiple wallets:

```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
```

```tsx
// src/App.tsx

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'HollyMarket',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [polygon],
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <header>
            <h1>HollyMarket</h1>
            <ConnectButton />
          </header>
          {/* Your app */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## Summary

**Custom Modal Benefits:**
- ✅ Full design control
- ✅ Lightweight
- ✅ Easy to customize
- ✅ No external dependencies (except ethers)

**RainbowKit Benefits:**
- ✅ More wallet options out of the box
- ✅ Better mobile support
- ✅ Maintained by professionals
- ✅ Built-in network switching

Choose based on your needs. The custom modal gives you complete control, while RainbowKit provides a production-ready solution with less code.
