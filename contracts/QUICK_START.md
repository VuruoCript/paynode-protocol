# Quick Start Guide

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Private key for deployment
- BNB for gas fees (testnet or mainnet)

## 5-Minute Setup

### 1. Install Dependencies (1 min)
```bash
cd contracts
npm install
```

### 2. Configure Environment (1 min)
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your values
# PRIVATE_KEY=your_private_key_here
# BSCSCAN_API_KEY=your_api_key_here
```

### 3. Compile Contracts (1 min)
```bash
npm run compile
```

Expected output:
```
Compiled 24 Solidity files successfully
```

### 4. Run Tests (1 min)
```bash
npm test
```

Expected output:
```
  14 passing (1s)
```

### 5. Deploy to Testnet (1 min)
```bash
npm run deploy:testnet
```

## Deployment Output

You'll see something like:
```
Starting deployment...

Deploying contracts with account: 0x...
Account balance: 0.5 ETH

Deployment Parameters:
- Treasury Address: 0x...
- Reward Rate: 100 basis points (1%)
- Min Payment Amount: 0.01 tokens

Deploying GaslessReward token...
GaslessReward deployed to: 0x...

Deploying X402Facilitator...
X402Facilitator deployed to: 0x...

Transferring GaslessReward ownership to Facilitator...
Ownership transferred successfully!

============================================================
DEPLOYMENT SUMMARY
============================================================
Network: bscTestnet
Chain ID: 97

Contracts:
- GaslessReward (GRW): 0x...
- X402Facilitator: 0x...

Configuration:
- Treasury: 0x...
- Reward Rate: 100 bps (1%)
- Min Payment: 0.01 tokens
============================================================
```

## Contract Addresses

After deployment, find your contract addresses in:
```
contracts/deployments/bscTestnet-latest.json
```

## Verify Contracts

```bash
# Verify GaslessReward
npx hardhat verify --network bscTestnet <GASLESS_REWARD_ADDRESS>

# Verify X402Facilitator
npx hardhat verify --network bscTestnet <FACILITATOR_ADDRESS> \
  "<GASLESS_REWARD_ADDRESS>" \
  "<TREASURY_ADDRESS>" \
  100 \
  10000000000000000
```

## What's Next?

1. **Test the Contracts**
   - Use BSC Testnet faucet to get test BNB
   - Deploy a test ERC20 token with Permit
   - Test payment processing

2. **Integrate with Frontend**
   - Copy contract addresses
   - Update your dApp with the new addresses
   - Test gasless payments

3. **Deploy to Mainnet**
   ```bash
   npm run deploy:mainnet
   ```

## Common Issues

### Issue: "Insufficient funds for gas"
**Solution**: Get test BNB from BSC testnet faucet
- https://testnet.bnbchain.org/faucet-smart

### Issue: "Compilation failed"
**Solution**: Check Node.js version
```bash
node --version  # Should be >= 18.0.0
```

### Issue: "Module not found"
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Network error"
**Solution**: Check RPC URL in hardhat.config.js
```javascript
bscTestnet: {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545"
}
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run compile` | Compile contracts |
| `npm run deploy:local` | Deploy to local Hardhat network |
| `npm run deploy:testnet` | Deploy to BNB Chain testnet |
| `npm run deploy:mainnet` | Deploy to BNB Chain mainnet |
| `npm run clean` | Clean artifacts and cache |
| `npm run coverage` | Generate test coverage |

## File Structure

```
contracts/
├── contracts/              # Solidity contracts
│   ├── GaslessReward.sol
│   └── X402Facilitator.sol
├── scripts/               # Deployment scripts
│   └── deploy.js
├── test/                  # Test files
│   └── X402Facilitator.test.js
├── deployments/          # Deployment info (created after deploy)
│   └── bscTestnet-latest.json
├── hardhat.config.js     # Hardhat configuration
├── package.json          # Dependencies
├── .env                  # Environment variables (create this)
├── .env.example          # Template
└── README.md             # Documentation
```

## Configuration Options

Edit `scripts/deploy.js` to customize:

```javascript
// Treasury address (receives payments)
const TREASURY_ADDRESS = deployer.address;

// Reward rate (100 = 1%, 200 = 2%, etc.)
const REWARD_RATE = 100;

// Minimum payment (in wei)
const MIN_PAYMENT_AMOUNT = hre.ethers.parseEther("0.01");
```

## Network Information

### BNB Chain Testnet
- **Chain ID**: 97
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.bnbchain.org/faucet-smart

### BNB Chain Mainnet
- **Chain ID**: 56
- **RPC**: https://bsc-dataseed1.binance.org
- **Explorer**: https://bscscan.com

## Security Checklist

Before mainnet deployment:

- [ ] Change treasury address from deployer
- [ ] Test all functions on testnet
- [ ] Verify contracts on BscScan
- [ ] Audit smart contracts (recommended)
- [ ] Test emergency pause functionality
- [ ] Document all admin keys
- [ ] Set up monitoring for events

## Support

Need help? Check these resources:
- Hardhat Docs: https://hardhat.org/docs
- OpenZeppelin Docs: https://docs.openzeppelin.com
- BNB Chain Docs: https://docs.bnbchain.org

## Next Steps

1. ✓ Contracts compiled
2. ✓ Tests passing
3. → Deploy to testnet
4. → Verify contracts
5. → Test with frontend
6. → Deploy to mainnet

Good luck! 🚀
