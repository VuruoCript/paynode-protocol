// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./PayNode.sol";

/**
 * @title X402Facilitator
 * @dev Facilitates gasless payments using EIP-2612 Permit signatures
 * Users can make payments without holding native tokens for gas
 * The facilitator processes payments and mints reward tokens to users
 */
contract X402Facilitator is Ownable, Pausable, ReentrancyGuard {

    // Reward token contract
    PayNode public immutable rewardToken;

    // Mapping to track payment nonces for each user
    mapping(address => uint256) public paymentNonces;

    // Reward rate: tokens minted per payment token spent (in basis points, 100 = 1%)
    uint256 public rewardRate;

    // Minimum payment amount
    uint256 public minPaymentAmount;

    // Treasury address to receive payments
    address public treasury;

    // Events
    event PaymentProcessed(
        address indexed payer,
        address indexed paymentToken,
        uint256 paymentAmount,
        uint256 rewardAmount,
        uint256 nonce
    );
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event MinPaymentAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);

    /**
     * @dev Constructor
     * @param _rewardToken Address of the PayNode token contract
     * @param _treasury Address to receive payment tokens
     * @param _rewardRate Initial reward rate in basis points (100 = 1%)
     * @param _minPaymentAmount Minimum payment amount required
     */
    constructor(
        address _rewardToken,
        address _treasury,
        uint256 _rewardRate,
        uint256 _minPaymentAmount
    ) Ownable(msg.sender) {
        require(_rewardToken != address(0), "X402Facilitator: reward token is zero address");
        require(_treasury != address(0), "X402Facilitator: treasury is zero address");
        require(_rewardRate > 0 && _rewardRate <= 10000, "X402Facilitator: invalid reward rate");

        rewardToken = PayNode(_rewardToken);
        treasury = _treasury;
        rewardRate = _rewardRate;
        minPaymentAmount = _minPaymentAmount;
    }

    /**
     * @dev Process a gasless payment using permit signature
     * This function can be called by a relayer on behalf of a payer
     * @param payer Address of the user making the payment
     * @param paymentToken Address of the ERC20 token to pay with
     * @param paymentAmount Amount of tokens to pay
     * @param deadline Permit signature deadline
     * @param v ECDSA signature parameter v
     * @param r ECDSA signature parameter r
     * @param s ECDSA signature parameter s
     */
    function processPayment(
        address payer,
        address paymentToken,
        uint256 paymentAmount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused {
        require(payer != address(0), "X402Facilitator: payer is zero address");
        require(paymentToken != address(0), "X402Facilitator: payment token is zero address");
        require(paymentAmount >= minPaymentAmount, "X402Facilitator: payment amount too low");

        // Get the payer's current nonce
        uint256 currentNonce = paymentNonces[payer];

        // Increment nonce for next payment
        paymentNonces[payer] = currentNonce + 1;

        // Execute permit to approve token transfer
        // This uses the payer's signature to approve the transfer
        IERC20Permit(paymentToken).permit(
            payer,
            address(this),
            paymentAmount,
            deadline,
            v,
            r,
            s
        );

        // Transfer payment tokens from payer to treasury
        bool success = IERC20(paymentToken).transferFrom(
            payer,
            treasury,
            paymentAmount
        );
        require(success, "X402Facilitator: payment transfer failed");

        // Calculate reward amount
        uint256 rewardAmount = (paymentAmount * rewardRate) / 10000;

        // Mint reward tokens to the payer
        if (rewardAmount > 0) {
            rewardToken.mint(payer, rewardAmount);
        }

        emit PaymentProcessed(
            payer,
            paymentToken,
            paymentAmount,
            rewardAmount,
            currentNonce
        );
    }

    /**
     * @dev Process a batch of gasless payments
     * @param paymentToken Address of the ERC20 token to pay with
     * @param paymentAmounts Array of payment amounts
     * @param deadlines Array of permit signature deadlines
     * @param vs Array of ECDSA signature parameter v
     * @param rs Array of ECDSA signature parameter r
     * @param ss Array of ECDSA signature parameter s
     */
    function processPaymentBatch(
        address paymentToken,
        uint256[] calldata paymentAmounts,
        uint256[] calldata deadlines,
        uint8[] calldata vs,
        bytes32[] calldata rs,
        bytes32[] calldata ss
    ) external nonReentrant whenNotPaused {
        require(
            paymentAmounts.length == deadlines.length &&
            paymentAmounts.length == vs.length &&
            paymentAmounts.length == rs.length &&
            paymentAmounts.length == ss.length,
            "X402Facilitator: array length mismatch"
        );
        require(paymentAmounts.length > 0, "X402Facilitator: empty batch");
        require(paymentAmounts.length <= 50, "X402Facilitator: batch too large");

        for (uint256 i = 0; i < paymentAmounts.length; i++) {
            _processSinglePayment(
                paymentToken,
                paymentAmounts[i],
                deadlines[i],
                vs[i],
                rs[i],
                ss[i]
            );
        }
    }

    /**
     * @dev Internal function to process a single payment
     */
    function _processSinglePayment(
        address paymentToken,
        uint256 paymentAmount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        require(paymentAmount >= minPaymentAmount, "X402Facilitator: payment amount too low");

        uint256 currentNonce = paymentNonces[msg.sender];
        paymentNonces[msg.sender] = currentNonce + 1;

        IERC20Permit(paymentToken).permit(
            msg.sender,
            address(this),
            paymentAmount,
            deadline,
            v,
            r,
            s
        );

        bool success = IERC20(paymentToken).transferFrom(
            msg.sender,
            treasury,
            paymentAmount
        );
        require(success, "X402Facilitator: payment transfer failed");

        uint256 rewardAmount = (paymentAmount * rewardRate) / 10000;

        if (rewardAmount > 0) {
            rewardToken.mint(msg.sender, rewardAmount);
        }

        emit PaymentProcessed(
            msg.sender,
            paymentToken,
            paymentAmount,
            rewardAmount,
            currentNonce
        );
    }

    /**
     * @dev Update the reward rate
     * @param newRate New reward rate in basis points (100 = 1%)
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate > 0 && newRate <= 10000, "X402Facilitator: invalid reward rate");
        uint256 oldRate = rewardRate;
        rewardRate = newRate;
        emit RewardRateUpdated(oldRate, newRate);
    }

    /**
     * @dev Update the minimum payment amount
     * @param newAmount New minimum payment amount
     */
    function setMinPaymentAmount(uint256 newAmount) external onlyOwner {
        uint256 oldAmount = minPaymentAmount;
        minPaymentAmount = newAmount;
        emit MinPaymentAmountUpdated(oldAmount, newAmount);
    }

    /**
     * @dev Update the treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "X402Facilitator: treasury is zero address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal function for stuck tokens
     * @param token Address of the token to withdraw (use address(0) for native tokens)
     * @param to Address to send tokens to
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "X402Facilitator: withdraw to zero address");

        if (token == address(0)) {
            // Withdraw native tokens
            (bool success, ) = to.call{value: amount}("");
            require(success, "X402Facilitator: native token transfer failed");
        } else {
            // Withdraw ERC20 tokens
            bool success = IERC20(token).transfer(to, amount);
            require(success, "X402Facilitator: token transfer failed");
        }

        emit EmergencyWithdrawal(token, to, amount);
    }

    /**
     * @dev Get the current nonce for a user
     * @param user Address of the user
     * @return Current nonce
     */
    function getUserNonce(address user) external view returns (uint256) {
        return paymentNonces[user];
    }

    /**
     * @dev Receive function to accept native tokens
     */
    receive() external payable {}
}
