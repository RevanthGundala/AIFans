// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SoulFan is ERC721URIStorage {
    uint256 public tokenId;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(string memory blob, address botWallet) public returns (uint256 _tokenId) {
        _tokenId = tokenId;
        _mint(botWallet, _tokenId);
        _setTokenURI(_tokenId, blob);
        tokenId++;
    }

    function _transfer() public pure {
        revert();
    }
}
