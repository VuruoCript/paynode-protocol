/**
 * Utility for creating EIP-2612 Permit signatures
 * Allows gasless token approvals via signed messages
 */

import { BrowserProvider, Contract, Signer } from 'ethers';

const ERC20_PERMIT_ABI = [
  'function nonces(address owner) view returns (uint256)',
  'function name() view returns (string)',
  'function version() view returns (string)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
];

export interface PermitSignature {
  v: number;
  r: string;
  s: string;
  deadline: number;
  nonce: bigint;
}

export interface CreatePermitParams {
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
  value: bigint;
  deadline: number;
  provider: BrowserProvider;
  chainId: number;
}

/**
 * Creates an EIP-2612 Permit signature for gasless token approval
 */
export async function createPermitSignature({
  tokenAddress,
  ownerAddress,
  spenderAddress,
  value,
  deadline,
  provider,
  chainId,
}: CreatePermitParams): Promise<PermitSignature> {
  try {
    // 1. Get the signer from the provider
    const signer: Signer = await provider.getSigner();

    // 2. Create token contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_PERMIT_ABI, provider);

    // 3. Get current nonce for the owner
    const nonce = await tokenContract.nonces(ownerAddress);

    if (nonce === null || nonce === undefined) {
      throw new Error('Failed to get nonce from token contract');
    }

    // 4. Get token name for EIP-712 domain
    let tokenName = 'Unknown Token';
    try {
      const tokenNameRaw = await tokenContract.name();
      tokenName = tokenNameRaw && String(tokenNameRaw).trim() ? String(tokenNameRaw) : 'Unknown Token';
    } catch (error) {
      console.warn('Failed to get token name, using default:', error);
      tokenName = 'Unknown Token';
    }

    // 5. Try to get version, default to '1' if not available
    let version = '1';
    try {
      const versionRaw = await tokenContract.version();
      // Ensure version is a non-empty string
      version = versionRaw && String(versionRaw).trim() ? String(versionRaw) : '1';
    } catch {
      // Many tokens don't implement version(), use default '1'
      console.log('Token does not implement version(), using default "1"');
    }

    // 6. Create EIP-712 domain - ensure all values are proper strings
    const domain = {
      name: String(tokenName),
      version: String(version),
      chainId: Number(chainId),
      verifyingContract: String(tokenAddress).toLowerCase(),
    };

    // 7. Define EIP-712 types for Permit
    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    // 8. Create the message to sign - ensure all values are properly typed
    const message = {
      owner: String(ownerAddress).toLowerCase(),
      spender: String(spenderAddress).toLowerCase(),
      value: value.toString(),
      nonce: nonce.toString(),
      deadline: Number(deadline),
    };

    // 9. Sign the typed data (EIP-712)
    const signature = await signer.signTypedData(domain, types, message);

    // 10. Split signature into v, r, s components
    const { v, r, s } = splitSignature(signature);

    return {
      v,
      r,
      s,
      deadline,
      nonce,
    };
  } catch (error: any) {
    console.error('Error creating permit signature:', error);
    throw new Error(`Failed to create permit signature: ${error.message}`);
  }
}

/**
 * Split a signature into v, r, s components
 */
function splitSignature(signature: string): { v: number; r: string; s: string } {
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { v, r, s };
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Create a deadline timestamp (current time + duration in seconds)
 */
export function createDeadline(durationSeconds: number = 3600): number {
  return getCurrentTimestamp() + durationSeconds;
}

/**
 * Validate if a deadline is still valid
 */
export function isDeadlineValid(deadline: number): boolean {
  return deadline > getCurrentTimestamp();
}
