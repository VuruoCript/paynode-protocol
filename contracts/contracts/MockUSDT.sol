// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token with Permit for testing
 * Has 6 decimals like real USDT
 */
contract MockUSDT is ERC20, ERC20Permit {
    constructor() ERC20("Mock USDT", "USDT") ERC20Permit("Mock USDT") {
        // Mint 1 million USDT to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @dev Faucet function - anyone can mint USDT for testing
     */
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Helper to mint standard amounts
     */
    function mintForTesting(address to) external {
        _mint(to, 1000 * 10**6); // 1000 USDT
    }
}
