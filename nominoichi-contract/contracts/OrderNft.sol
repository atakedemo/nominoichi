// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderNft is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    struct Product {
        uint256 tokenId;
        uint256 price; 
        uint8 status;
    }
    IERC20 public usdc;

    mapping(uint256 => Product) public products;
    mapping(uint256 => bool) public mintedTokens;

    //==========================
    //Logic
    //==========================
    function initialize(address usdcAddress) public initializer {
        __ERC721_init("OrderNft", "oNFT");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        usdc = IERC20(usdcAddress);
    }

    function mint(address to, uint256 tokenId) public returns (uint256) {
        uint256 _fee = products[tokenId].price;
        require(usdc.transferFrom(msg.sender, address(this), _fee), "USDC transfer failed");
        _safeMint(to, tokenId);
        return tokenId;
    }

    function withdraw(address to, uint256 amount) public onlyOwner {
        usdc.transferFrom(address(this), to, amount);
    }

    //==========================
    //Setter
    //==========================
    function setProduct(
        uint256 tokenId,
        uint256 price,
        uint8 status
    ) external onlyOwner{
        require(status < 3, "Invalid status");
        products[tokenId] = Product({
            tokenId: tokenId,
            price: price,
            status: status
        });
    }

    function setProductPrice(
        uint256 tokenId,
        uint256 price
    ) external onlyOwner{
        products[tokenId].price = price;
    }

    function setProductStatus(
        uint256 tokenId,
        uint8 status
    ) external onlyOwner{
         require(status < 3, "Invalid status");
        products[tokenId].status = status;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    //==========================
    //Getter
    //==========================
    function getProduct(
        uint256 tokenId
    ) external view returns (Product memory){
        return products[tokenId];
    }
}