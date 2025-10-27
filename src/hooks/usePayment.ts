/**
 * React hook for processing gasless payments
 */

import { useState } from 'react';
import { parseUnits } from 'ethers';
import { usePermit } from './usePermit';
import { executePayment, getPaymentConfig, PaymentExecuteResponse } from '@/services/apiService';

export interface ProcessPaymentParams {
  paymentAmountUSDT: string; // Amount in USDT (e.g., "1" for 1 USDT)
}

export interface PaymentState {
  isProcessing: boolean;
  currentStep: PaymentStep;
  error: string | null;
  txHash: string | null;
  explorerUrl: string | null;
}

export type PaymentStep = 'idle' | 'fetching_config' | 'creating_signature' | 'executing_payment' | 'completed' | 'error';

export interface UsePaymentReturn extends PaymentState {
  processPayment: (params: ProcessPaymentParams) => Promise<PaymentExecuteResponse>;
  reset: () => void;
}

export function usePayment(): UsePaymentReturn {
  const { createPermit } = usePermit();

  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    currentStep: 'idle',
    error: null,
    txHash: null,
    explorerUrl: null,
  });

  const processPayment = async ({
    paymentAmountUSDT
  }: ProcessPaymentParams): Promise<PaymentExecuteResponse> => {
    try {
      setState({
        isProcessing: true,
        currentStep: 'fetching_config',
        error: null,
        txHash: null,
        explorerUrl: null,
      });

      // 1. Get payment configuration
      const config = await getPaymentConfig();

      // Validate config
      if (!config || !config.paymentTokenAddress || !config.facilitatorAddress) {
        throw new Error('Invalid payment configuration received from server');
      }

      // 2. Convert USDT amount to wei (USDT has 6 decimals on BSC)
      if (!paymentAmountUSDT || isNaN(Number(paymentAmountUSDT))) {
        throw new Error('Invalid payment amount');
      }
      const paymentAmount = parseUnits(paymentAmountUSDT, 6); // USDT has 6 decimals

      // 3. Calculate reward amount based on rate
      // Backend returns rates with keys like "1", "5", "10"
      const rewardAmountString = config.rates[paymentAmountUSDT] || config.rates['1'];

      if (!rewardAmountString) {
        throw new Error(`Unable to determine reward amount for ${paymentAmountUSDT} USDT payment`);
      }

      const rewardAmount = parseUnits(rewardAmountString, 18); // PND has 18 decimals

      setState(prev => ({ ...prev, currentStep: 'creating_signature' }));

      // 4. Create permit signature
      const signature = await createPermit({
        tokenAddress: config.paymentTokenAddress,
        spenderAddress: config.facilitatorAddress,
        value: paymentAmount,
        deadlineDuration: 3600, // 1 hour
      });

      // Validate signature
      if (!signature || !signature.r || !signature.s || signature.v === null || signature.v === undefined) {
        throw new Error('Invalid signature received');
      }

      setState(prev => ({ ...prev, currentStep: 'executing_payment' }));

      // 5. Get user address from window
      if (!window.ethereum) {
        throw new Error('Wallet connection lost');
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet account found');
      }

      const userAddress = accounts[0];
      if (!userAddress || typeof userAddress !== 'string') {
        throw new Error('Invalid user address');
      }

      // 6. Execute payment via backend
      const result = await executePayment({
        userAddress: String(userAddress).toLowerCase(),
        paymentTokenAddress: String(config.paymentTokenAddress).toLowerCase(),
        paymentAmount: paymentAmount.toString(),
        rewardAmount: rewardAmount.toString(),
        deadline: Number(signature.deadline),
        signature: {
          v: Number(signature.v),
          r: String(signature.r),
          s: String(signature.s),
        },
      });

      setState({
        isProcessing: false,
        currentStep: 'completed',
        error: null,
        txHash: result.txHash || null,
        explorerUrl: result.explorerUrl || null,
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      setState({
        isProcessing: false,
        currentStep: 'error',
        error: errorMessage,
        txHash: null,
        explorerUrl: null,
      });
      throw err;
    }
  };

  const reset = () => {
    setState({
      isProcessing: false,
      currentStep: 'idle',
      error: null,
      txHash: null,
      explorerUrl: null,
    });
  };

  return {
    ...state,
    processPayment,
    reset,
  };
}
