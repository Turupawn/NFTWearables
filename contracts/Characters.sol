// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Characters is ERC721, ERC721Enumerable, Ownable {
    // Public variables
    uint public tokenCount;
    mapping(uint => uint) characterTypes;
    uint public characterTypeAmount = 4;

    // Internal variables
    uint randomNonce = 0;

    string public baseTokenURI = "http://localhost:3005/metadata/characters/";

    constructor() ERC721("Character", "CHAR") {}

    function mint(address to) public {
        _mint(to, tokenCount);
        characterTypes[tokenCount] = getRandomNumber(characterTypeAmount); 
        tokenCount  += 1;
    }

    // Public Functions

    function getCharacterType(uint characterId) public returns(uint) {
        return characterTypes[characterId];
    }

    // Owner Functions

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    function setCharacterTypeAmount(uint amount) public onlyOwner {
        characterTypeAmount = amount;
    }

    // Overrided functions

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint tokenId) internal override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    // Internal functions

    function getRandomNumber(uint modulus) internal returns(uint)
    {
        randomNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randomNonce))) % modulus;
    }
}