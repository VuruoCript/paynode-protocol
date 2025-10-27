# 🚀 PayNode - Gasless Payment System Setup Guide

Complete guide to set up and run the PayNode gasless payment system using the x402 protocol.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing Locally](#testing-locally)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ installed
- **npm** or **yarn** package manager
- **MetaMask** or another Web3 wallet
- **BNB** for gas fees (if deploying to mainnet)
- **USDT** tokens for testing payments (BSC Testnet)

---

## Quick Start (5 Minutes)

### 1. Clone and Install

```bash
# Navigate to project
cd frictionless-pay-protocol

# Install frontend dependencies
npm install

# Install contracts dependencies
cd contracts
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend (.env):**
```bash
cp .env.example .env
# Edit .env and add your WalletConnect Project ID
```

**Backend (backend/.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Contracts (contracts/.env):**
```bash
cd contracts
cp .env.example .env
# Edit .env with your private key and API keys
```

### 3. Deploy Smart Contracts (BSC Testnet)

```bash
cd contracts
npm run deploy:testnet
```

Save the contract addresses from the output!

### 4. Update Backend Configuration

Edit `backend/.env` with the deployed contract addresses:
```env
FACILITATOR_ADDRESS=0x...  # From deployment output
REWARD_TOKEN_ADDRESS=0x...  # From deployment output
PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955  # USDT on BSC
```

### 5. Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Open:** http://localhost:8080

---

## Detailed Setup

### Step 1: Smart Contracts Deployment

#### 1.1 Configure Hardhat

Edit `contracts/.env`:
```env
PRIVATE_KEY=your_private_key_here
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
BSCSCAN_API_KEY=your_bscscan_api_key
```

#### 1.2 Get Testnet BNB

1. Visit https://testnet.binance.org/faucet-smart
2. Enter your wallet address
3. Receive 0.5 tBNB

#### 1.3 Deploy Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:testnet
```

**Expected Output:**
```
Deploying contracts to BNB Testnet...
✓ GaslessReward deployed to: 0xABC...
✓ X402Facilitator deployed to: 0xDEF...
✓ Ownership transferred
Deployment complete!
```

#### 1.4 Verify Contracts (Optional)

```bash
npx hardhat verify --network bscTestnet 0xABC...
npx hardhat verify --network bscTestnet 0xDEF... 0xABC... 0x...
```

---

### Step 2: Backend API Setup

#### 2.1 Configure Environment

Edit `backend/.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# Blockchain
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
CHAIN_ID=97
NETWORK_NAME=BSC Testnet

# Contracts (from deployment)
FACILITATOR_ADDRESS=0xDEF...
REWARD_TOKEN_ADDRESS=0xABC...
PAYMENT_TOKEN_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd  # USDT Testnet

# Relayer Wallet
RELAYER_PRIVATE_KEY=your_relayer_private_key
RELAYER_ADDRESS=0x...

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=10
```

#### 2.2 Fund Relayer Wallet

The relayer wallet needs BNB to pay gas fees:
```bash
# Send at least 0.1 tBNB to your relayer address
```

#### 2.3 Start Backend

```bash
cd backend

# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

**Verify it's running:**
```bash
curl http://localhost:3000/api/payment/health
```

---

### Step 3: Frontend Setup

#### 3.1 Get WalletConnect Project ID

1. Visit https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID

#### 3.2 Configure Environment

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_CHAIN_ID=97
VITE_FACILITATOR_ADDRESS=0xDEF...
VITE_REWARD_TOKEN_ADDRESS=0xABC...
VITE_PAYMENT_TOKEN_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

#### 3.3 Start Frontend

```bash
npm run dev
```

**Open:** http://localhost:8080

---

## Testing Locally

### 1. Get Testnet USDT

**Option A - Faucet:**
Visit a BSC Testnet USDT faucet

**Option B - Swap:**
1. Get tBNB from faucet
2. Use PancakeSwap Testnet to swap for USDT

### 2. Connect Wallet

1. Open http://localhost:8080
2. Click "Connect Wallet"
3. Select your wallet (MetaMask)
4. Switch to BSC Testnet when prompted

### 3. Make a Test Payment

1. Scroll to "Get GRW Tokens" section
2. Select a payment plan (e.g., 1 USDT)
3. Click "Buy Now (No Gas!)"
4. Sign the permit message in your wallet
5. Wait for confirmation (2-5 seconds)
6. Check your GRW token balance

### 4. Verify Transaction

1. Click "View on Explorer" in the success modal
2. Check transaction on BSCScan Testnet
3. Verify:
   - USDT was transferred
   - GRW tokens were minted
   - You paid 0 BNB for gas!

---

## Payment Flow Diagram

```
User (Has USDT, No BNB)
         ↓
   1. Connects Wallet
         ↓
   2. Selects Payment Plan (e.g., 1 USDT → 5000 GRW)
         ↓
   3. Signs Permit Message (EIP-2612)
         ↓
   Frontend sends to Backend API
         ↓
   Backend validates signature
         ↓
   Relayer executes transaction (pays gas)
         ↓
   Facilitator Contract:
     - Calls permit() on USDT
     - Transfers USDT from user
     - Mints GRW to user
         ↓
   User receives GRW tokens!
   (Spent 0 BNB for gas)
```

---

## Deployment to Production

### 1. Deploy Contracts to BSC Mainnet

```bash
cd contracts

# Update .env with mainnet RPC
RPC_URL=https://bsc-dataseed1.binance.org/

# Deploy
npm run deploy:mainnet

# Verify on BSCScan
npx hardhat verify --network bsc 0x...
```

### 2. Deploy Backend

**Recommended Platforms:**
- Railway (https://railway.app)
- Render (https://render.com)
- AWS/GCP/Azure

**Environment Variables:**
- Set all variables from `.env.example`
- Use mainnet contract addresses
- Fund relayer with at least 0.5 BNB

### 3. Deploy Frontend

**Recommended Platforms:**
- Vercel (https://vercel.com)
- Netlify (https://netlify.com)

**Build Command:**
```bash
npm run build
```

**Environment Variables:**
- Update `VITE_API_URL` to production backend URL
- Update `VITE_CHAIN_ID` to 56 (mainnet)
- Update contract addresses to mainnet

---

## Troubleshooting

### "Failed to create permit signature"

**Cause:** Token doesn't support EIP-2612 Permit
**Solution:** Ensure you're using a token with Permit support (e.g., our deployed GaslessReward)

### "Relayer balance is low"

**Cause:** Relayer wallet has insufficient BNB
**Solution:** Send BNB to relayer address

### "Transaction failed"

**Possible Causes:**
1. User has insufficient USDT balance
2. Deadline expired
3. Invalid signature

**Solution:** Check backend logs for detailed error

### "Connect Wallet" button not working

**Cause:** WalletConnect Project ID not configured
**Solution:** Add valid Project ID to `.env`

### CORS errors

**Cause:** Frontend origin not allowed in backend
**Solution:** Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`

---

## Security Checklist

Before going to production:

- [ ] Audit smart contracts (use OpenZeppelin Defender)
- [ ] Never commit `.env` files
- [ ] Use separate wallets for deployer and relayer
- [ ] Monitor relayer balance regularly
- [ ] Enable rate limiting on backend
- [ ] Use HTTPS for production
- [ ] Verify all contract addresses
- [ ] Test on testnet extensively
- [ ] Set up error monitoring (Sentry)
- [ ] Configure proper CORS policies

---

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review backend logs: `cd backend && npm run dev`
3. Check contract events on BSCScan
4. Verify environment variables are correct

---

## Next Steps

After setup:

1. Customize payment rates in Facilitator contract
2. Add analytics tracking
3. Implement referral system
4. Add transaction history dashboard
5. Support multiple payment tokens
6. Expand to other chains

---

**Happy Building! 🚀**

For more information, see:
- `contracts/README.md` - Smart contract documentation
- `backend/README.md` - Backend API documentation
- `instuctions.md` - Original project specifications
