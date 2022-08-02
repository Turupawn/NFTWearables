// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Characters.sol";
import "./Wearables.sol";

contract CharacterEquipment {
    Characters characters;
    Wearables wearables;

    mapping(uint => mapping(uint => uint)) characterEquipment; // [characterId][wearableType][wearableId]

    constructor(address charactersAddress, address wearablesAddress) {
        characters = Characters(charactersAddress);
        wearables = Wearables(wearablesAddress);
    }

    function equip(uint characterId, uint wearableId) public {
        require(characters.ownerOf(characterId) == msg.sender, "Sender must be the character owner.");
        require(wearables.ownerOf(wearableId) == msg.sender, "Sender must be the wearable owner.");

        if(wearables.ownerOf(characterEquipment[characterId][wearables.getWearableType(wearableId)]) == address(this))
        {
            unequip(characterId, wearables.getWearableType(wearableId));
        }
    
        characterEquipment[characterId][wearables.getWearableType(wearableId)] = wearableId;
        wearables.transferFrom(msg.sender, address(this), wearableId);
    }

    function unequip(uint characterId, uint wearableType) public {
        require(characters.ownerOf(characterId) == msg.sender, "Sender must be the character owner.");
        uint wearableId = characterEquipment[characterId][wearableType];
        wearables.transferFrom(address(this), msg.sender, wearableId);
    }
}