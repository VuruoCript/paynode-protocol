import { ethers } from 'ethers';
import { contractAddresses, facilitatorABI, erc20PermitABI, paymentRates } from '../config/blockchain.js';
import { getRelayerWallet, getProvider, executeTransaction } from './relayerService.js';

/**
 * Facilitator Service
 * Handles interactions with the X402 Facilitator smart contract
 * Processes gasless payments using EIP-2612 permit signatures
 */

/**
 * Get the Facilitator contract instance
 */
function getFacilitatorContract() {
  const relayerWallet = getRelayerWallet();
  return new ethers.Contract(
    contractAddresses.facilitator,
    facilitatorABI,
    relayerWallet
  );
}

/**
 * Get an ERC20 token contract instance
 * @param {string} tokenAddress - Address of the ERC20 token
 */
function getTokenContract(tokenAddress) {
  const provider = getProvider();
  return new ethers.Contract(
    tokenAddress,
    erc20PermitABI,
    provider
  );
}

/**
 * Validate payment parameters
 * @param {Object} params - Payment parameters
 */
async function validatePaymentParams(params) {
  const { userAddress, paymentTokenAddress, paymentAmount, rewardAmount, deadline, signature } = params;

  // Validate addresses
  if (!ethers.isAddress(userAddress)) {
    throw new Error('Invalid user address');
  }
  if (!ethers.isAddress(paymentTokenAddress)) {
    throw new Error('Invalid payment token address');
  }

  // Validate amounts
  if (!paymentAmount || paymentAmount <= 0) {
    throw new Error('Invalid payment amount');
  }
  if (!rewardAmount || rewardAmount <= 0) {
    throw new Error('Invalid reward amount');
  }

  // Validate deadline
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (deadline <= currentTimestamp) {
    throw new Error('Permit signature has expired');
  }

  // Validate signature components
  if (!signature || !signature.v || !signature.r || !signature.s) {
    throw new Error('Invalid signature format');
  }

  // Check if payment token is the expected one
  if (paymentTokenAddress.toLowerCase() !== contractAddresses.paymentToken.toLowerCase()) {
    throw new Error('Payment token not supported');
  }

  // Check user's token balance
  const tokenContract = getTokenContract(paymentTokenAddress);
  const balance = await tokenContract.balanceOf(userAddress);

  if (balance < BigInt(paymentAmount)) {
    throw new Error(`Insufficient token balance. Required: ${paymentAmount}, Available: ${balance.toString()}`);
  }

  console.log('Payment parameters validated successfully');
  return true;
}

/**
 * Process a gasless payment
 * Main function that executes the transaction on the facilitator contract
 *
 * @param {Object} paymentData - Payment data from the frontend
 * @param {string} paymentData.userAddress - User's wallet address
 * @param {string} paymentData.paymentTokenAddress - Token used for payment (USDT/USDC)
 * @param {string} paymentData.paymentAmount - Amount to pay (in token's smallest unit)
 * @param {string} paymentData.rewardAmount - Amount of reward tokens to mint
 * @param {number} paymentData.deadline - Unix timestamp for signature expiration
 * @param {Object} paymentData.signature - EIP-2612 permit signature {v, r, s}
 */
export async function processGaslessPayment(paymentData) {
  try {
    console.log('Processing gasless payment...');

    // Validate all parameters
    await validatePaymentParams(paymentData);

    // Get facilitator contract
    const facilitatorContract = getFacilitatorContract();

    // Prepare individual parameters for the contract
    // The relayer calls on behalf of the payer
    const payerAddress = paymentData.userAddress;
    const paymentTokenAddress = paymentData.paymentTokenAddress;
    const paymentAmount = BigInt(paymentData.paymentAmount);
    const deadline = BigInt(paymentData.deadline);
    const v = paymentData.signature.v;
    const r = paymentData.signature.r;
    const s = paymentData.signature.s;

    console.log('Calling processPayment on facilitator contract...');
    console.log('Parameters:', {
      payer: payerAddress,
      paymentToken: paymentTokenAddress,
      paymentAmount: paymentAmount.toString(),
      deadline: deadline.toString(),
      v,
      r,
      s
    });

    // Execute the transaction using relayer service
    // Pass parameters as individual arguments: payer, paymentToken, paymentAmount, deadline, v, r, s
    const result = await executeTransaction(
      facilitatorContract,
      'processPayment',
      [payerAddress, paymentTokenAddress, paymentAmount, deadline, v, r, s],
      { gasLimit: 350000 } // Sufficient gas for the transaction
    );

    console.log('Payment processed successfully:', result);

    return {
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      paymentAmount: paymentData.paymentAmount,
      rewardAmount: paymentData.rewardAmount,
      message: 'Payment processed successfully'
    };

  } catch (error) {
    console.error('Failed to process gasless payment:', error);

    // Return detailed error
    return {
      success: false,
      error: error.message || 'Failed to process payment',
      details: error.reason || error.message
    };
  }
}

/**
 * Get payment configuration
 * Returns contract addresses and payment rates
 */
export function getPaymentConfig() {
  return {
    facilitatorAddress: contractAddresses.facilitator,
    rewardTokenAddress: contractAddresses.rewardToken,
    paymentTokenAddress: contractAddresses.paymentToken,
    rates: paymentRates,
    network: {
      chainId: process.env.CHAIN_ID || 56,
      name: process.env.NETWORK_NAME || 'BNB Chain'
    }
  };
}

/**
 * Get token information
 * @param {string} tokenAddress - Token contract address
 */
export async function getTokenInfo(tokenAddress) {
  try {
    const tokenContract = getTokenContract(tokenAddress);

    const [name, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.decimals()
    ]);

    return {
      address: tokenAddress,
      name,
      decimals: Number(decimals)
    };
  } catch (error) {
    console.error('Failed to get token info:', error);
    throw new Error('Failed to retrieve token information');
  }
}

/**
 * Get user's token balance
 * @param {string} userAddress - User's wallet address
 * @param {string} tokenAddress - Token contract address
 */
export async function getUserTokenBalance(userAddress, tokenAddress) {
  try {
    if (!ethers.isAddress(userAddress) || !ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid address format');
    }

    const tokenContract = getTokenContract(tokenAddress);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();

    return {
      raw: balance.toString(),
      formatted: ethers.formatUnits(balance, decimals),
      decimals: Number(decimals)
    };
  } catch (error) {
    console.error('Failed to get user token balance:', error);
    throw new Error('Failed to retrieve user balance');
  }
}

/**
 * Calculate reward amount based on payment amount
 * @param {string} paymentAmount - Amount in payment token's smallest unit
 * @param {number} paymentDecimals - Payment token decimals
 */
export function calculateRewardAmount(paymentAmount, paymentDecimals = 6) {
  try {
    // Convert payment amount to base units (e.g., USDT to dollars)
    const paymentInDollars = parseFloat(ethers.formatUnits(paymentAmount, paymentDecimals));

    // Find matching rate or calculate proportionally
    let rewardAmount;
    if (paymentRates[paymentInDollars.toString()]) {
      rewardAmount = paymentRates[paymentInDollars.toString()];
    } else {
      // Default rate: 1 USDT = 5000 GRW
      const baseRate = 5000;
      rewardAmount = (paymentInDollars * baseRate).toString();
    }

    // Convert to token's smallest unit (18 decimals for GRW)
    return ethers.parseUnits(rewardAmount, 18).toString();
  } catch (error) {
    console.error('Failed to calculate reward amount:', error);
    throw new Error('Failed to calculate reward amount');
  }
}

/**
 * Verify a permit signature (optional validation before sending to contract)
 * This is useful for early validation before consuming gas
 *
 * @param {Object} permitData - Permit signature data
 */
export async function verifyPermitSignature(permitData) {
  try {
    const { userAddress, paymentTokenAddress, spenderAddress, value, deadline, signature } = permitData;

    const tokenContract = getTokenContract(paymentTokenAddress);
    const nonce = await tokenContract.nonces(userAddress);
    const tokenName = await tokenContract.name();
    const chainId = parseInt(process.env.CHAIN_ID) || 56;

    // EIP-712 domain
    const domain = {
      name: tokenName,
      version: '1',
      chainId: chainId,
      verifyingContract: paymentTokenAddress
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

    // Message
    const message = {
      owner: userAddress,
      spender: spenderAddress,
      value: value.toString(),
      nonce: nonce.toString(),
      deadline: deadline
    };

    // Recover signer from signature
    const recoveredAddress = ethers.verifyTypedData(
      domain,
      types,
      message,
      signature
    );

    if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error('Invalid signature: recovered address does not match owner');
    }

    console.log('Permit signature verified successfully');
    return true;
  } catch (error) {
    console.error('Permit signature verification failed:', error);
    throw new Error('Invalid permit signature');
  }
}
