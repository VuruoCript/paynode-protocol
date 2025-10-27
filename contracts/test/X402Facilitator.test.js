import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("Frictionless Pay Protocol", function () {
  let gaslessReward;
  let facilitator;
  let owner;
  let treasury;
  let user;

  const REWARD_RATE = 100; // 1%
  const MIN_PAYMENT_AMOUNT = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, treasury, user] = await ethers.getSigners();

    // Deploy GaslessReward
    const GaslessReward = await ethers.getContractFactory("GaslessReward");
    gaslessReward = await GaslessReward.deploy();
    await gaslessReward.waitForDeployment();

    // Deploy X402Facilitator
    const X402Facilitator = await ethers.getContractFactory("X402Facilitator");
    facilitator = await X402Facilitator.deploy(
      await gaslessReward.getAddress(),
      treasury.address,
      REWARD_RATE,
      MIN_PAYMENT_AMOUNT
    );
    await facilitator.waitForDeployment();

    // Transfer ownership of GaslessReward to Facilitator
    await gaslessReward.transferOwnership(await facilitator.getAddress());
  });

  describe("Deployment", function () {
    it("Should deploy GaslessReward with correct name and symbol", async function () {
      expect(await gaslessReward.name()).to.equal("GaslessReward");
      expect(await gaslessReward.symbol()).to.equal("GRW");
    });

    it("Should set the correct owner for Facilitator", async function () {
      expect(await facilitator.owner()).to.equal(owner.address);
    });

    it("Should transfer GaslessReward ownership to Facilitator", async function () {
      expect(await gaslessReward.owner()).to.equal(await facilitator.getAddress());
    });

    it("Should set correct initial parameters", async function () {
      expect(await facilitator.treasury()).to.equal(treasury.address);
      expect(await facilitator.rewardRate()).to.equal(REWARD_RATE);
      expect(await facilitator.minPaymentAmount()).to.equal(MIN_PAYMENT_AMOUNT);
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update reward rate", async function () {
      const newRate = 200; // 2%
      await expect(facilitator.setRewardRate(newRate))
        .to.emit(facilitator, "RewardRateUpdated")
        .withArgs(REWARD_RATE, newRate);
      expect(await facilitator.rewardRate()).to.equal(newRate);
    });

    it("Should allow owner to update minimum payment amount", async function () {
      const newAmount = ethers.parseEther("0.05");
      await expect(facilitator.setMinPaymentAmount(newAmount))
        .to.emit(facilitator, "MinPaymentAmountUpdated")
        .withArgs(MIN_PAYMENT_AMOUNT, newAmount);
      expect(await facilitator.minPaymentAmount()).to.equal(newAmount);
    });

    it("Should allow owner to update treasury", async function () {
      const newTreasury = user.address;
      await expect(facilitator.setTreasury(newTreasury))
        .to.emit(facilitator, "TreasuryUpdated")
        .withArgs(treasury.address, newTreasury);
      expect(await facilitator.treasury()).to.equal(newTreasury);
    });

    it("Should not allow non-owner to update parameters", async function () {
      await expect(
        facilitator.connect(user).setRewardRate(200)
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      await facilitator.pause();
      expect(await facilitator.paused()).to.equal(true);

      await facilitator.unpause();
      expect(await facilitator.paused()).to.equal(false);
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(facilitator.connect(user).pause()).to.be.reverted;
    });
  });

  describe("GaslessReward Token", function () {
    it("Should allow Facilitator to mint tokens", async function () {
      const amount = ethers.parseEther("100");
      const facilitatorSigner = await ethers.getImpersonatedSigner(
        await facilitator.getAddress()
      );

      // Fund the facilitator contract for gas
      await owner.sendTransaction({
        to: await facilitator.getAddress(),
        value: ethers.parseEther("1"),
      });

      await expect(gaslessReward.connect(facilitatorSigner).mint(user.address, amount))
        .to.emit(gaslessReward, "TokensMinted")
        .withArgs(user.address, amount);

      expect(await gaslessReward.balanceOf(user.address)).to.equal(amount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        gaslessReward.connect(user).mint(user.address, amount)
      ).to.be.reverted;
    });

    it("Should allow users to burn their own tokens", async function () {
      // First mint some tokens to user via facilitator
      const mintAmount = ethers.parseEther("100");
      const facilitatorSigner = await ethers.getImpersonatedSigner(
        await facilitator.getAddress()
      );

      await owner.sendTransaction({
        to: await facilitator.getAddress(),
        value: ethers.parseEther("1"),
      });

      await gaslessReward.connect(facilitatorSigner).mint(user.address, mintAmount);

      // Now user burns tokens
      const burnAmount = ethers.parseEther("50");
      await expect(gaslessReward.connect(user).burnSelf(burnAmount))
        .to.emit(gaslessReward, "TokensBurned")
        .withArgs(user.address, burnAmount);

      expect(await gaslessReward.balanceOf(user.address)).to.equal(
        mintAmount - burnAmount
      );
    });
  });

  describe("View Functions", function () {
    it("Should return correct user nonce", async function () {
      expect(await facilitator.getUserNonce(user.address)).to.equal(0);
    });
  });
});
