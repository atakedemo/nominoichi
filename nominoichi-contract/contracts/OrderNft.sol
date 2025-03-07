// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract OrderNft is Initializable, ERC721Upgradeable {
    uint256 public tokenCounter;

    function initialize(string memory name, string memory symbol) public initializer {
        __ERC721_init(name, symbol);
        tokenCounter = 0;
    }

    function mint(address to) public returns (uint256) {
        uint256 tokenId = tokenCounter;
        _mint(to, tokenId);
        tokenCounter += 1;
        return tokenId;
    }
}