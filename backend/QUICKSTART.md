# Quick Start Guide

Get your gasless payment backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A deployed Facilitator smart contract on BNB Chain
- A wallet with some BNB for gas (relayer wallet)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update these values:
# - RELAYER_PRIVATE_KEY (your relayer wallet's private key)
# - FACILITATOR_ADDRESS (your deployed facilitator contract)
# - REWARD_TOKEN_ADDRESS (your reward token contract)
# - PAYMENT_TOKEN_ADDRESS (USDT/USDC address on BSC)
```

### Quick Reference - BSC Mainnet Addresses

```bash
# USDT on BSC
PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# USDC on BSC
PAYMENT_TOKEN_ADDRESS=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
```

## Step 3: Fund Relayer Wallet

The relayer wallet pays gas fees for all transactions. Fund it with BNB:

```bash
# Send at least 0.1 BNB to your relayer wallet address
# You can see the relayer address in the logs when you start the server
```

## Step 4: Start the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## Step 5: Test It!

Once the server is running, test the endpoints:

```bash
# Check health
curl http://localhost:3000/api/payment/health

# Get configuration
curl http://localhost:3000/api/payment/config
```

## Example .env File

```env
# Server
PORT=3000
NODE_ENV=development

# Blockchain
RPC_URL=https://bsc-dataseed1.binance.org/
CHAIN_ID=56
NETWORK_NAME=BNB Chain

# Contracts (REPLACE WITH YOUR ADDRESSES!)
FACILITATOR_ADDRESS=0xYourFacilitatorContractAddress
REWARD_TOKEN_ADDRESS=0xYourRewardTokenAddress
PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Relayer (REPLACE WITH YOUR PRIVATE KEY!)
RELAYER_PRIVATE_KEY=0xYourRelayerPrivateKeyHere

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
MIN_RELAYER_BALANCE=0.1

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Expected Console Output

When you start the server, you should see:

```
=================================
Gasless Payment Backend Server
=================================

Initializing relayer service...
Configuration validated successfully
Relayer initialized: 0xYourRelayerAddress
Relayer balance: 0.5 BNB

=================================
Server Status: RUNNING
Port: 3000
Environment: development
Network: BNB Chain
=================================

API Endpoints:
- GET  http://localhost:3000/
- GET  http://localhost:3000/api/payment/config
- POST http://localhost:3000/api/payment/execute
- GET  http://localhost:3000/api/payment/status/:txHash
- GET  http://localhost:3000/api/payment/balance/:address
- GET  http://localhost:3000/api/payment/calculate/:amount
- GET  http://localhost:3000/api/payment/health

=================================
```

## Troubleshooting

### "Missing required environment variables"
Make sure your `.env` file has all required variables set.

### "Invalid address format"
Check that all addresses start with `0x` and are 42 characters long.

### "Invalid private key format"
Private key should be 66 characters (including `0x` prefix).

### "Insufficient relayer balance"
Send more BNB to your relayer wallet address.

### "CORS error"
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`.

## Next Steps

1. Connect your frontend to the API
2. Test payments on BSC Testnet first
3. Monitor relayer balance regularly
4. Check logs for any errors
5. Deploy to production (Railway, Render, etc.)

## Testing BSC Testnet First

For testing, use BSC Testnet:

```env
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
CHAIN_ID=97
NETWORK_NAME=BNB Chain Testnet

# Deploy your contracts to testnet first
# Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart
```

## Production Checklist

- [ ] Test all endpoints thoroughly
- [ ] Fund relayer wallet with sufficient BNB
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with your domain
- [ ] Set up monitoring/alerts for relayer balance
- [ ] Set up logging service
- [ ] Deploy to secure hosting (Railway, Render, AWS, etc.)
- [ ] Use HTTPS in production

## Support

Need help? Check:
- Full documentation: `README.md`
- API documentation: See README.md "API Endpoints" section
- Logs: Check console output for detailed error messages

Happy coding!
