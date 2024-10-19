// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721URIStorage {
    uint256 public tokenId;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(string memory blob, address to) public returns (uint256) {
        uint256 _tokenId = tokenId;
        _mint(to, _tokenId);
        _setTokenURI(_tokenId, blob);
        tokenId++;
        return _tokenId;
    }
}
