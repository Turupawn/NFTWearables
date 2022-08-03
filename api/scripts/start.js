var MAX_SUPPLY = 99999999
const CHARACTERS_ADDRESS = "0x98b25433c945cC23Ace8Bf8efc31B7a09b4Af946"
const WEARABLES_ADDRESS = "0x1d420BB5674Faaf0F14b6F23650bf616AE2d32b9"
const CHARACTER_EQUIPMENT_ADDRESS = "0x5989F08f81C489D3E7e4A797d5D35De059f7c75c"

const PORT = 3005
const IS_REVEALED = true
const UNREVEALED_METADATA = {
  "name":"Unrevealed Croc",
  "description":"???",
  "image":"http://134.209.33.178:3000/unrevealed/image.png",
  "attributes":[{"???":"???"}]
}

const fs = require('fs')
const express = require('express')
var cors = require('cors');
const Web3 = require('web3')
require('dotenv').config()
const charactersABI = require('../json_abi/Characters.json')
const wearablesABI = require('../json_abi/Wearables.json')
const characterEquipmentABI = require('../json_abi/CharacterEquipment.json')
const Contract = require('web3-eth-contract')
Contract.setProvider(process.env.RPC_URL)
const charactersContract = new Contract(charactersABI, CHARACTERS_ADDRESS)
const wearablesContract = new Contract(wearablesABI, WEARABLES_ADDRESS)
const characterEquipmentContract = new Contract(characterEquipmentABI, CHARACTER_EQUIPMENT_ADDRESS)
var images = require("images")

const app = express()
app.use(cors());

app.use(express.static('images'))
app.use('/unrevealed', express.static(__dirname + '/unrevealed'));

async function initAPI() {
  //MAX_SUPPLY = parseInt(await contract.methods.MAX_SUPPLY().call())
  console.log("MAX_SUPPLY is: " + MAX_SUPPLY)
  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
  })
}

async function serveMetadataCharacters(res, nft_id) {
  var token_count = parseInt(await charactersContract.methods.totalSupply().call())
  let return_value = {}
  if(nft_id < 0)
  {
    return_value = {error: "NFT ID must be greater than 0"}
  }
  else if(nft_id >= MAX_SUPPLY)
  {
    return_value = {error: "NFT ID must be lesser than max supply"}
  }else if (nft_id >= token_count)
  {
    return_value = {error: "NFT ID must be already minted"}
  }else
  {
    return_value = fs.readFileSync("./metadata/characters/" + nft_id).toString().trim()
  }
  res.send(return_value)
}

async function serveMetadataWearables(res, nft_id) {
  var token_count = parseInt(await wearablesContract.methods.totalSupply().call())
  let return_value = {}
  if(nft_id < 0)
  {
    return_value = {error: "NFT ID must be greater than 0"}
  }else if(nft_id >= MAX_SUPPLY)
  {
    return_value = {error: "NFT ID must be lesser than max supply"}
  }
  /*
  else if (nft_id >= token_count)
  {
    return_value = {error: "NFT ID must be already minted"}
  }
  */
  else
  {
    return_value = fs.readFileSync("./metadata/wearables/" + nft_id).toString().trim()
  }
  res.send(return_value)
}

app.get('/metadata/characters/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if(isNaN(req.params.id))//in not number
  {
    res.send(UNREVEALED_METADATA)    
  }
  else if(!IS_REVEALED)
  {
    res.send(
      )
  }else
  {
    serveMetadataCharacters(res, req.params.id)
  }
})

app.get('/metadata/wearables/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if(isNaN(req.params.id))//in not number
  {
    res.send(UNREVEALED_METADATA)    
  }
  else if(!IS_REVEALED)
  {
    res.send(
      )
  }else
  {
    serveMetadataWearables(res, req.params.id)
  }
})

async function updateMetadata(res, characterId) {
  var shieldEquipmentId = parseInt(await characterEquipmentContract.methods.getCharacterEquipment(characterId, "1").call());
  var swordEquipmentId = parseInt(await characterEquipmentContract.methods.getCharacterEquipment(characterId, "2").call());

  console.log("==============")
  console.log("Character: " + characterId)
  console.log("Shield:    " + shieldEquipmentId)
  console.log("Sword:     " + swordEquipmentId)
  console.log("==============")
  // Reset uhm
  mergeImages("./images/charactersOriginal/" + characterId + ".png",
  "./images/charactersOriginal/" + characterId + ".png",
  "./images/charactersEquiped/" + characterId + ".png")

  if(shieldEquipmentId != "0")
  {
    mergeImages("./images/charactersOriginal/" + characterId + ".png",
      "./images/wearables/" + shieldEquipmentId + ".png",
      "./images/charactersEquiped/" + characterId + ".png")
  }
  if(swordEquipmentId != "0")
  {
    mergeImages("./images/charactersEquiped/" + characterId + ".png",
      "./images/wearables/" + swordEquipmentId + ".png",
      "./images/charactersEquiped/" + characterId + ".png")
  }

  if(shieldEquipmentId)

  res.setHeader('Content-Type', 'application/json');
  res.send({result: "Updated stuff"})
}

async function mergeImages(imageA, imageB, destination) {
  images(imageA).
    draw(images(imageB), 0, 0).
    save(destination);
}

app.get('/update/:id', (req, res) => {
  updateMetadata(res, req.params.id)
})

initAPI()
