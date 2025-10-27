# EIP-2612 Permit Issue - BSC USDC/USDT Not Supported

## Problem Summary

The PayNode protocol encountered an error when attempting to create permit signatures on BSC Mainnet:

```
Error: "could not decode result data (value="0x", info={ "method": "nonces", "signature": "nonces(address)" }, code=BAD_DATA, version=6.15.0)"
```

## Root Cause

The error occurs because **BSC stablecoins (USDC, USDT, BUSD) do not support EIP-2612 Permit**. These are Binance-Peg tokens (bridged/wrapped versions) that implement only the basic BEP-20 (ERC-20 equivalent) standard without the Permit extension.

### Current Configuration
- **Payment Token (in `.env`)**: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` (BSC USDC - Binance-Peg)
- **Alternative in deployment**: `0x55d398326f99059fF775485246999027B3197955` (BSC USDT - Binance-Peg)
- **Both tokens**: Do NOT support EIP-2612 Permit

### Why This Happened
- The MockUSDT contract used in testing includes `ERC20Permit` from OpenZeppelin
- Testing worked perfectly because MockUSDT has the `nonces()` function
- Production tokens (BSC USDC/USDT) are basic BEP-20 tokens without Permit support
- The `nonces()` function call returns empty data (`0x`), causing the decode error

## Solutions

### Option 1: Deploy Your Own Permit-Enabled USDT (RECOMMENDED)

Deploy a custom USDT-like token with EIP-2612 Permit support on BSC Mainnet.

**Pros:**
- Maintains gasless payment flow
- Full control over the token
- Can add faucet functionality for easy testing
- Users can freely mint/obtain tokens for testing

**Cons:**
- Not a "real" stablecoin (no USD backing)
- Lower liquidity and trust compared to major stablecoins
- Users must obtain your custom token

**Implementation:**
```bash
# Deploy MockUSDT to BSC Mainnet
cd contracts
npx hardhat run scripts/deploy-with-usdt.js --network bsc
```

Then update `backend/.env`:
```env
PAYMENT_TOKEN_ADDRESS=<YOUR_DEPLOYED_MOCKUSDT_ADDRESS>
```

**Best for:** Testing, demos, internal use, or if you plan to create your own ecosystem token.

### Option 2: Use a Different Blockchain Network

Switch to a network where USDC/USDT support Permit.

**Networks with USDC Permit Support:**
- **Ethereum Mainnet**: Native USDC supports Permit
- **Polygon**: USDC (native) supports Permit
- **Arbitrum**: USDC (native) supports Permit
- **Optimism**: USDC (native) supports Permit

**Pros:**
- Use real, trusted stablecoins
- Better liquidity and user trust
- No custom token needed

**Cons:**
- Higher gas costs (especially Ethereum mainnet)
- Need to redeploy all contracts
- Different network infrastructure

**Best for:** Production applications requiring real stablecoins.

### Option 3: Implement Traditional Approve Flow (Fallback)

Modify the protocol to support tokens without Permit by implementing a traditional two-step approval flow.

**How it works:**
1. User calls `approve()` on the token contract (costs gas)
2. Once approved, backend can process the payment
3. Payment still happens via relayer, but initial approval requires user gas

**Pros:**
- Works with ANY ERC-20/BEP-20 token
- Can support BSC USDC/USDT
- Hybrid approach: some users pay for approval, payment is still gasless

**Cons:**
- NOT truly gasless (approval requires gas)
- Worse UX (two-step process)
- Defeats the purpose of "frictionless" payments

**Implementation Required:**
1. Frontend: Add approval step before payment
2. Backend: Check allowance before processing payment
3. Smart Contract: May need modifications to handle both flows

**Best for:** Supporting multiple tokens or legacy tokens, but compromises on "gasless" promise.

### Option 4: Use Permit2 (Advanced)

Implement Uniswap's Permit2 contract, which provides permit-like functionality for ANY ERC-20 token.

**Pros:**
- Works with tokens that don't have native Permit
- Industry-standard solution (Uniswap)
- Can support BSC USDC/USDT

**Cons:**
- Complex implementation
- Requires users to approve Permit2 contract first (still one approval transaction)
- Additional contract dependency

**Best for:** Advanced use cases with multiple token support.

## What Was Fixed

### 1. Created Token Utility Functions
**File:** `src/utils/tokenUtils.ts`

- `supportsPermit()`: Dynamically checks if a token supports EIP-2612
- `isKnownNonPermitToken()`: Fast check for known non-permit tokens
- Maintains list of BSC tokens without Permit support

### 2. Updated Permit Signature Creation
**File:** `src/utils/permitSignature.ts`

- Added permit support detection before attempting to create signature
- Provides clear, user-friendly error messages
- Prevents confusing "BAD_DATA" errors

### 3. Error Message Improvement

**Before:**
```
Error: could not decode result data (value="0x", info={ "method": "nonces", "signature": "nonces(address)" }, code=BAD_DATA, version=6.15.0)
```

**After:**
```
Error: This token does not support EIP-2612 Permit (gasless approvals).
The token requires a standard approval transaction which costs gas.
Please contact support for alternative payment options or use a different token.
```

## Recommended Action Plan

### For Testing/Demo (Immediate)

1. **Deploy MockUSDT to BSC Mainnet:**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy-with-usdt.js --network bsc
   ```

2. **Update backend configuration:**
   ```bash
   cd backend
   # Edit .env file
   PAYMENT_TOKEN_ADDRESS=<DEPLOYED_MOCKUSDT_ADDRESS>
   ```

3. **Restart backend:**
   ```bash
   npm run start
   ```

4. **Frontend will now work** - users can mint test tokens and make gasless payments

### For Production (Long-term)

**Choose based on your use case:**

- **Internal/Testing App**: Use Option 1 (Deploy MockUSDT)
- **Real Payments Required**: Use Option 2 (Switch to Ethereum/Polygon)
- **Maximum Compatibility**: Use Option 3 (Traditional Approve Flow)
- **Advanced/Multi-token**: Use Option 4 (Permit2)

## Testing the Fix

1. **Clear browser cache** (the error message will be different now)
2. **Attempt a payment** - you should see a clear error message about Permit not being supported
3. **Deploy MockUSDT** and configure it as the payment token
4. **Try payment again** - should work perfectly

## Additional Notes

### Why MockUSDT Works
```solidity
contract MockUSDT is ERC20, ERC20Permit {
    // ERC20Permit adds:
    // - nonces(address) function
    // - permit() function
    // - DOMAIN_SEPARATOR() function
    // - All EIP-2612 functionality
}
```

### Why BSC USDC/USDT Don't Work
- They are basic BEP-20 tokens
- Only implement: `transfer`, `approve`, `transferFrom`, `balanceOf`, `allowance`
- Missing: `nonces`, `permit`, `DOMAIN_SEPARATOR`, `version`

## Files Modified

1. **`src/utils/tokenUtils.ts`** (NEW)
   - Token permit support detection
   - Known non-permit token list

2. **`src/utils/permitSignature.ts`** (MODIFIED)
   - Added permit support checks
   - Improved error messages

3. **`PERMIT_ISSUE_SOLUTION.md`** (NEW)
   - This documentation file

## References

- [EIP-2612 Specification](https://eips.ethereum.org/EIPS/eip-2612)
- [OpenZeppelin ERC20Permit](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit)
- [Uniswap Permit2](https://github.com/Uniswap/permit2)
- [BSC USDC Contract](https://bscscan.com/token/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d)
- [BSC USDT Contract](https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955)

## Support

If you need help implementing any of these solutions, please refer to:
- Contract deployment: `contracts/scripts/deploy-with-usdt.js`
- Token utilities: `src/utils/tokenUtils.ts`
- Backend configuration: `backend/.env.example`
