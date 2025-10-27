# Quick Testing Guide - Gasless Payment Flow

## Prerequisites

Ensure all services are running:

### 1. Start Hardhat Network
```bash
cd contracts
npx hardhat node
```
Leave this terminal running.

### 2. Deploy Contracts
Open a new terminal:
```bash
cd contracts
npx hardhat run scripts/deploy-with-usdt.js --network localhost
```

### 3. Start Backend Server
Open a new terminal:
```bash
cd backend
npm start
```

### 4. Start Frontend
Open a new terminal:
```bash
npm run dev
```

---

## Testing Methods

### Method 1: Automated Test Script (Recommended)

Run the complete end-to-end test:
```bash
node test-payment-flow.js
```

**Expected Output:**
```
=================================
Testing Gasless Payment Flow
=================================

Step 1: Fetching payment configuration...
✓ Payment Config loaded

Step 2: Setting up wallet...
✓ Test wallet: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

Step 3: Checking USDT balance...
✓ USDT Balance: 1000.0 USDT

Step 4: Creating permit signature...
✓ Signature created

Step 5: Sending payment request to backend...
✓ Payment successful!
  Transaction Hash: 0x...
  Block Number: 29
  Gas Used: 162115

Step 6: Verifying reward tokens...
✓ GRW Balance: 0.00000000000001 GRW

=================================
✓ ALL TESTS PASSED!
=================================
```

---

### Method 2: Manual API Testing with curl

#### 1. Get Payment Config
```bash
curl http://localhost:3000/api/payment/config
```

#### 2. Check Backend Health
```bash
curl http://localhost:3000/api/payment/health
```

#### 3. Check User Balance
```bash
curl http://localhost:3000/api/payment/balance/0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

---

### Method 3: Frontend Testing

1. Open browser to http://localhost:5173
2. Click "Connect Wallet"
3. Connect MetaMask to Hardhat Network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

4. Import test account to MetaMask:
   - Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
   - This account has 1000 USDT

5. Try making a payment:
   - Select amount (1, 5, or 10 USDT)
   - Click "Pay with USDT"
   - Sign the permit message (no gas required)
   - Wait for transaction confirmation
   - Check your GRW balance

---

## Test Accounts (Hardhat)

### Account #0 (Deployer/Treasury)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: 10000 ETH + 1000 USDT
```

### Account #1 (Relayer)
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Balance: 10000 ETH + 1000 USDT
Role: Backend relayer (pays gas fees)
```

### Account #2 (Test User)
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Balance: 10000 ETH + 1000 USDT
Role: User for testing (used in automated test)
```

---

## Contract Addresses (Current Deployment)

After running deployment, you'll see:
```
MockUSDT: 0x68B1D87F95878fE05B998F19b66F4baba5De1aed
GaslessReward: 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c
X402Facilitator: 0xc6e7DF5E7b4f2A278906862b61205850344D4e7d
```

These are already configured in `backend/.env`.

---

## Troubleshooting

### Issue: "Wallet not connected"
**Solution:** Ensure MetaMask is connected to Hardhat network (Chain ID 31337)

### Issue: "Insufficient USDT balance"
**Solution:** Run the deployment script again to mint USDT to test accounts

### Issue: "Transaction reverted"
**Solution:**
1. Check if contracts are deployed: `curl http://localhost:3000/api/payment/config`
2. Check backend is running: `curl http://localhost:3000/api/payment/health`
3. Restart all services (Hardhat, backend, frontend)

### Issue: "Cannot connect to backend"
**Solution:** Ensure backend is running on port 3000: `netstat -ano | findstr :3000`

### Issue: "Permit signature invalid"
**Solution:**
1. Check that frontend is using correct contract addresses
2. Verify user has USDT balance
3. Ensure deadline hasn't expired (should be 1 hour in future)

---

## Expected Transaction Flow

### 1. User Signs Permit (Frontend)
```javascript
// EIP-2612 Permit Signature
const signature = await wallet.signTypedData(domain, types, message)
```
**Gas Cost:** 0 (just signing, not sending transaction)

### 2. Backend Receives Request
```javascript
POST /api/payment/execute
{
  userAddress, paymentTokenAddress, paymentAmount,
  rewardAmount, deadline, signature: { v, r, s }
}
```

### 3. Relayer Calls Contract
```javascript
// Backend calls with user's signature
facilitatorContract.processPayment(
  userAddress,          // payer
  paymentTokenAddress,  // USDT
  paymentAmount,        // 1000000 (1 USDT)
  deadline,             // timestamp
  v, r, s               // signature components
)
```
**Gas Cost:** Paid by relayer (~162,115 gas)

### 4. Contract Executes
```solidity
// Validate and execute permit
permit(payer, address(this), paymentAmount, deadline, v, r, s)
// Transfer USDT from user to treasury
transferFrom(payer, treasury, paymentAmount)
// Mint reward tokens to user
rewardToken.mint(payer, rewardAmount)
```

### 5. User Receives Confirmation
```javascript
{
  success: true,
  txHash: "0x...",
  blockNumber: 29,
  message: "Payment processed successfully"
}
```

---

## Quick Verification Checklist

- [ ] Hardhat network running on port 8545
- [ ] Contracts deployed (check deployment summary)
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Test account has USDT balance
- [ ] MetaMask connected to Hardhat network
- [ ] Backend can communicate with Hardhat

---

## API Endpoints Reference

### GET /api/payment/config
Get payment configuration
```bash
curl http://localhost:3000/api/payment/config
```

### POST /api/payment/execute
Execute a gasless payment
```bash
curl -X POST http://localhost:3000/api/payment/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x...",
    "paymentTokenAddress": "0x...",
    "paymentAmount": "1000000",
    "rewardAmount": "5000000000000000000000",
    "deadline": 1234567890,
    "signature": { "v": 27, "r": "0x...", "s": "0x..." }
  }'
```

### GET /api/payment/status/:txHash
Check transaction status
```bash
curl http://localhost:3000/api/payment/status/0x...
```

### GET /api/payment/balance/:address
Get user's USDT balance
```bash
curl http://localhost:3000/api/payment/balance/0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### GET /api/payment/health
Check backend health
```bash
curl http://localhost:3000/api/payment/health
```

---

## Success Indicators

✅ **Payment Successful When:**
- No errors in backend logs
- Transaction hash returned
- Block number confirmed
- User's USDT balance decreased
- User's GRW balance increased
- No gas spent from user's wallet

---

## Additional Resources

- **Full Fix Documentation:** `FIXES_APPLIED.md`
- **Automated Test Script:** `test-payment-flow.js`
- **Backend Logs:** Check terminal running `npm start`
- **Hardhat Logs:** Check terminal running `npx hardhat node`
- **Frontend Console:** Check browser console for any errors
