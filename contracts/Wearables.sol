// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Wearables is ERC721, ERC721Enumerable {
    uint256 tokenCount;
    mapping(uint => uint) wearableTypes;

    constructor() ERC721("My NFT", "MNFT") {}

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return "https://ipfs.io/ipfs/TUHASHAQUI";
    }

    function mint(address to, uint wearableType) public {
        _mint(to, tokenCount);
        wearableTypes[tokenCount] = wearableType;
        tokenCount += 1;
    }

    function getWearableType(uint tokenId) public view returns(uint) {
        return wearableTypes[tokenId];
    }

    // Enumerable requirements

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}