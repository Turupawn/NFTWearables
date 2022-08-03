// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Wearables is ERC721, ERC721Enumerable, Ownable {
    uint256 tokenCount;
    mapping(uint => uint) wearableTypes;

    string public baseTokenURI = "http://localhost:3005/metadata/wearables/";

    constructor() ERC721("My NFT", "MNFT") {}

    // Public functions

    function mint(address to, uint wearableType) public {
        tokenCount += 1; // Token 0 is invalid
        _mint(to, tokenCount);
        wearableTypes[tokenCount] = wearableType;
    }

    function getWearableType(uint tokenId) public view returns(uint) {
        return wearableTypes[tokenId];
    }

    // Admin Functions

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    // Overrided functions

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
}