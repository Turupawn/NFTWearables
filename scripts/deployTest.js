// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [owner, account1, account2] = await ethers.getSigners();
  const Characters = await hre.ethers.getContractFactory("Characters");
  const Wearables = await hre.ethers.getContractFactory("Wearables");
  const CharacterEquipment = await hre.ethers.getContractFactory("CharacterEquipment");
  const characters = await Characters.deploy();
  const wearables = await Wearables.deploy();
  const characterEquipment = await CharacterEquipment.deploy(characters.address, wearables.address);

  console.log("Characters:          ", characters.address);
  console.log("Wearables:           ", wearables.address);
  console.log("Character equipment: ", characterEquipment.address);

  await characters.mint(owner.address)
  await characters.mint(owner.address)
  await wearables.mint(owner.address, "1")
  await wearables.mint(owner.address, "2")
  await wearables.mint(owner.address, "1")
  await wearables.mint(owner.address, "2")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
