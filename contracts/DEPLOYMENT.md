# Frictionless Pay Protocol - Deployment Guide

## Project Structure

```
contracts/
├── contracts/
│   ├── GaslessReward.sol          # ERC20 reward token with EIP-2612 Permit
│   └── X402Facilitator.sol        # Main facilitator contract
├── scripts/
│   └── deploy.js                  # Deployment script
├── test/
│   └── X402Facilitator.test.js    # Contract tests
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
└── README.md                      # Documentation
```

## Smart Contracts

### 1. GaslessReward.sol
**Location**: `C:\Users\User\Downloads\frictionless-pay-protocol\contracts\contracts\GaslessReward.sol`

**Features**:
- ERC20 token with name "GaslessReward" and symbol "GRW"
- EIP-2612 Permit for gasless approvals
- Mintable by owner (X402Facilitator)
- Burnable tokens
- Ownership transfer to Facilitator

**Key Functions**:
- `mint(address to, uint256 amount)` - Mint rewards (owner only)
- `burn(address from, uint256 amount)` - Burn tokens (owner only)
- `burnSelf(uint256 amount)` - Users can burn their own tokens
- `permit()` - EIP-2612 gasless approval

### 2. X402Facilitator.sol
**Location**: `C:\Users\User\Downloads\frictionless-pay-protocol\contracts\contracts\X402Facilitator.sol`

**Features**:
- Process gasless payments using Permit signatures
- Mint reward tokens to users
- Configurable reward rate
- Pausable for emergencies
- ReentrancyGuard protection
- Batch payment processing

**Key Functions**:
- `processPayment()` - Process single gasless payment
- `processPaymentBatch()` - Process multiple payments
- `setRewardRate()` - Update reward percentage
- `setMinPaymentAmount()` - Update minimum payment
- `setTreasury()` - Update treasury address
- `pause()/unpause()` - Emergency controls
- `emergencyWithdraw()` - Recover stuck tokens

## Deployment Steps

### 1. Setup Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure these variables:
```env
PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy Contracts

**Local Hardhat Network**:
```bash
npm run deploy:local
```

**BNB Chain Testnet** (Chain ID: 97):
```bash
npm run deploy:testnet
```

**BNB Chain Mainnet** (Chain ID: 56):
```bash
npm run deploy:mainnet
```

### 6. Deployment Output

After deployment, you'll find:
- `deployments/<network>-latest.json` - Latest deployment info
- `deployments/<network>-<timestamp>.json` - Timestamped deployment

Example output:
```json
{
  "network": "bscTestnet",
  "chainId": "97",
  "deployer": "0x...",
  "timestamp": "2025-10-27T...",
  "contracts": {
    "GaslessReward": {
      "address": "0x...",
      "name": "GaslessReward",
      "symbol": "GRW"
    },
    "X402Facilitator": {
      "address": "0x...",
      "treasury": "0x...",
      "rewardRate": 100,
      "minPaymentAmount": "10000000000000000"
    }
  }
}
```

## Verification

Verify contracts on BscScan:

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

## Configuration Parameters

Default deployment parameters:
- **Reward Rate**: 100 basis points (1%)
- **Min Payment Amount**: 0.01 tokens (10^16 wei)
- **Treasury**: Deployer address (change before mainnet deployment)

To modify, edit `scripts/deploy.js`:
```javascript
const TREASURY_ADDRESS = "0x...";  // Your treasury address
const REWARD_RATE = 100;           // 100 = 1%, 200 = 2%, etc.
const MIN_PAYMENT_AMOUNT = ethers.parseEther("0.01");
```

## Network Configuration

The project is configured for BNB Chain:

**Mainnet** (bsc):
- Chain ID: 56
- RPC: https://bsc-dataseed1.binance.org

**Testnet** (bscTestnet):
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545

**Local** (hardhat):
- Chain ID: 31337

## Security Features

1. **ReentrancyGuard**: Prevents reentrancy attacks on payment processing
2. **Pausable**: Emergency pause functionality
3. **Ownable**: Access control for administrative functions
4. **Zero Address Checks**: Validation on all address parameters
5. **Amount Validation**: Minimum payment requirements
6. **Nonce Tracking**: Per-user payment nonces

## NPM Scripts

Available commands:
- `npm test` - Run all tests
- `npm run compile` - Compile contracts
- `npm run deploy:local` - Deploy to local Hardhat network
- `npm run deploy:testnet` - Deploy to BNB Chain testnet
- `npm run deploy:mainnet` - Deploy to BNB Chain mainnet
- `npm run clean` - Clean artifacts and cache
- `npm run coverage` - Generate test coverage report

## Post-Deployment Checklist

- [ ] Contracts deployed successfully
- [ ] Ownership of GaslessReward transferred to Facilitator
- [ ] Deployment addresses saved to JSON
- [ ] Contracts verified on BscScan
- [ ] Treasury address configured correctly
- [ ] Reward rate set appropriately
- [ ] Test payment processed successfully
- [ ] Update frontend with contract addresses

## Support & Issues

If you encounter any issues:
1. Check Hardhat documentation: https://hardhat.org
2. Check OpenZeppelin docs: https://docs.openzeppelin.com
3. Verify Node.js version (>=18.0.0)
4. Ensure sufficient gas funds for deployment

## License

MIT
