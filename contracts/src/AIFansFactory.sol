// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SoulFan} from "./SoulFan.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AIFansFactory {
    struct Bot {
        address wallet;
        string walrusSite;
    }

    mapping(uint256 tokenId => Bot bot) public bots;
    address public immutable fanImage;

    event BotCreated(address wallet, uint256 tokenId, uint256 timestamp);

    constructor(address _fanImage) {
        fanImage = _fanImage;
    }

    function createBot(string memory name, string memory blob, string memory walrusSite, address botWallet) external {
        require(botWallet != address(0), "Invalid bot name");
        uint256 tokenId = SoulFan(fanImage).mint(blob, botWallet);

        // Update state vars
        bots[tokenId] = Bot({wallet: botWallet, walrusSite: walrusSite});

        emit BotCreated(botWallet, tokenId, block.timestamp);
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
