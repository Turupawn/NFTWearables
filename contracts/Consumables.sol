// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Items is ERC1155 {
    constructor() ERC1155("https://MIURL/{id}.json") {
    }

    function mint(address to, uint tokenId, uint amount) public
    {
        _mint(to, tokenId, amount, "");
    }
}