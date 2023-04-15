// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Wearables is ERC721, ERC721Enumerable, Ownable {
    uint256 public tokenCount;
    mapping(uint wearableId => uint wearableType) public wearableTypes;
    mapping(uint wearableType => uint level) public wearableTypeLevel;
    mapping(address account => bool isMinter) public isMinter;

    string public baseTokenURI = "http://localhost:3005/metadata/wearables/";

    constructor() ERC721("My NFT", "MNFT") {
        wearableTypeLevel[1] = 2;
        wearableTypeLevel[2] = 8;
        wearableTypeLevel[3] = 5;
        wearableTypeLevel[4] = 10;
        wearableTypeLevel[5] = 10;
        wearableTypeLevel[6] = 15;
        wearableTypeLevel[7] = 25;
        wearableTypeLevel[8] = 50;
    }

    // Public functions

    function mint(address to, uint wearableType) public {
        require(isMinter[msg.sender], "Sender is not minter");
        tokenCount += 1; // Token 0 is invalid
        _mint(to, tokenCount);
        wearableTypes[tokenCount] = wearableType;
    }

    // Owner Functions

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    function setWearableTypeLevel(uint wearableType, uint level) public onlyOwner {
        wearableTypeLevel[wearableType] = level;
    }

    function setMinter(address address_, bool value) public onlyOwner {
        isMinter[address_] = value;
    }

    // Overrided functions

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    // View functions

    function getLevel(uint wearableId) public view returns(uint) {
        return wearableTypeLevel[wearableTypes[wearableId]];
    }

    function getWearableType(uint wearableId) public view returns(uint) {
        return wearableTypes[wearableId];
    }
}