/**
 * React hook for creating EIP-2612 Permit signatures
 */

import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { createPermitSignature, createDeadline, PermitSignature } from '@/utils/permitSignature';

export interface UsePermitReturn {
  createPermit: (params: CreatePermitParams) => Promise<PermitSignature>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

export interface CreatePermitParams {
  tokenAddress: string;
  spenderAddress: string;
  value: bigint;
  deadlineDuration?: number; // in seconds, default 1 hour
}

export function usePermit(): UsePermitReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPermit = async ({
    tokenAddress,
    spenderAddress,
    value,
    deadlineDuration = 3600, // 1 hour default
  }: CreatePermitParams): Promise<PermitSignature> => {
    setIsCreating(true);
    setError(null);

    try {
      // Validate input parameters
      if (!tokenAddress || typeof tokenAddress !== 'string') {
        throw new Error('Invalid token address');
      }
      if (!spenderAddress || typeof spenderAddress !== 'string') {
        throw new Error('Invalid spender address');
      }
      if (value === null || value === undefined) {
        throw new Error('Invalid value: value cannot be null or undefined');
      }

      // Get provider from window.ethereum
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      }

      // Get connected address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('Wallet not connected');
      }
      const address = accounts[0];

      if (!address || typeof address !== 'string') {
        throw new Error('Invalid wallet address');
      }

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Validate chainId
      if (!chainId || isNaN(chainId) || chainId <= 0) {
        throw new Error('Invalid chain ID');
      }

      // Create deadline
      const deadline = createDeadline(deadlineDuration);

      // Validate deadline
      if (!deadline || isNaN(deadline) || deadline <= 0) {
        throw new Error('Invalid deadline');
      }

      // Create the permit signature with validated parameters
      const signature = await createPermitSignature({
        tokenAddress: String(tokenAddress).trim(),
        ownerAddress: String(address).trim(),
        spenderAddress: String(spenderAddress).trim(),
        value,
        deadline,
        provider,
        chainId,
      });

      setIsCreating(false);
      return signature;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create permit signature';
      setError(errorMessage);
      setIsCreating(false);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  return {
    createPermit,
    isCreating,
    error,
    clearError,
  };
}
