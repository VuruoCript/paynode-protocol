/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface PaymentExecuteRequest {
  userAddress: string;
  paymentTokenAddress: string;
  paymentAmount: string;
  rewardAmount: string;
  deadline: number;
  signature: {
    v: number;
    r: string;
    s: string;
  };
}

export interface PaymentExecuteResponse {
  success: boolean;
  txHash?: string;
  rewardAmount?: string;
  message?: string;
  error?: string;
  explorerUrl?: string;
}

export interface PaymentConfig {
  facilitatorAddress: string;
  rewardTokenAddress: string;
  paymentTokenAddress: string;
  rates: {
    [key: string]: string;
  };
  chainId: number;
  networkName: string;
}

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: number;
  confirmations?: number;
}

export interface BalanceResponse {
  address: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
}

export interface CalculateRewardResponse {
  paymentAmount: string;
  rewardAmount: string;
  rewardFormatted: string;
  rate: string;
}

/**
 * Execute a gasless payment
 */
export async function executePayment(
  params: PaymentExecuteRequest
): Promise<PaymentExecuteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Payment execution failed');
    }

    return data;
  } catch (error: any) {
    console.error('Payment execution error:', error);
    throw error;
  }
}

/**
 * Get payment configuration from backend
 */
export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/config`);

    if (!response.ok) {
      throw new Error('Failed to fetch payment configuration');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching config:', error);
    throw error;
  }
}

/**
 * Check transaction status
 */
export async function getTransactionStatus(txHash: string): Promise<TransactionStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/status/${txHash}`);

    if (!response.ok) {
      throw new Error('Failed to fetch transaction status');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching transaction status:', error);
    throw error;
  }
}

/**
 * Get user's token balance
 */
export async function getUserBalance(address: string): Promise<BalanceResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/balance/${address}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user balance');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    throw error;
  }
}

/**
 * Calculate reward amount for a payment
 */
export async function calculateReward(amount: string): Promise<CalculateRewardResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/calculate/${amount}`);

    if (!response.ok) {
      throw new Error('Failed to calculate reward');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error calculating reward:', error);
    throw error;
  }
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/health`);

    if (!response.ok) {
      throw new Error('Backend health check failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Health check error:', error);
    throw error;
  }
}
