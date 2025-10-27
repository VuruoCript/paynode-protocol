import express from 'express';
import {
  processGaslessPayment,
  getPaymentConfig,
  getUserTokenBalance,
  calculateRewardAmount
} from '../services/facilitatorService.js';
import { getTransactionStatus, healthCheck } from '../services/relayerService.js';

const router = express.Router();

/**
 * POST /api/payment/execute
 * Process a gasless payment transaction
 *
 * Request body:
 * {
 *   userAddress: "0x...",
 *   paymentTokenAddress: "0x...",
 *   paymentAmount: "1000000",  // 1 USDT (6 decimals)
 *   rewardAmount: "5000000000000000000000",  // 5000 GRW tokens
 *   deadline: 1234567890,
 *   signature: { v: 27, r: "0x...", s: "0x..." }
 * }
 */
router.post('/execute', async (req, res) => {
  try {
    console.log('Received payment execution request');
    console.log('Request body:', JSON.stringify(req.body, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    // Extract payment data from request
    const {
      userAddress,
      paymentTokenAddress,
      paymentAmount,
      rewardAmount,
      deadline,
      signature
    } = req.body;

    // Validate required fields
    if (!userAddress || !paymentTokenAddress || !paymentAmount || !rewardAmount || !deadline || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide all required payment parameters'
      });
    }

    // Validate signature format
    if (!signature.v || !signature.r || !signature.s) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature format',
        message: 'Signature must include v, r, and s components'
      });
    }

    // Process the gasless payment
    const result = await processGaslessPayment({
      userAddress,
      paymentTokenAddress,
      paymentAmount,
      rewardAmount,
      deadline,
      signature
    });

    // Return result
    if (result.success) {
      return res.status(200).json({
        success: true,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        rewardAmount: result.rewardAmount,
        paymentAmount: result.paymentAmount,
        message: 'Payment processed successfully',
        explorer: `https://bscscan.com/tx/${result.txHash}`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.details || 'Failed to process payment'
      });
    }

  } catch (error) {
    console.error('Payment execution error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/payment/config
 * Get payment configuration (contract addresses, rates, etc.)
 *
 * Response:
 * {
 *   facilitatorAddress: "0x...",
 *   rewardTokenAddress: "0x...",
 *   paymentTokenAddress: "0x...",
 *   rates: { "1": "5000", "5": "27000", "10": "55000" },
 *   network: { chainId: 56, name: "BNB Chain" }
 * }
 */
router.get('/config', (req, res) => {
  try {
    const config = getPaymentConfig();

    res.status(200).json({
      success: true,
      ...config
    });

  } catch (error) {
    console.error('Failed to get config:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve configuration',
      message: error.message
    });
  }
});

/**
 * GET /api/payment/status/:txHash
 * Check the status of a transaction
 *
 * Response:
 * {
 *   status: "confirmed",  // pending, confirmed, failed
 *   blockNumber: 12345678,
 *   timestamp: 1234567890,
 *   gasUsed: "150000",
 *   confirmations: 5
 * }
 */
router.get('/status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;

    // Validate transaction hash format
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction hash format',
        message: 'Transaction hash must be a valid hex string'
      });
    }

    // Get transaction status
    const status = await getTransactionStatus(txHash);

    res.status(200).json({
      success: true,
      txHash,
      ...status,
      explorer: `https://bscscan.com/tx/${txHash}`
    });

  } catch (error) {
    console.error('Failed to get transaction status:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction status',
      message: error.message
    });
  }
});

/**
 * GET /api/payment/balance/:address
 * Get user's payment token balance
 *
 * Response:
 * {
 *   address: "0x...",
 *   balance: {
 *     raw: "1000000",
 *     formatted: "1.0",
 *     decimals: 6
 *   }
 * }
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
        message: 'Address must be a valid Ethereum address'
      });
    }

    const config = getPaymentConfig();
    const balance = await getUserTokenBalance(address, config.paymentTokenAddress);

    res.status(200).json({
      success: true,
      address,
      balance
    });

  } catch (error) {
    console.error('Failed to get balance:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve balance',
      message: error.message
    });
  }
});

/**
 * GET /api/payment/calculate/:amount
 * Calculate reward amount for a given payment amount
 *
 * Response:
 * {
 *   paymentAmount: "1000000",
 *   rewardAmount: "5000000000000000000000",
 *   rate: "5000 GRW per USDT"
 * }
 */
router.get('/calculate/:amount', (req, res) => {
  try {
    const { amount } = req.params;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    const rewardAmount = calculateRewardAmount(amount, 6);

    res.status(200).json({
      success: true,
      paymentAmount: amount,
      rewardAmount,
      rate: 'Based on configured rates'
    });

  } catch (error) {
    console.error('Failed to calculate reward:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to calculate reward',
      message: error.message
    });
  }
});

/**
 * GET /api/payment/health
 * Health check endpoint for the payment service
 *
 * Response:
 * {
 *   healthy: true,
 *   relayerAddress: "0x...",
 *   balance: "0.5 BNB",
 *   gasPrice: "3 Gwei",
 *   currentBlock: 12345678,
 *   network: "BNB Chain"
 * }
 */
router.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();

    const statusCode = health.healthy ? 200 : 503;

    res.status(statusCode).json({
      success: health.healthy,
      ...health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error);

    res.status(503).json({
      success: false,
      healthy: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
