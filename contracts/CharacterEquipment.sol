// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Characters.sol";
import "./Wearables.sol";

contract CharacterEquipment {
    Characters public characters;
    Wearables public wearables;

    mapping(uint characterId => mapping(uint wearableType => uint wearableId)) public characterEquipment;

    constructor(address charactersAddress, address wearablesAddress) {
        characters = Characters(charactersAddress);
        wearables = Wearables(wearablesAddress);
    }

    // Public functions

    function equip(uint characterId, uint wearableId) public {
        // TODO equip should rever if type doesn't match
        require(characters.ownerOf(characterId) == msg.sender, "Sender must be the character owner.");
        require(wearables.ownerOf(wearableId) == msg.sender, "Sender must be the wearable owner.");

        if(characterEquipment[characterId][wearables.getWearableType(wearableId)] != 0)
        {
            unequip(characterId, wearables.getWearableType(wearableId));
        }
    
        characterEquipment[characterId][wearables.getWearableType(wearableId)] = wearableId;
        wearables.transferFrom(msg.sender, address(this), wearableId);
    }

    function unequip(uint characterId, uint wearableType) public {
        require(characters.ownerOf(characterId) == msg.sender, "Sender must be the character owner.");
        uint wearableId = characterEquipment[characterId][wearableType];
        characterEquipment[characterId][wearableType] = 0;
        wearables.transferFrom(address(this), msg.sender, wearableId);
    }

    // View functions

    function getCharacterEquipment(uint characterId, uint wearableType) public view returns(uint) {
        return characterEquipment[characterId][wearableType];
    }

    function getCharacterLevel(uint characterId, uint wearableTypeAmount) public view returns(uint) {
        uint totalLevel;
        for(uint i=1; i<=wearableTypeAmount; i++)
        {
            totalLevel += wearables.getLevel(getCharacterEquipment(characterId, i));
        }
        return totalLevel;
    }
}