# Frictionless Pay Protocol - Smart Contracts

This directory contains the smart contracts for the Frictionless Pay Protocol, enabling gasless payments on BNB Chain.

## Contracts

### GaslessReward.sol
ERC20 reward token with EIP-2612 Permit functionality.
- **Name**: GaslessReward
- **Symbol**: GRW
- **Features**:
  - EIP-2612 Permit for gasless approvals
  - Mintable by owner (Facilitator contract)
  - Burnable

### X402Facilitator.sol
Main facilitator contract for processing gasless payments.
- **Features**:
  - Accept payments via Permit signatures
  - Mint reward tokens to users
  - Pausable for emergency stops
  - ReentrancyGuard protection
  - Batch payment processing
  - Configurable reward rate

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - Private key for deployment
   - RPC URLs
   - BscScan API key
   - Treasury address

## Deployment

### Local Network (Hardhat)
```bash
npx hardhat run scripts/deploy.js --network hardhat
```

### BNB Chain Testnet
```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

### BNB Chain Mainnet
```bash
npx hardhat run scripts/deploy.js --network bsc
```

## Verification

After deployment, verify contracts on BscScan:

```bash
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Testing

Run tests:
```bash
npx hardhat test
```

Run tests with coverage:
```bash
npx hardhat coverage
```

## Configuration

- **Reward Rate**: Set in basis points (100 = 1%)
- **Min Payment Amount**: Minimum payment required
- **Treasury**: Address receiving payment tokens

## Security Features

- ReentrancyGuard on payment functions
- Pausable for emergency stops
- Owner-only administrative functions
- Zero address checks
- Amount validation

## Network Configuration

### BNB Chain Mainnet
- Chain ID: 56
- RPC: https://bsc-dataseed1.binance.org

### BNB Chain Testnet
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545

## License

MIT
