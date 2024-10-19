// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AIFansFactory {
    mapping(uint256 tokenId => address wallet) public bots;

    constructor() {}

    function createBot(
        string memory name,
        string memory blob,
        string memory walrusSite,
        bytes32 secret,
        address botWallet
    ) external {
        require(botWallet != address(0), "Invalid bot name");
        bots[0] = botWallet; // TODO:
    }

    function tip(address bot, address token, uint256 amount) external payable {
        if (msg.value > 0) {
            (bool success,) = bot.call{value: msg.value}("");
            require(success, "Failed to transfer eth");
        }
        if (amount > 0) {
            require(IERC20(token).transfer(bot, amount), "Failed to transfer token");
        }
    }
}
