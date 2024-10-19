// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";
import {SoulFan} from "./SoulFan.sol";
import {FanMedia} from "./FanMedia.sol";

contract AIFansFactory is ReentrancyGuard {
    struct Bot {
        address wallet;
        string walrusSite;
        uint256 subscriptionPrice;
        uint256 imagePrice;
        uint256 voicePrice;
    }

    address public immutable soulFanAddress;
    address public immutable fanMediaAddress;

    mapping(uint256 tokenId => Bot bot) public bots;
    mapping(address user => mapping(uint256 tokenId => bool isSubscribed)) public subscriptions;

    event BotCreated(address wallet, uint256 tokenId, uint256 timestamp);

    modifier onlyBot(uint256 tokenId, address sender) {
        require(bots[tokenId].wallet == sender, "You are not the owner!");
        _;
    }

    modifier isSubscribed(uint256 tokenId, address user) {
        require(subscriptions[user][tokenId]);
        _;
    }

    constructor(address _soulFanAddress, address _fanMediaAddress) {
        soulFanAddress = _soulFanAddress;
        fanMediaAddress = _fanMediaAddress;
    }

    function createBot(string memory blob, string memory walrusSite, address botWallet) external {
        require(botWallet != address(0), "Invalid bot name");
        uint256 tokenId = SoulFan(soulFanAddress).mint(blob, botWallet);

        // Update state vars
        bots[tokenId] =
            Bot({wallet: botWallet, walrusSite: walrusSite, subscriptionPrice: 0, imagePrice: 0, voicePrice: 0});

        emit BotCreated(botWallet, tokenId, block.timestamp);
    }

    function subscribe(uint256 tokenId) external payable nonReentrant {
        require(msg.value >= bots[tokenId].subscriptionPrice, "You need to pay more to subscribe");
        subscriptions[msg.sender][tokenId] = true;
        (bool success,) = bots[tokenId].wallet.call{value: msg.value}("");
        require(success, "Failed to transfer eth");
    }

    function requestMedia(uint256 tokenId, string memory blob, bool isImage)
        external
        payable
        nonReentrant
        isSubscribed(tokenId, msg.sender)
    {
        if (isImage) {
            require(msg.value >= bots[tokenId].imagePrice, "you need to pay more");
        } else {
            require(msg.value >= bots[tokenId].imagePrice, "you need to pay more");
        }
        uint256 _tokenId = FanMedia(fanMediaAddress).mint(blob, msg.sender);
        (bool success,) = bots[tokenId].wallet.call{value: msg.value}("");
        require(success, "Failed to transfer eth");
    }

    function setPrices(uint256 tokenId, uint256 _subscriptionPrice, uint256 _imagePrice, uint256 _voicePrice)
        external
        onlyBot(tokenId, msg.sender)
    {
        bots[tokenId].subscriptionPrice = _subscriptionPrice;
        bots[tokenId].imagePrice = _imagePrice;
        bots[tokenId].voicePrice = _voicePrice;
    }

    function getBotWallets() external view returns (address[] memory) {
        uint256 numBots = FanMedia(fanMediaAddress).tokenId();
        address[] memory allBots = new address[](numBots);
        for (uint256 i = 0; i < numBots; i++) {
            allBots[i] = bots[i].wallet;
        }
        return allBots;
    }

    function getBotWallet(uint256 tokenId) external view returns (address) {
        return bots[tokenId].wallet;
    }

    function getSubscription(address user, uint256 tokenId) external view returns (bool) {
        return subscriptions[user][tokenId];
    }
}
