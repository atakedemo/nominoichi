// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPermit} from "./interfaces/IPermit.sol";

contract OrderToken is Initializable, ERC1155Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    event Error(bytes errMessage);
    event Permit(address owner, address spender, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s);
    event Purchase(address consumer, uint256[] tokenIds, uint256[] amounts, uint256 feeTotal);

    struct Product {
        uint256 tokenId;
        uint256 price; 
        uint256 stock; 
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
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        usdcAddress = tAddress;
    }

    function purchase(
        uint256[] memory tokenIds, 
        uint256[] memory amounts, 
        uint256 permitFee,
        uint256 deadline, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) public returns (uint256) {
        uint256 _feeTotal = 0;
        for (uint256 i = 0; i < tokenIds.length; ++i) {
            uint256 _id = tokenIds[i];
            uint256 _fee = products[_id].price;
            _feeTotal += _fee;

            address _owner = products[_id].owner;
            withdrawableFee[_owner] += _fee;
        }
        
        IPermit permitToken = IPermit(usdcAddress);
        try permitToken.permit(msg.sender, address(this), permitFee, deadline, v, r, s) {
            _mintBatch(msg.sender, tokenIds, amounts, '0x0');
            IERC20 usdc = IERC20(usdcAddress);
            usdc.transferFrom(msg.sender, address(this), _feeTotal);
            emit Purchase(msg.sender, tokenIds, amounts, _feeTotal);
            
            return _feeTotal;
        } catch (bytes memory errMessage) {
            emit Permit(msg.sender, address(this), _feeTotal, deadline, v, r, s);
            emit Error(errMessage);
            return 0;
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
        uint256 stock,
        uint8 status
    ) external onlyOwner{
        require(status < 3, "Invalid status");
        products[tokenId] = Product({
            tokenId: tokenId,
            price: price,
            stock: stock,
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

    function updateStatus(
        uint256 tokenId,
        uint8 status
    ) external {
        address _owner = products[tokenId].owner;
        require(status < 3, "Invalid status");
        require(msg.sender == _owner, "You are not owner");
        products[tokenId].status = status;
    }

    function addStock(
        uint256 tokenId,
        uint256 amount
    ) external {
        address _owner = products[tokenId].owner;
        require(msg.sender == _owner, "You are not owner");
        products[tokenId].stock += amount;
    }

    function reduceStock(
        uint256 tokenId,
        uint256 amount
    ) external {
        address _owner = products[tokenId].owner;
        uint256 _stock = products[tokenId].stock;
        require(msg.sender == _owner, "You are not owner");
        require(_stock - amount >= 0, "Stock is too low");
        products[tokenId].stock -= amount;
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