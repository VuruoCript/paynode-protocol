import { ethers } from 'ethers';
import { networkConfig, relayerConfig } from '../config/blockchain.js';

/**
 * Relayer Service
 * Manages the relayer wallet that pays gas fees for gasless transactions
 */

let provider = null;
let relayerWallet = null;

/**
 * Initialize the relayer service
 * Creates provider and wallet instances
 */
export function initializeRelayer() {
  try {
    // Create provider connection to blockchain
    provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

    // Create wallet from private key
    relayerWallet = new ethers.Wallet(relayerConfig.privateKey, provider);

    console.log(`Relayer initialized: ${relayerWallet.address}`);

    // Check initial balance
    checkRelayerBalance();

    return relayerWallet;
  } catch (error) {
    console.error('Failed to initialize relayer:', error);
    throw new Error('Relayer initialization failed');
  }
}

/**
 * Get the relayer wallet instance
 */
export function getRelayerWallet() {
  if (!relayerWallet) {
    throw new Error('Relayer not initialized. Call initializeRelayer() first.');
  }
  return relayerWallet;
}

/**
 * Get the provider instance
 */
export function getProvider() {
  if (!provider) {
    throw new Error('Provider not initialized. Call initializeRelayer() first.');
  }
  return provider;
}

/**
 * Check relayer's BNB balance
 * Returns balance in BNB (not Wei)
 */
export async function checkRelayerBalance() {
  try {
    const balance = await provider.getBalance(relayerWallet.address);
    const balanceInBNB = ethers.formatEther(balance);

    console.log(`Relayer balance: ${balanceInBNB} BNB`);

    // Warn if balance is low
    if (parseFloat(balanceInBNB) < relayerConfig.minBalance) {
      console.warn(`⚠️  WARNING: Relayer balance is low! Current: ${balanceInBNB} BNB, Minimum: ${relayerConfig.minBalance} BNB`);
    }

    return balanceInBNB;
  } catch (error) {
    console.error('Failed to check relayer balance:', error);
    throw error;
  }
}

/**
 * Execute a transaction using the relayer wallet
 * @param {Object} contract - Ethers contract instance
 * @param {string} methodName - Contract method to call
 * @param {Array} args - Arguments for the method
 * @param {Object} options - Transaction options (gasLimit, etc.)
 */
export async function executeTransaction(contract, methodName, args, options = {}) {
  try {
    // Check balance before executing
    const balance = await checkRelayerBalance();
    if (parseFloat(balance) < relayerConfig.minBalance) {
      throw new Error('Insufficient relayer balance to process transaction');
    }

    console.log(`Executing transaction: ${methodName}`);
    // Convert BigInt to string for logging
    const argsForLogging = JSON.stringify(args, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2);
    console.log('Arguments:', argsForLogging);

    // Estimate gas if not provided
    let gasLimit = options.gasLimit;
    if (!gasLimit) {
      try {
        const estimatedGas = await contract[methodName].estimateGas(...args);
        // Add 20% buffer to estimated gas
        gasLimit = estimatedGas * 120n / 100n;
        console.log(`Estimated gas: ${estimatedGas.toString()}, Using: ${gasLimit.toString()}`);
      } catch (error) {
        console.warn('Gas estimation failed, using default:', error.message);
        gasLimit = 300000; // Default gas limit
      }
    }

    // Execute transaction
    const tx = await contract[methodName](...args, {
      gasLimit,
      ...options
    });

    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed'
    };
  } catch (error) {
    console.error('Transaction execution failed:', error);

    // Parse common errors
    let errorMessage = 'Transaction failed';

    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient relayer balance to pay gas fees';
    } else if (error.code === 'NONCE_EXPIRED') {
      errorMessage = 'Transaction nonce expired, please retry';
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Get transaction status by hash
 * @param {string} txHash - Transaction hash to check
 */
export async function getTransactionStatus(txHash) {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        status: 'pending',
        message: 'Transaction is pending confirmation'
      };
    }

    const block = await provider.getBlock(receipt.blockNumber);

    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
      timestamp: block.timestamp,
      gasUsed: receipt.gasUsed.toString(),
      confirmations: await receipt.confirmations()
    };
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    throw new Error('Failed to retrieve transaction status');
  }
}

/**
 * Get current gas price
 */
export async function getCurrentGasPrice() {
  try {
    const feeData = await provider.getFeeData();
    return {
      gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    };
  } catch (error) {
    console.error('Failed to get gas price:', error);
    return null;
  }
}

/**
 * Health check for the relayer service
 */
export async function healthCheck() {
  try {
    const balance = await checkRelayerBalance();
    const gasPrice = await getCurrentGasPrice();
    const blockNumber = await provider.getBlockNumber();

    return {
      healthy: parseFloat(balance) >= relayerConfig.minBalance,
      relayerAddress: relayerWallet.address,
      balance: `${balance} BNB`,
      gasPrice: gasPrice ? `${gasPrice.gasPrice} Gwei` : 'unknown',
      currentBlock: blockNumber,
      network: networkConfig.networkName
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      healthy: false,
      error: error.message
    };
  }
}
