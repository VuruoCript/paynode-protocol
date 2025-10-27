# Deploy MockUSDT to BSC Mainnet - Quick Guide

This guide will help you deploy a Permit-enabled USDT token to BSC Mainnet to fix the permit signature error.

## Prerequisites

- BNB in your wallet for gas fees (approximately 0.01 BNB)
- Private key with BNB balance
- BSC RPC access (default: `https://bsc-dataseed1.binance.org`)

## Step 1: Configure Environment

Navigate to the contracts directory and set up your `.env` file:

```bash
cd contracts
```

Edit `contracts/.env` or create it with:

```env
# Your deployer private key (must have BNB for gas)
PRIVATE_KEY=your_private_key_here

# BSC Mainnet RPC (optional, uses default if not set)
BSC_RPC_URL=https://bsc-dataseed1.binance.org

# Optional: BSCScan API key for contract verification
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

**Important Security Notes:**
- NEVER commit your `.env` file to git
- NEVER share your private key
- Use a deployer wallet, not your main wallet
- Ensure the deployer wallet has at least 0.01 BNB

## Step 2: Deploy MockUSDT

Run the deployment script:

```bash
npx hardhat run scripts/deploy-with-usdt.js --network bsc
```

**Expected Output:**
```
Starting complete deployment with MockUSDT...

Deploying contracts with account: 0xYourAddress
Account balance: 0.05 ETH

Deploying MockUSDT...
MockUSDT deployed to: 0xNewMockUSDTAddress

Deploying GaslessReward token...
GaslessReward deployed to: 0xNewGRWAddress

Deploying X402Facilitator...
X402Facilitator deployed to: 0xNewFacilitatorAddress

Transferring GaslessReward ownership to Facilitator...
Ownership transferred successfully!

Minting USDT to test accounts...
  Minted 1000 USDT to 0xYourAddress

============================================================
COMPLETE DEPLOYMENT SUMMARY
============================================================
Network: bsc
Chain ID: 56

Contracts:
- MockUSDT: 0xNewMockUSDTAddress
- GaslessReward (GRW): 0xNewGRWAddress
- X402Facilitator: 0xNewFacilitatorAddress

Configuration:
- Treasury: 0xYourAddress
- Reward Rate: 100 bps (1%)
- Min Payment: 0.01 USDT
============================================================
```

## Step 3: Update Backend Configuration

Copy the deployed addresses and update `backend/.env`:

```env
# From deployment output
FACILITATOR_ADDRESS=0xNewFacilitatorAddress
REWARD_TOKEN_ADDRESS=0xNewGRWAddress
PAYMENT_TOKEN_ADDRESS=0xNewMockUSDTAddress  # This is the key change!

# Keep existing settings
RPC_URL=https://bsc-dataseed1.binance.org/
CHAIN_ID=56
RELAYER_PRIVATE_KEY=your_relayer_key
RELAYER_ADDRESS=your_relayer_address
```

## Step 4: Restart Backend

```bash
cd backend
npm run start
```

## Step 5: Update Frontend (if needed)

If your frontend has hardcoded addresses, update them. Otherwise, it should fetch from backend automatically.

## Step 6: Test the Fix

1. **Clear browser cache** completely
2. **Connect wallet** to BSC Mainnet
3. **Mint test tokens** (if you added a faucet button) OR send yourself tokens from deployer
4. **Make a payment** - should work without permit errors!

## Verifying on BSCScan (Optional)

To verify your deployed contracts on BSCScan:

```bash
# Verify MockUSDT
npx hardhat verify --network bsc 0xNewMockUSDTAddress

# Verify GaslessReward
npx hardhat verify --network bsc 0xNewGRWAddress

# Verify X402Facilitator (requires constructor args)
npx hardhat verify --network bsc 0xNewFacilitatorAddress \
  "0xNewGRWAddress" \
  "0xYourTreasuryAddress" \
  100 \
  10000
```

## Adding Faucet Functionality (Optional)

To allow users to mint test tokens, you can add a faucet endpoint or UI:

### Backend API Endpoint Example:

```javascript
// backend/src/routes/faucet.js
import express from 'express';
import { ethers } from 'ethers';
import { networkConfig, contractAddresses } from '../config/blockchain.js';

const router = express.Router();

const MOCKUSDT_ABI = [
  'function mintForTesting(address to) external',
  'function balanceOf(address) view returns (uint256)',
];

router.post('/faucet', async (req, res) => {
  try {
    const { address } = req.body;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
    const usdt = new ethers.Contract(contractAddresses.paymentToken, MOCKUSDT_ABI, wallet);

    // Mint 1000 USDT to the user
    const tx = await usdt.mintForTesting(address);
    await tx.wait();

    // Get new balance
    const balance = await usdt.balanceOf(address);

    res.json({
      success: true,
      txHash: tx.hash,
      balance: ethers.formatUnits(balance, 6),
      message: 'Minted 1000 USDT successfully',
    });
  } catch (error) {
    console.error('Faucet error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Frontend Button Example:

```tsx
const mintTestTokens = async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const response = await fetch('https://your-backend.com/api/faucet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: accounts[0] }),
    });

    const data = await response.json();
    alert(`Minted 1000 test USDT! TX: ${data.txHash}`);
  } catch (error) {
    alert('Failed to mint tokens: ' + error.message);
  }
};

// In your JSX
<button onClick={mintTestTokens}>
  Get Test USDT
</button>
```

## Troubleshooting

### Issue: "insufficient funds for gas"
**Solution:** Add more BNB to your deployer wallet

### Issue: "nonce has already been used"
**Solution:** Wait a few seconds and try again, or reset your MetaMask account

### Issue: Deployment succeeds but backend still errors
**Solution:**
1. Double-check you updated `PAYMENT_TOKEN_ADDRESS` in `backend/.env`
2. Restart the backend server
3. Clear browser cache

### Issue: "UNPREDICTABLE_GAS_LIMIT"
**Solution:** The contract may have an issue. Check:
- You have enough BNB
- The RPC URL is correct
- Network is BSC Mainnet (chainId: 56)

## Cost Estimation

Deploying all three contracts costs approximately:
- **Gas used**: ~3,000,000 gas
- **Gas price**: ~3 Gwei
- **Total BNB**: ~0.009 BNB (~$5 USD at $550/BNB)

**Recommendation:** Have at least 0.02 BNB in deployer wallet for safety.

## After Deployment Checklist

- [ ] MockUSDT deployed successfully
- [ ] GaslessReward deployed successfully
- [ ] X402Facilitator deployed successfully
- [ ] Addresses saved from deployment output
- [ ] Backend `.env` updated with new addresses
- [ ] Backend restarted
- [ ] Browser cache cleared
- [ ] Test payment attempted
- [ ] Payment successful without permit error
- [ ] (Optional) Contracts verified on BSCScan
- [ ] (Optional) Faucet functionality added

## Important Notes

### This is a Test Token
- MockUSDT is NOT a real stablecoin
- It has NO USD backing
- Anyone can mint unlimited tokens (via `mintForTesting` or `faucet`)
- Use only for testing, demos, or closed ecosystems

### Security Considerations
- The MockUSDT has unrestricted minting for testing
- In production, you should either:
  1. Use a real stablecoin on a different network (Ethereum, Polygon, etc.)
  2. Deploy a controlled stablecoin with proper access controls
  3. Implement a proper faucet with rate limiting

### For Real Production
If you need real stablecoin payments:
- Deploy on Ethereum Mainnet, Polygon, Arbitrum, or Optimism
- Use native USDC which supports Permit
- Update all network configurations accordingly

## Need Help?

Refer to:
- Full solution document: `PERMIT_ISSUE_SOLUTION.md`
- Contract code: `contracts/contracts/MockUSDT.sol`
- Deployment script: `contracts/scripts/deploy-with-usdt.js`
- Network config: `contracts/hardhat.config.js`
