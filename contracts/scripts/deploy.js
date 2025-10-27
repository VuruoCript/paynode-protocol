import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deployment parameters
  const TREASURY_ADDRESS = deployer.address; // Change to actual treasury address
  const REWARD_RATE = 100; // 1% reward rate (100 basis points)
  const MIN_PAYMENT_AMOUNT = hre.ethers.parseEther("0.01"); // Minimum 0.01 tokens

  console.log("Deployment Parameters:");
  console.log("- Treasury Address:", TREASURY_ADDRESS);
  console.log("- Reward Rate:", REWARD_RATE, "basis points (1%)");
  console.log("- Min Payment Amount:", hre.ethers.formatEther(MIN_PAYMENT_AMOUNT), "tokens\n");

  // Deploy GaslessReward token
  console.log("Deploying GaslessReward token...");
  const GaslessReward = await hre.ethers.getContractFactory("GaslessReward");
  const gaslessReward = await GaslessReward.deploy();
  await gaslessReward.waitForDeployment();
  const gaslessRewardAddress = await gaslessReward.getAddress();
  console.log("GaslessReward deployed to:", gaslessRewardAddress, "\n");

  // Deploy X402Facilitator
  console.log("Deploying X402Facilitator...");
  const X402Facilitator = await hre.ethers.getContractFactory("X402Facilitator");
  const facilitator = await X402Facilitator.deploy(
    gaslessRewardAddress,
    TREASURY_ADDRESS,
    REWARD_RATE,
    MIN_PAYMENT_AMOUNT
  );
  await facilitator.waitForDeployment();
  const facilitatorAddress = await facilitator.getAddress();
  console.log("X402Facilitator deployed to:", facilitatorAddress, "\n");

  // Transfer ownership of GaslessReward to Facilitator
  console.log("Transferring GaslessReward ownership to Facilitator...");
  const transferTx = await gaslessReward.transferOwnership(facilitatorAddress);
  await transferTx.wait();
  console.log("Ownership transferred successfully!\n");

  // Verify ownership transfer
  const newOwner = await gaslessReward.owner();
  console.log("GaslessReward new owner:", newOwner);
  console.log("Ownership transfer verified:", newOwner === facilitatorAddress, "\n");

  // Prepare deployment data
  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      GaslessReward: {
        address: gaslessRewardAddress,
        name: "GaslessReward",
        symbol: "GRW",
      },
      X402Facilitator: {
        address: facilitatorAddress,
        treasury: TREASURY_ADDRESS,
        rewardRate: REWARD_RATE,
        minPaymentAmount: MIN_PAYMENT_AMOUNT.toString(),
      },
    },
  };

  // Save deployment addresses to JSON file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));

  // Also save as latest
  const latestFilepath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestFilepath, JSON.stringify(deploymentData, null, 2));

  console.log("Deployment addresses saved to:", filepath);
  console.log("Latest deployment saved to:", latestFilepath, "\n");

  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", deploymentData.chainId);
  console.log("\nContracts:");
  console.log("- GaslessReward (GRW):", gaslessRewardAddress);
  console.log("- X402Facilitator:", facilitatorAddress);
  console.log("\nConfiguration:");
  console.log("- Treasury:", TREASURY_ADDRESS);
  console.log("- Reward Rate:", REWARD_RATE, "bps (1%)");
  console.log("- Min Payment:", hre.ethers.formatEther(MIN_PAYMENT_AMOUNT), "tokens");
  console.log("=".repeat(60));

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n" + "=".repeat(60));
    console.log("VERIFICATION INSTRUCTIONS");
    console.log("=".repeat(60));
    console.log("\nTo verify contracts on BscScan, run:");
    console.log(`\nnpx hardhat verify --network ${hre.network.name} ${gaslessRewardAddress}`);
    console.log(
      `\nnpx hardhat verify --network ${hre.network.name} ${facilitatorAddress} "${gaslessRewardAddress}" "${TREASURY_ADDRESS}" ${REWARD_RATE} ${MIN_PAYMENT_AMOUNT}`
    );
    console.log("=".repeat(60));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
