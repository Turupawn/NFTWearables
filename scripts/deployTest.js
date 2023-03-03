// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

async function main() {
  const [owner, account1, account2] = await ethers.getSigners();
  const Characters = await hre.ethers.getContractFactory("Characters");
  const Wearables = await hre.ethers.getContractFactory("Wearables");
  const CharacterEquipment = await hre.ethers.getContractFactory("CharacterEquipment");
  const Dungeons = await hre.ethers.getContractFactory("Dungeons");

  // Smart Contract Deploy
  const characters = await Characters.deploy();
  const wearables = await Wearables.deploy();
  const characterEquipment = await CharacterEquipment.deploy(characters.address, wearables.address);
  const dungeons = await Dungeons.deploy(characters.address, wearables.address, characterEquipment.address);

  console.log("Characters:          ", characters.address);
  console.log("Wearables:           ", wearables.address);
  console.log("Character equipment: ", characterEquipment.address);
  console.log("Dungeons:            ", dungeons.address);

  // Initial setup

  await wearables.setMinter(dungeons.address, true)

  // Game

  await characters.mint(owner.address)
  await characters.mint(owner.address)

  await dungeons.enterDungeon(0, 1);
  await time.increaseTo(1777820202);
  await dungeons.loot(0);
  await wearables.approve(characterEquipment.address, 1) 
  await characterEquipment.equip(0,1)
  await dungeons.enterDungeon(0, 2);
  await time.increaseTo(1877820202);
  await dungeons.loot(0);
  await wearables.approve(characterEquipment.address, 2) 
  await characterEquipment.equip(0,2)
  await dungeons.enterDungeon(0, 3);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
