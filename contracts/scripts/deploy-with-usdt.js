import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("\nStarting complete deployment with MockUSDT...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy MockUSDT
  console.log("Deploying MockUSDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT deployed to:", usdtAddress, "\n");

  // 2. Deploy PayNode
  console.log("Deploying PayNode token...");
  const PayNode = await hre.ethers.getContractFactory("PayNode");
  const rewardToken = await PayNode.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("PayNode deployed to:", rewardTokenAddress, "\n");

  // 3. Deploy X402Facilitator
  console.log("Deploying X402Facilitator...");
  const X402Facilitator = await hre.ethers.getContractFactory("X402Facilitator");
  const minPayment = hre.ethers.parseUnits("0.01", 6);
  const facilitator = await X402Facilitator.deploy(
    rewardTokenAddress,
    deployer.address, // treasury
    100, // 1% reward rate
    minPayment // min 0.01 USDT
  );
  await facilitator.waitForDeployment();
  const facilitatorAddress = await facilitator.getAddress();
  console.log("X402Facilitator deployed to:", facilitatorAddress, "\n");

  // 4. Transfer ownership
  console.log("Transferring PayNode ownership to Facilitator...");
  const tx = await rewardToken.transferOwnership(facilitatorAddress);
  await tx.wait();
  console.log("Ownership transferred successfully!\n");

  // 5. Mint USDT to test accounts
  console.log("Minting USDT to test accounts...");
  const accounts = await hre.ethers.getSigners();
  for (let i = 0; i < Math.min(5, accounts.length); i++) {
    await usdt.mintForTesting(accounts[i].address);
    console.log(`  Minted 1000 USDT to ${accounts[i].address}`);
  }
  console.log();

  // 6. Save deployment info
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  const deployment = {
    network: network,
    chainId: Number(chainId),
    timestamp: new Date().toISOString(),
    contracts: {
      MockUSDT: usdtAddress,
      PayNode: rewardTokenAddress,
      X402Facilitator: facilitatorAddress
    },
    configuration: {
      treasury: deployer.address,
      rewardRate: "100",
      minPaymentAmount: "0.01"
    },
    testAccounts: accounts.slice(0, 5).map(acc => ({
      address: acc.address,
      usdtBalance: "1000"
    }))
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${network}-complete-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  const latestPath = path.join(deploymentsDir, `${network}-latest.json`);

  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
  fs.writeFileSync(latestPath, JSON.stringify(deployment, null, 2));

  console.log("============================================================");
  console.log("COMPLETE DEPLOYMENT SUMMARY");
  console.log("============================================================");
  console.log("Network:", network);
  console.log("Chain ID:", chainId.toString());
  console.log();
  console.log("Contracts:");
  console.log("- MockUSDT:", usdtAddress);
  console.log("- PayNode (PND):", rewardTokenAddress);
  console.log("- X402Facilitator:", facilitatorAddress);
  console.log();
  console.log("Configuration:");
  console.log("- Treasury:", deployer.address);
  console.log("- Reward Rate: 100 bps (1%)");
  console.log("- Min Payment: 0.01 USDT");
  console.log();
  console.log("Test Accounts (with 1000 USDT each):");
  accounts.slice(0, 5).forEach(acc => {
    console.log(`  - ${acc.address}`);
  });
  console.log("============================================================\n");
  console.log("Deployment info saved to:", latestPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
