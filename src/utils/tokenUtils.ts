/**
 * Token utility functions for checking EIP-2612 Permit support
 */

import { BrowserProvider, Contract } from 'ethers';

const PERMIT_CHECK_ABI = [
  'function nonces(address owner) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function permit(address,address,uint256,uint256,uint8,bytes32,bytes32) nonpayable',
];

/**
 * Check if a token contract supports EIP-2612 Permit
 * @param tokenAddress - The token contract address
 * @param provider - The ethers provider
 * @returns true if the token supports permit, false otherwise
 */
export async function supportsPermit(
  tokenAddress: string,
  provider: BrowserProvider
): Promise<boolean> {
  try {
    const contract = new Contract(tokenAddress, PERMIT_CHECK_ABI, provider);

    // Try to call nonces with a dummy address
    // If this doesn't revert, the function exists
    await contract.nonces('0x0000000000000000000000000000000000000000');

    return true;
  } catch (error: any) {
    // Check if the error is because the function doesn't exist
    if (
      error.message?.includes('could not decode result data') ||
      error.message?.includes('BAD_DATA') ||
      error.code === 'BAD_DATA' ||
      error.code === 'CALL_EXCEPTION'
    ) {
      return false;
    }

    // For other errors, we assume the function exists but call failed for another reason
    // (e.g., network error), so we return true
    console.warn('Error checking permit support, assuming supported:', error);
    return true;
  }
}

/**
 * Known tokens without permit support on BSC
 */
export const BSC_TOKENS_WITHOUT_PERMIT = [
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC (Binance-Peg)
  '0x55d398326f99059fF775485246999027B3197955', // USDT (Binance-Peg)
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD (Binance-Peg)
].map(addr => addr.toLowerCase());

/**
 * Check if a token address is known to not support permit
 * @param tokenAddress - The token contract address
 * @returns true if the token is known to not support permit
 */
export function isKnownNonPermitToken(tokenAddress: string): boolean {
  return BSC_TOKENS_WITHOUT_PERMIT.includes(tokenAddress.toLowerCase());
}
