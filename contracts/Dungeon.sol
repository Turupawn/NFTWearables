// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./Characters.sol";

contract Dungeon {
    uint DUNGEON_SIZE = 3;
    Characters charactersContract;
    mapping(uint => Registration) registration;
    uint registrationCount;

    constructor(address charactersAddress)
    {
        charactersContract = Characters(charactersAddress);
    }

    struct Registration
    {
        uint tokenId;
        address owner;
        uint dungeonSize;
        uint currentPosition;
    }
    
    function register(uint tokenId) public {
        registration[registrationCount] = Registration(tokenId, msg.sender, DUNGEON_SIZE, 0);
        registrationCount += 1;
        charactersContract.transferFrom(msg.sender, address(this), tokenId);
    }

    function heal() public {

    }

    function advance() public{

    }
}