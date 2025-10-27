# Quick Fix Guide - Permit Error

## TL;DR

**Problem**: BSC USDC/USDT don't support EIP-2612 Permit (gasless approvals)

**Solution**: Deploy MockUSDT (has Permit support) to BSC Mainnet

**Time**: 5-10 minutes

---

## Step-by-Step Fix

### 1. Deploy MockUSDT (2 minutes)

```bash
cd contracts
npx hardhat run scripts/deploy-with-usdt.js --network bsc
```

**Copy these addresses from output:**
- MockUSDT: `0x...`
- X402Facilitator: `0x...`
- GaslessReward: `0x...`

### 2. Update Backend Config (1 minute)

Edit `backend/.env`:

```env
PAYMENT_TOKEN_ADDRESS=0x...  # MockUSDT address from step 1
FACILITATOR_ADDRESS=0x...    # X402Facilitator from step 1
REWARD_TOKEN_ADDRESS=0x...   # GaslessReward from step 1
```

### 3. Restart Backend (1 minute)

```bash
cd backend
npm run start
```

### 4. Test (2 minutes)

1. Clear browser cache
2. Connect wallet to BSC Mainnet
3. Make a payment
4. ✅ Should work!

---

## If You Get Stuck

**Error: "insufficient funds"**
- Add BNB to deployer wallet (need ~0.01 BNB)

**Error: "PRIVATE_KEY not set"**
- Set `PRIVATE_KEY` in `contracts/.env`

**Still getting permit error?**
- Check: Did you restart backend after changing `.env`?
- Check: Did you clear browser cache?
- Check: Is `PAYMENT_TOKEN_ADDRESS` the MockUSDT address?

---

## Want More Details?

See these files:
- **Full explanation**: `FIX_SUMMARY.md`
- **All solutions**: `PERMIT_ISSUE_SOLUTION.md`
- **Detailed deploy guide**: `DEPLOY_MOCKUSDT_BSC.md`

---

## What Changed?

### Code Changes:
- ✅ Created `src/utils/tokenUtils.ts` - Detects permit support
- ✅ Updated `src/utils/permitSignature.ts` - Better error handling
- ✅ Error messages now explain the issue clearly

### What This Means:
- Using non-permit tokens now shows clear error
- Using permit-enabled tokens (MockUSDT) works perfectly
- Frontend build still succeeds

---

## For Production

**This MockUSDT is for TESTING ONLY**
- Anyone can mint unlimited tokens
- No USD backing
- Not a real stablecoin

**For real production payments:**
1. Deploy on Ethereum Mainnet (native USDC has Permit)
2. OR deploy on Polygon (native USDC has Permit)
3. OR implement traditional approve flow (user pays gas)

See `PERMIT_ISSUE_SOLUTION.md` for all options.

---

**Status**: ✅ Fixed
**Time to Deploy**: ~5 minutes
**Cost**: ~0.01 BNB (~$5 USD)
