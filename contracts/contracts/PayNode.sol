// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PayNode
 * @dev ERC20 token with EIP-2612 Permit functionality for gasless transactions
 * This token is minted as rewards for users who make payments through the X402Facilitator
 */
contract PayNode is ERC20, ERC20Permit, Ownable {

    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev Constructor that sets the token name, symbol, and initial owner
     */
    constructor()
        ERC20("PayNode", "PND")
        ERC20Permit("PayNode")
        Ownable(msg.sender)
    {
        // Token is initialized with 0 supply
        // Tokens will be minted by the facilitator as rewards
    }

    /**
     * @dev Mint new tokens to a specified address
     * Can only be called by the owner (typically the X402Facilitator contract)
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "PayNode: mint to zero address");
        require(amount > 0, "PayNode: mint amount must be greater than 0");

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from a specified address
     * Can only be called by the owner
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "PayNode: burn from zero address");
        require(amount > 0, "PayNode: burn amount must be greater than 0");

        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    /**
     * @dev Allow users to burn their own tokens
     * @param amount Amount of tokens to burn
     */
    function burnSelf(uint256 amount) external {
        require(amount > 0, "PayNode: burn amount must be greater than 0");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}
