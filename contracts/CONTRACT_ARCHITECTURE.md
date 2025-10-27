# Contract Architecture

## System Overview

The Frictionless Pay Protocol consists of two main smart contracts that work together to enable gasless payments and reward users.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRICTIONLESS PAY PROTOCOL                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────┐
│                  │                    │                  │
│  GaslessReward   │◄───────owns────────│  X402Facilitator │
│   (ERC20 + EIP   │                    │   (Main Logic)   │
│     2612)        │                    │                  │
│                  │                    │                  │
└──────────────────┘                    └──────────────────┘
         │                                       │
         │                                       │
         │ mints rewards                         │ receives payments
         │                                       │
         ▼                                       ▼
    ┌─────────┐                            ┌─────────┐
    │  Users  │                            │Treasury │
    └─────────┘                            └─────────┘
```

## Contract Details

### GaslessReward.sol

**Purpose**: ERC20 reward token with gasless transaction support

**Key Features**:
- Standard ERC20 token (name: "GaslessReward", symbol: "GRW")
- EIP-2612 Permit for gasless approvals
- Only owner (X402Facilitator) can mint
- Users can burn their own tokens

**Inheritance**:
```
GaslessReward
    ├── ERC20 (OpenZeppelin)
    ├── ERC20Permit (OpenZeppelin)
    └── Ownable (OpenZeppelin)
```

### X402Facilitator.sol

**Purpose**: Main contract for processing gasless payments and managing rewards

**Key Features**:
- Accept payments via Permit signatures (no gas needed from users)
- Transfer payment tokens to treasury
- Mint reward tokens to users
- Configurable reward rate
- Emergency pause functionality
- Batch payment processing

**Inheritance**:
```
X402Facilitator
    ├── Ownable (OpenZeppelin)
    ├── Pausable (OpenZeppelin)
    └── ReentrancyGuard (OpenZeppelin)
```

## Payment Flow

```
STEP 1: User Signs Permit
┌──────────┐
│   User   │  Signs permit off-chain (no gas)
└────┬─────┘  • Approve payment token
     │        • Set deadline
     │        • Generate signature (v, r, s)
     ▼
┌──────────────────────────────────┐
│  Permit Signature (Off-chain)    │
│  • owner: user address           │
│  • spender: X402Facilitator      │
│  • value: payment amount         │
│  • deadline: timestamp           │
│  • v, r, s: signature params     │
└──────────────────────────────────┘

STEP 2: Facilitator Processes Payment
┌──────────────────┐
│ X402Facilitator  │
└────┬─────────────┘
     │ 1. Execute permit (approve tokens)
     │ 2. Transfer payment to treasury
     │ 3. Calculate reward amount
     │ 4. Mint reward tokens to user
     ▼
┌──────────────────┐
│   SUCCESS!       │
│ User receives:   │
│ • GRW tokens     │
│ • No gas spent   │
└──────────────────┘
```

## Security Features

### 1. ReentrancyGuard
- Protects against reentrancy attacks
- Applied to `processPayment` and `processPaymentBatch`

### 2. Pausable
- Emergency stop mechanism
- Owner can pause all payment processing
- Useful for upgrades or security incidents

### 3. Ownable
- Access control for administrative functions
- Only owner can:
  - Update reward rate
  - Update minimum payment
  - Change treasury address
  - Pause/unpause contract

### 4. Input Validation
- Zero address checks
- Minimum payment validation
- Reward rate limits (0-100%)
- Array length validation for batch processing

### 5. Nonce Tracking
- Per-user payment nonces
- Prevents replay attacks
- Ensures payment uniqueness

## Configuration Parameters

### Reward Rate
- Measured in basis points (bps)
- 100 bps = 1%
- 1000 bps = 10%
- Maximum: 10000 bps (100%)

**Example**:
```solidity
rewardRate = 100; // 1% reward
payment = 1000 tokens
reward = (1000 * 100) / 10000 = 10 tokens
```

### Minimum Payment Amount
- Prevents spam/dust transactions
- Set in wei (for tokens with 18 decimals)
- Default: 0.01 tokens (10^16 wei)

### Treasury Address
- Receives all payment tokens
- Should be a secure multisig wallet
- Can be updated by owner

## Usage Example

### Single Payment
```javascript
// User signs permit off-chain
const permit = await token.signPermit({
  owner: userAddress,
  spender: facilitatorAddress,
  value: paymentAmount,
  deadline: deadline
});

// Anyone can submit this (even a relayer)
await facilitator.processPayment(
  tokenAddress,
  paymentAmount,
  deadline,
  permit.v,
  permit.r,
  permit.s
);

// User receives GRW rewards automatically
```

### Batch Payment
```javascript
await facilitator.processPaymentBatch(
  tokenAddress,
  [amount1, amount2, amount3],
  [deadline1, deadline2, deadline3],
  [v1, v2, v3],
  [r1, r2, r3],
  [s1, s2, s3]
);
```

## Events

### GaslessReward Events
```solidity
event TokensMinted(address indexed to, uint256 amount);
event TokensBurned(address indexed from, uint256 amount);
```

### X402Facilitator Events
```solidity
event PaymentProcessed(
    address indexed payer,
    address indexed paymentToken,
    uint256 paymentAmount,
    uint256 rewardAmount,
    uint256 nonce
);

event RewardRateUpdated(uint256 oldRate, uint256 newRate);
event MinPaymentAmountUpdated(uint256 oldAmount, uint256 newAmount);
event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);
```

## Deployment Process

1. **Deploy GaslessReward**
   - Initial owner: Deployer
   - Initial supply: 0

2. **Deploy X402Facilitator**
   - Constructor args:
     - rewardToken address
     - treasury address
     - reward rate
     - min payment amount

3. **Transfer Ownership**
   - Transfer GaslessReward ownership to X402Facilitator
   - Allows Facilitator to mint rewards

4. **Configure (Optional)**
   - Update reward rate
   - Update treasury
   - Update minimum payment

5. **Verify Contracts**
   - Verify on BscScan for transparency

## Gas Optimization

- Uses `immutable` for rewardToken (saves gas)
- Batch processing for multiple payments
- Efficient storage layout
- Minimal external calls

## Upgrade Path

Current contracts are **not upgradeable** by design for simplicity and security.

To upgrade:
1. Deploy new contract versions
2. Pause old contracts
3. Migrate liquidity/ownership
4. Update frontend to use new addresses

## Testing Coverage

Test categories:
- ✓ Deployment verification
- ✓ Configuration updates
- ✓ Access control
- ✓ Pausable functionality
- ✓ Token minting/burning
- ✓ View functions

Run tests:
```bash
npm test
```

## Solidity Version

- **Version**: ^0.8.20
- **EVM Target**: paris
- **Optimizer**: Enabled (200 runs)

## OpenZeppelin Dependencies

- @openzeppelin/contracts@^5.4.0
  - token/ERC20/ERC20.sol
  - token/ERC20/extensions/ERC20Permit.sol
  - access/Ownable.sol
  - utils/Pausable.sol
  - utils/ReentrancyGuard.sol

## License

MIT License - See individual contract files for details
