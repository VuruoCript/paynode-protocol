# Gasless Payment Backend

Backend API for processing gasless payments using the x402 protocol and EIP-2612 permit signatures on BNB Chain.

## Overview

This backend acts as a **relayer service** that executes blockchain transactions on behalf of users, paying the gas fees so users only need USDT/USDC to participate - no BNB required!

## Features

- Process gasless payments using EIP-2612 permit signatures
- Execute transactions on behalf of users (relayer pattern)
- Rate limiting to prevent spam/abuse
- Real-time transaction status tracking
- Balance checking and reward calculation
- Comprehensive error handling
- Health monitoring

## Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── blockchain.js       # RPC, contract addresses, ABIs
│   ├── services/
│   │   ├── relayerService.js   # Execute transactions, manage relayer wallet
│   │   └── facilitatorService.js # Interact with facilitator contract
│   ├── routes/
│   │   └── payment.js          # API endpoints
│   └── index.js                # Main server file
├── .env.example
├── package.json
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Configuration:**

```env
# Server
PORT=3000
NODE_ENV=development

# Blockchain (BNB Chain Mainnet)
RPC_URL=https://bsc-dataseed1.binance.org/
CHAIN_ID=56

# Smart Contracts (UPDATE THESE!)
FACILITATOR_ADDRESS=0x...
REWARD_TOKEN_ADDRESS=0x...
PAYMENT_TOKEN_ADDRESS=0x...

# Relayer Wallet (KEEP SECRET!)
RELAYER_PRIVATE_KEY=0x...
```

**Important:** The relayer wallet needs BNB to pay gas fees. Keep it funded with at least 0.1 BNB.

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### 1. Get Payment Configuration
Get contract addresses and payment rates.

```http
GET /api/payment/config
```

**Response:**
```json
{
  "success": true,
  "facilitatorAddress": "0x...",
  "rewardTokenAddress": "0x...",
  "paymentTokenAddress": "0x...",
  "rates": {
    "1": "5000",
    "5": "27000",
    "10": "55000"
  },
  "network": {
    "chainId": 56,
    "name": "BNB Chain"
  }
}
```

### 2. Execute Gasless Payment
Process a gasless payment using permit signature.

```http
POST /api/payment/execute
Content-Type: application/json

{
  "userAddress": "0x...",
  "paymentTokenAddress": "0x...",
  "paymentAmount": "1000000",
  "rewardAmount": "5000000000000000000000",
  "deadline": 1234567890,
  "signature": {
    "v": 27,
    "r": "0x...",
    "s": "0x..."
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 12345678,
  "rewardAmount": "5000000000000000000000",
  "paymentAmount": "1000000",
  "message": "Payment processed successfully",
  "explorer": "https://bscscan.com/tx/0x..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Insufficient token balance",
  "message": "Required: 1000000, Available: 0"
}
```

### 3. Get Transaction Status
Check the status of a transaction.

```http
GET /api/payment/status/:txHash
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "status": "confirmed",
  "blockNumber": 12345678,
  "timestamp": 1234567890,
  "gasUsed": "150000",
  "confirmations": 5,
  "explorer": "https://bscscan.com/tx/0x..."
}
```

### 4. Get User Balance
Check user's payment token balance.

```http
GET /api/payment/balance/:address
```

**Response:**
```json
{
  "success": true,
  "address": "0x...",
  "balance": {
    "raw": "1000000",
    "formatted": "1.0",
    "decimals": 6
  }
}
```

### 5. Calculate Reward
Calculate reward amount for a given payment.

```http
GET /api/payment/calculate/:amount
```

**Response:**
```json
{
  "success": true,
  "paymentAmount": "1000000",
  "rewardAmount": "5000000000000000000000",
  "rate": "Based on configured rates"
}
```

### 6. Health Check
Monitor the health of the relayer service.

```http
GET /api/payment/health
```

**Response:**
```json
{
  "success": true,
  "healthy": true,
  "relayerAddress": "0x...",
  "balance": "0.5 BNB",
  "gasPrice": "3 Gwei",
  "currentBlock": 12345678,
  "network": "BNB Chain",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## How It Works

### The Flow:

1. **User** creates a permit signature (EIP-2612) in their wallet
2. **Frontend** sends signature to this backend API
3. **Backend** validates the signature and parameters
4. **Relayer** executes the transaction, paying gas fees
5. **Facilitator Contract** processes the permit and executes payment
6. **User** receives reward tokens without spending BNB

### Key Components:

**Relayer Service** (`relayerService.js`):
- Manages the wallet that pays gas fees
- Executes transactions on behalf of users
- Monitors relayer balance
- Provides transaction status

**Facilitator Service** (`facilitatorService.js`):
- Interacts with the facilitator smart contract
- Validates payment parameters
- Processes gasless payments
- Calculates rewards

## Security Features

1. **Rate Limiting**: Max 10 requests per 15 minutes per IP
2. **Input Validation**: All addresses and amounts are validated
3. **Deadline Check**: Permit signatures must not be expired
4. **Balance Verification**: User balance is checked before execution
5. **CORS Protection**: Only allowed origins can access the API
6. **Error Handling**: Comprehensive error messages without exposing sensitive data

## Monitoring

### Check Relayer Balance
The relayer needs BNB to pay gas fees. Monitor it regularly:

```bash
curl http://localhost:3000/api/payment/health
```

If balance falls below `MIN_RELAYER_BALANCE` (default: 0.1 BNB), you'll see warnings in the logs.

### Logs
All transactions are logged with timestamps:
- Request received
- Parameters validated
- Transaction sent
- Transaction confirmed

## Error Handling

Common errors and their solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid signature format` | Missing v, r, s components | Check signature object structure |
| `Permit signature has expired` | Deadline in the past | Generate new signature with future deadline |
| `Insufficient token balance` | User doesn't have enough tokens | User needs to get more USDT/USDC |
| `Insufficient relayer balance` | Relayer out of BNB | Fund the relayer wallet with BNB |
| `Invalid address format` | Malformed Ethereum address | Validate address with ethers.isAddress() |

## Development Tips

### Testing Locally
1. Use BSC Testnet first
2. Update `.env` with testnet values
3. Get testnet BNB from faucet
4. Deploy test contracts

### Testing Endpoints
Use curl or Postman:

```bash
# Get config
curl http://localhost:3000/api/payment/config

# Health check
curl http://localhost:3000/api/payment/health

# Execute payment
curl -X POST http://localhost:3000/api/payment/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x...",
    "paymentTokenAddress": "0x...",
    "paymentAmount": "1000000",
    "rewardAmount": "5000000000000000000000",
    "deadline": 1234567890,
    "signature": {"v": 27, "r": "0x...", "s": "0x..."}
  }'
```

## Production Deployment

### Prerequisites
- Node.js 18+
- Relayer wallet funded with BNB
- Smart contracts deployed
- Environment variables configured

### Deploy to Railway/Render
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables in dashboard
4. Deploy

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
RPC_URL=https://bsc-dataseed1.binance.org/
CHAIN_ID=56
FACILITATOR_ADDRESS=0x...
REWARD_TOKEN_ADDRESS=0x...
PAYMENT_TOKEN_ADDRESS=0x...
RELAYER_PRIVATE_KEY=0x...
ALLOWED_ORIGINS=https://yourdomain.com
```

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Ethers.js v6** - Blockchain interactions
- **CORS** - Cross-origin resource sharing
- **Express-rate-limit** - API rate limiting
- **Dotenv** - Environment configuration

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure relayer wallet has sufficient BNB
4. Check contract addresses are correct

## License

MIT
