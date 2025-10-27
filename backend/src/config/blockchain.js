import dotenv from 'dotenv';
dotenv.config();

// Blockchain network configuration
export const networkConfig = {
  rpcUrl: process.env.RPC_URL || 'https://bsc-dataseed1.binance.org/',
  chainId: parseInt(process.env.CHAIN_ID) || 56,
  networkName: process.env.NETWORK_NAME || 'BNB Chain',
};

// Smart contract addresses
export const contractAddresses = {
  facilitator: process.env.FACILITATOR_ADDRESS,
  rewardToken: process.env.REWARD_TOKEN_ADDRESS,
  paymentToken: process.env.PAYMENT_TOKEN_ADDRESS,
};

// Relayer configuration
export const relayerConfig = {
  privateKey: process.env.RELAYER_PRIVATE_KEY,
  minBalance: parseFloat(process.env.MIN_RELAYER_BALANCE) || 0.1,
};

// Payment rates configuration (1 USDT = X GRW tokens)
export const paymentRates = {
  '1': '5000',      // 1 USDT = 5000 GRW
  '5': '27000',     // 5 USDT = 27000 GRW (8% bonus)
  '10': '55000',    // 10 USDT = 55000 GRW (10% bonus)
};

// ABI for X402 Facilitator Contract
export const facilitatorABI = [
  // Main function to process gasless payments with permit (relayer calls on behalf of payer)
  {
    "inputs": [
      { "internalType": "address", "name": "payer", "type": "address" },
      { "internalType": "address", "name": "paymentToken", "type": "address" },
      { "internalType": "uint256", "name": "paymentAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint8", "name": "v", "type": "uint8" },
      { "internalType": "bytes32", "name": "r", "type": "bytes32" },
      { "internalType": "bytes32", "name": "s", "type": "bytes32" }
    ],
    "name": "processPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Event emitted when payment is processed
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "paymentToken", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "paymentAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "rewardAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "nonce", "type": "uint256" }
    ],
    "name": "PaymentProcessed",
    "type": "event"
  }
];

// ABI for ERC20 Token with Permit (EIP-2612)
export const erc20PermitABI = [
  // Standard ERC20 functions
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  // EIP-2612 Permit function
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint8", "name": "v", "type": "uint8" },
      { "internalType": "bytes32", "name": "r", "type": "bytes32" },
      { "internalType": "bytes32", "name": "s", "type": "bytes32" }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Nonces for EIP-2612
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "nonces",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Validate configuration on startup
export function validateConfig() {
  const required = [
    'RELAYER_PRIVATE_KEY',
    'FACILITATOR_ADDRESS',
    'REWARD_TOKEN_ADDRESS',
    'PAYMENT_TOKEN_ADDRESS',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate addresses format
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(contractAddresses.facilitator)) {
    throw new Error('Invalid FACILITATOR_ADDRESS format');
  }
  if (!addressRegex.test(contractAddresses.rewardToken)) {
    throw new Error('Invalid REWARD_TOKEN_ADDRESS format');
  }
  if (!addressRegex.test(contractAddresses.paymentToken)) {
    throw new Error('Invalid PAYMENT_TOKEN_ADDRESS format');
  }

  // Validate private key format
  const pkRegex = /^0x[a-fA-F0-9]{64}$/;
  if (!pkRegex.test(relayerConfig.privateKey)) {
    throw new Error('Invalid RELAYER_PRIVATE_KEY format');
  }

  console.log('Configuration validated successfully');
}
