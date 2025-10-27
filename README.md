# 🚀 PayNode - Gasless Payment Protocol (x402)

A complete implementation of the x402 protocol on BNB Chain, enabling users to perform gasless transactions using EIP-2612 Permit signatures.

![PayNode Banner](https://via.placeholder.com/1200x400/0A0F1E/00FFA3?text=PayNode+-+Gasless+Payments)

## 🌟 Overview

PayNode allows users to **purchase GRW tokens with USDT without needing BNB for gas fees**. The system uses EIP-2612 Permit signatures and a relayer service to execute transactions on behalf of users.

### Key Features

- ✅ **100% Gasless** - Users don't need native tokens (BNB) for gas
- ✅ **Simple UX** - Just sign a message, no complex flows
- ✅ **Secure** - Using EIP-2612 standard with OpenZeppelin contracts
- ✅ **Instant** - Transactions complete in ~2 seconds
- ✅ **Modern Stack** - React, TypeScript, Wagmi, Ethers.js v6

---

## 📁 Project Structure

```
frictionless-pay-protocol/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── GaslessReward.sol       # ERC20 with EIP-2612 Permit
│   │   └── X402Facilitator.sol     # Facilitator contract
│   ├── scripts/deploy.js           # Deployment script
│   └── test/                       # Contract tests
│
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── config/               # Blockchain config
│   │   ├── services/             # Relayer & facilitator services
│   │   ├── routes/               # API endpoints
│   │   └── index.js              # Main server
│   └── package.json
│
├── src/                   # React Frontend
│   ├── components/
│   │   ├── PaymentSection.tsx    # Main payment UI
│   │   ├── WalletConnect.tsx     # Wallet connection
│   │   └── ...                   # Other components
│   ├── hooks/
│   │   ├── usePermit.ts          # EIP-2612 signature hook
│   │   └── usePayment.ts         # Payment processing hook
│   ├── services/
│   │   └── apiService.ts         # Backend API client
│   └── utils/
│       └── permitSignature.ts    # Permit signature utils
│
└── SETUP_GUIDE.md        # Complete setup instructions
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MetaMask or another Web3 wallet
- BNB for gas (only for deploying contracts and funding relayer)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Smart Contracts
cd contracts && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

### 2. Deploy Smart Contracts

```bash
cd contracts

# Configure .env
cp .env.example .env
# Add your PRIVATE_KEY and BSCSCAN_API_KEY

# Deploy to BSC Testnet
npm run deploy:testnet

# Save the contract addresses!
```

### 3. Configure Backend

```bash
cd backend

# Configure .env
cp .env.example .env
# Add contract addresses from step 2
# Add RELAYER_PRIVATE_KEY
# Fund relayer wallet with 0.1+ BNB

# Start backend
npm run dev
```

### 4. Configure Frontend

```bash
# Root directory
cp .env.example .env
# Add contract addresses
# Add WalletConnect Project ID

# Start frontend
npm run dev
```

**Open:** http://localhost:8080

---

## 💡 How It Works

### The Gasless Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User (Has USDT, No BNB)                                 │
│     - Connects wallet                                       │
│     - Selects payment plan (e.g., 1 USDT → 5000 GRW)       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend Creates EIP-2612 Permit Signature              │
│     - No gas needed, just a signature                       │
│     - Approves Facilitator to spend USDT                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Backend API Receives Signature                          │
│     - Validates signature and parameters                    │
│     - Relayer wallet prepares transaction                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Relayer Executes Transaction (Pays Gas)                 │
│     - Calls Facilitator contract                            │
│     - Facilitator uses permit() to get approval             │
│     - Transfers USDT from user                              │
│     - Mints GRW tokens to user                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. User Receives GRW Tokens                                │
│     ✅ Paid 0 BNB for gas                                   │
│     ✅ Transaction complete in ~2 seconds                   │
└─────────────────────────────────────────────────────────────┘
```

### EIP-2612 Permit

Instead of calling `approve()` (which requires gas), users sign a permit message off-chain:

```typescript
// User signs this message (no gas)
const signature = await createPermitSignature({
  tokenAddress: USDT_ADDRESS,
  spenderAddress: FACILITATOR_ADDRESS,
  value: amount,
  deadline: timestamp + 3600
});

// Backend executes this on-chain (relayer pays gas)
await facilitator.processPayment({
  payer: userAddress,
  paymentAmount: amount,
  signature: { v, r, s }
});
```

---

## 🏗️ Architecture

### Smart Contracts

1. **GaslessReward (GRW)**
   - ERC20 token with 18 decimals
   - Implements EIP-2612 Permit
   - Mintable by Facilitator only

2. **X402Facilitator**
   - Processes gasless payments
   - Calls permit() on payment token
   - Transfers payment token to treasury
   - Mints reward tokens to user
   - Pausable for emergencies

### Backend API

**Endpoints:**
- `POST /api/payment/execute` - Process payment
- `GET /api/payment/config` - Get configuration
- `GET /api/payment/status/:txHash` - Check transaction status
- `GET /api/payment/balance/:address` - Get token balance
- `GET /api/payment/health` - Health check

### Frontend

**Key Components:**
- `PaymentSection` - Main payment interface with plans
- `WalletConnect` - Wallet connection button
- `usePermit` - Hook for creating EIP-2612 signatures
- `usePayment` - Hook for processing payments

---

## 🔒 Security Features

- ✅ OpenZeppelin audited contracts
- ✅ ReentrancyGuard on critical functions
- ✅ Pausable for emergency stops
- ✅ Deadline validation on signatures
- ✅ Nonce tracking to prevent replay attacks
- ✅ Rate limiting on API endpoints
- ✅ Input validation everywhere
- ✅ Balance checks before execution

---

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
npm test
```

### Backend API

```bash
cd backend
npm test
```

### Integration Testing

1. Deploy contracts to testnet
2. Start backend with testnet config
3. Start frontend
4. Get testnet USDT from faucet
5. Make test payment
6. Verify transaction on BSCScan

---

## 📊 Payment Plans

| Plan | USDT | GRW Tokens | Bonus |
|------|------|------------|-------|
| Basic | 1 | 5,000 | - |
| Popular | 5 | 27,000 | +8% |
| Best Value | 10 | 55,000 | +10% |

*Rates are configurable in the Facilitator contract*

---

## 🌐 Deployment

### Testnet (BSC Testnet)

Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

### Mainnet (BSC)

```bash
# 1. Deploy contracts
cd contracts
npm run deploy:mainnet

# 2. Verify on BSCScan
npm run verify

# 3. Deploy backend to Railway/Render
# 4. Deploy frontend to Vercel/Netlify
```

**Important:** Audit contracts before mainnet deployment!

---

## 🛠️ Tech Stack

### Smart Contracts
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js

### Backend
- Node.js v18+
- Express.js
- Ethers.js v6
- CORS, Rate Limiting

### Frontend
- React 18
- TypeScript
- Vite
- Wagmi v2 (Web3 React hooks)
- Web3Modal v5
- TailwindCSS
- shadcn/ui

---

## 📖 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [contracts/README.md](./contracts/README.md) - Smart contract docs
- [backend/README.md](./backend/README.md) - Backend API docs
- [instuctions.md](./instuctions.md) - Original specifications

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 🐛 Troubleshooting

**Issue:** "Failed to create permit signature"
- **Solution:** Ensure token supports EIP-2612

**Issue:** "Relayer balance is low"
- **Solution:** Fund relayer wallet with BNB

**Issue:** "Transaction failed"
- **Solution:** Check user has sufficient USDT balance

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) for more.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🔗 Links

- **Live Demo:** Coming soon
- **Documentation:** See /docs folder
- **BSCScan (Testnet):** [View Contracts](#)
- **Twitter:** [@paynode_402](https://x.com/paynode_402)
- **Telegram:** [PayNode Community](https://t.me/paynode_402)

---

## 🙏 Acknowledgments

- OpenZeppelin for audited smart contracts
- EIP-2612 specification
- x402 protocol inspiration
- BNB Chain team

---

**Built with ❤️ for the gasless payment future**

For support, open an issue or contact the maintainers.
