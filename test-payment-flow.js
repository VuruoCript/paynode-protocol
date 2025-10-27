/**
 * Test script to verify the complete gasless payment flow
 * This simulates what the frontend does
 */

import { ethers } from 'ethers';
import fetch from 'node-fetch';

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const RPC_URL = 'http://127.0.0.1:8545';

// Test account (Account #2 from Hardhat, has USDT minted)
const TEST_PRIVATE_KEY = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

async function main() {
  console.log('\n=================================');
  console.log('Testing Gasless Payment Flow');
  console.log('=================================\n');

  // 1. Get payment configuration
  console.log('Step 1: Fetching payment configuration...');
  const configResponse = await fetch(`${BACKEND_URL}/api/payment/config`);
  const config = await configResponse.json();

  if (!config.success) {
    throw new Error('Failed to get payment config: ' + config.error);
  }

  console.log('Payment Config:', {
    facilitator: config.facilitatorAddress,
    paymentToken: config.paymentTokenAddress,
    rewardToken: config.rewardTokenAddress
  });

  // 2. Setup provider and wallet
  console.log('\nStep 2: Setting up wallet...');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(TEST_PRIVATE_KEY, provider);
  console.log('Test wallet address:', wallet.address);

  // 3. Check USDT balance
  console.log('\nStep 3: Checking USDT balance...');
  const usdtAbi = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function nonces(address) view returns (uint256)',
    'function name() view returns (string)'
  ];
  const usdtContract = new ethers.Contract(config.paymentTokenAddress, usdtAbi, provider);
  const balance = await usdtContract.balanceOf(wallet.address);
  const decimals = await usdtContract.decimals();
  console.log(`USDT Balance: ${ethers.formatUnits(balance, decimals)} USDT`);

  if (balance < ethers.parseUnits('1', decimals)) {
    throw new Error('Insufficient USDT balance for test');
  }

  // 4. Create permit signature for 1 USDT
  console.log('\nStep 4: Creating permit signature...');
  const paymentAmount = ethers.parseUnits('1', 6); // 1 USDT (6 decimals)
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  const nonce = await usdtContract.nonces(wallet.address);
  const tokenName = await usdtContract.name();
  const chainId = (await provider.getNetwork()).chainId;

  // EIP-712 domain
  const domain = {
    name: tokenName,
    version: '1',
    chainId: Number(chainId),
    verifyingContract: config.paymentTokenAddress
  };

  // EIP-712 types
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  // Message to sign
  const message = {
    owner: wallet.address,
    spender: config.facilitatorAddress,
    value: paymentAmount.toString(),
    nonce: nonce.toString(),
    deadline: deadline
  };

  console.log('Signing permit with:');
  console.log('  Owner:', wallet.address);
  console.log('  Spender:', config.facilitatorAddress);
  console.log('  Value:', ethers.formatUnits(paymentAmount, 6), 'USDT');
  console.log('  Nonce:', nonce.toString());
  console.log('  Deadline:', deadline);

  const signature = await wallet.signTypedData(domain, types, message);
  const sig = ethers.Signature.from(signature);

  console.log('Signature created:', {
    v: sig.v,
    r: sig.r,
    s: sig.s
  });

  // 5. Calculate reward amount (1 USDT = 5000 GRW based on rates)
  const rewardAmount = ethers.parseUnits('5000', 18); // 5000 GRW (18 decimals)

  // 6. Send payment request to backend
  console.log('\nStep 5: Sending payment request to backend...');
  const paymentData = {
    userAddress: wallet.address.toLowerCase(),
    paymentTokenAddress: config.paymentTokenAddress.toLowerCase(),
    paymentAmount: paymentAmount.toString(),
    rewardAmount: rewardAmount.toString(),
    deadline: deadline,
    signature: {
      v: sig.v,
      r: sig.r,
      s: sig.s
    }
  };

  console.log('Payment request:', JSON.stringify(paymentData, null, 2));

  const paymentResponse = await fetch(`${BACKEND_URL}/api/payment/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });

  const result = await paymentResponse.json();

  console.log('\nPayment result:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('\n✓ Payment successful!');
    console.log('  Transaction Hash:', result.txHash);
    console.log('  Block Number:', result.blockNumber);
    console.log('  Gas Used:', result.gasUsed);

    // 7. Verify reward tokens were minted
    console.log('\nStep 6: Verifying reward tokens...');
    const grwAbi = ['function balanceOf(address) view returns (uint256)'];
    const grwContract = new ethers.Contract(config.rewardTokenAddress, grwAbi, provider);
    const grwBalance = await grwContract.balanceOf(wallet.address);
    console.log('GRW Balance:', ethers.formatEther(grwBalance), 'GRW');

    console.log('\n=================================');
    console.log('✓ ALL TESTS PASSED!');
    console.log('=================================\n');
  } else {
    console.log('\n✗ Payment failed!');
    console.log('  Error:', result.error);
    console.log('  Details:', result.message);
    throw new Error('Payment execution failed');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n✗ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  });
