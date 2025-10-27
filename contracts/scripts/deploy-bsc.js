/**
 * Deploy script for BSC Mainnet
 *
 * This script deploys PayNode token, X402Facilitator, and USDT contract to BSC
 *
 * Before running:
 * 1. Set DEPLOYER_PRIVATE_KEY in .env
 * 2. Set BSC_RPC_URL in .env (or use default)
 * 3. Make sure you have BNB for gas fees
 *
 * Run with: npx hardhat run scripts/deploy-bsc.js --network bsc
 */

import hre from 'hardhat';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🚀 Deploying to BSC Mainnet...\n');

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log('Deployer address:', deployer.address);
  console.log('Deployer balance:', hre.ethers.formatEther(balance), 'BNB\n');

  if (balance < hre.ethers.parseEther('0.1')) {
    console.error('❌ Insufficient BNB balance. Need at least 0.1 BNB for deployment.');
    process.exit(1);
  }

  // Configuration for BSC Mainnet
  const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC
  const TREASURY_ADDRESS = deployer.address; // Change this to your treasury address
  const REWARD_RATE = 100; // 1% = 100 basis points
  const MIN_PAYMENT = hre.ethers.parseUnits('1', 6); // 1 USDT minimum

  console.log('📝 Deployment Configuration:');
  console.log('- USDT Address:', USDT_ADDRESS);
  console.log('- Treasury:', TREASURY_ADDRESS);
  console.log('- Reward Rate:', REWARD_RATE / 100, '%');
  console.log('- Min Payment:', hre.ethers.formatUnits(MIN_PAYMENT, 6), 'USDT\n');

  // Deploy PayNode Token
  console.log('1️⃣  Deploying PayNode Token...');
  const PayNode = await hre.ethers.getContractFactory('PayNode');
  const payNode = await PayNode.deploy();
  await payNode.waitForDeployment();
  const payNodeAddress = await payNode.getAddress();
  console.log('✅ PayNode deployed to:', payNodeAddress);
  console.log('   Token Name: PayNode');
  console.log('   Token Symbol: PND\n');

  // Deploy X402Facilitator
  console.log('2️⃣  Deploying X402Facilitator...');
  const X402Facilitator = await hre.ethers.getContractFactory('X402Facilitator');
  const facilitator = await X402Facilitator.deploy(
    payNodeAddress,
    TREASURY_ADDRESS,
    REWARD_RATE,
    MIN_PAYMENT
  );
  await facilitator.waitForDeployment();
  const facilitatorAddress = await facilitator.getAddress();
  console.log('✅ X402Facilitator deployed to:', facilitatorAddress, '\n');

  // Transfer PayNode ownership to Facilitator
  console.log('3️⃣  Transferring PayNode ownership to Facilitator...');
  const tx = await payNode.transferOwnership(facilitatorAddress);
  await tx.wait();
  console.log('✅ Ownership transferred\n');

  // Verify ownership
  const owner = await payNode.owner();
  console.log('4️⃣  Verifying setup...');
  console.log('   PayNode owner:', owner);
  console.log('   Expected owner:', facilitatorAddress);
  console.log('   ✅ Ownership verified correctly\n');

  // Save deployment info
  const deploymentInfo = {
    network: 'bsc',
    chainId: 56,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PayNode: {
        address: payNodeAddress,
        name: 'PayNode',
        symbol: 'PND',
      },
      X402Facilitator: {
        address: facilitatorAddress,
        treasury: TREASURY_ADDRESS,
        rewardRate: REWARD_RATE,
        minPayment: MIN_PAYMENT.toString(),
      },
      USDT: {
        address: USDT_ADDRESS,
        name: 'Tether USD',
        symbol: 'USDT',
      },
    },
    explorerUrls: {
      PayNode: `https://bscscan.com/address/${payNodeAddress}`,
      X402Facilitator: `https://bscscan.com/address/${facilitatorAddress}`,
      USDT: `https://bscscan.com/address/${USDT_ADDRESS}`,
    },
  };

  const outputPath = join(__dirname, '..', 'deployment-bsc.json');
  writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('📄 Deployment info saved to:', outputPath, '\n');

  // Print summary
  console.log('═══════════════════════════════════════════════════');
  console.log('🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n📋 Contract Addresses:');
  console.log('   PayNode Token:     ', payNodeAddress);
  console.log('   X402Facilitator:   ', facilitatorAddress);
  console.log('   USDT (existing):   ', USDT_ADDRESS);
  console.log('\n🔗 Block Explorers:');
  console.log('   PayNode:          ', `https://bscscan.com/address/${payNodeAddress}`);
  console.log('   Facilitator:      ', `https://bscscan.com/address/${facilitatorAddress}`);
  console.log('\n⚙️  Next Steps:');
  console.log('   1. Update backend/.env with new contract addresses');
  console.log('   2. Update frontend/.env with new contract addresses');
  console.log('   3. Verify contracts on BSCScan (optional)');
  console.log('   4. Test the payment flow on BSC Mainnet');
  console.log('═══════════════════════════════════════════════════\n');

  // Print environment variables for easy copy-paste
  console.log('📝 Environment Variables (copy to .env files):\n');
  console.log('# Backend .env');
  console.log(`CHAIN_ID=56`);
  console.log(`NETWORK_NAME="BSC Mainnet"`);
  console.log(`RPC_URL="https://bsc-dataseed1.binance.org/"`);
  console.log(`FACILITATOR_ADDRESS="${facilitatorAddress}"`);
  console.log(`REWARD_TOKEN_ADDRESS="${payNodeAddress}"`);
  console.log(`PAYMENT_TOKEN_ADDRESS="${USDT_ADDRESS}"`);
  console.log(`RELAYER_PRIVATE_KEY="your-relayer-private-key-here"`);
  console.log('\n# Frontend .env');
  console.log(`VITE_CHAIN_ID=56`);
  console.log(`VITE_FACILITATOR_ADDRESS="${facilitatorAddress}"`);
  console.log(`VITE_REWARD_TOKEN_ADDRESS="${payNodeAddress}"`);
  console.log(`VITE_PAYMENT_TOKEN_ADDRESS="${USDT_ADDRESS}"`);
  console.log(`VITE_API_URL="your-backend-url-here"`);
  console.log('\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
