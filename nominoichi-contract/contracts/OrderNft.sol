// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPermit} from "./interfaces/IPermit.sol";

contract OrderNft is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    event Error(bytes errMessage);
    event Permit(address owner, address spender, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s);
    struct Product {
        uint256 tokenId;
        uint256 price; 
        uint8 status;
        address owner;
    }
    address public usdcAddress;

    mapping(uint256 => Product) public products;
    mapping(uint256 => bool) public mintedTokens;
    mapping(address => uint256) public withdrawableFee;

    //==========================
    //Logic
    //==========================
    function initialize(address tAddress) public initializer {
        __ERC721_init("OrderNft", "oNFT");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        usdcAddress = tAddress;
    }

    function purchase(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public returns (uint256) {
        uint256 _fee = products[tokenId].price;
        address _owner = products[tokenId].owner;
        IPermit permitToken = IPermit(usdcAddress);
        try permitToken.permit(msg.sender, address(this), _fee, deadline, v, r, s) {
            _safeMint(msg.sender, tokenId);
            IERC20 usdc = IERC20(usdcAddress);
            usdc.transferFrom(msg.sender, address(this), _fee);
            withdrawableFee[_owner] += _fee;
            return tokenId;
        } catch (bytes memory errMessage) {
            emit Permit(msg.sender, address(this), _fee, deadline, v, r, s);
            emit Error(errMessage);
        }
    }

    function withdrawFee(address to, uint256 amount) public {
        require(withdrawableFee[to] < amount, 'Withdrawable amount is too high');
        IERC20 permitToken = IERC20(usdcAddress);
        permitToken.transfer(to, amount);
    }

    receive() external payable {}

    //==========================
    //Setter
    //==========================
    function listProduct(
        uint256 tokenId,
        uint256 price,
        uint8 status
    ) external onlyOwner{
        require(status < 3, "Invalid status");
        products[tokenId] = Product({
            tokenId: tokenId,
            price: price,
            status: status,
            owner: msg.sender
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