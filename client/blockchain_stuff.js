const NETWORK_ID = 11155111

const CHARACTERS_ADDRESS = "0xbbAd0e891922A8A4a7e9c39d4cc0559117016fec"
const CHARACTERS_ABI_PATH = "./json_abi/Characters.json"
var characters

const WEARABLES_ADDRESS = "0x38E33D067F03a5cDc02C301b2c306cb0414549Bf"
const WEARABLES_ABI_PATH = "./json_abi/Wearables.json"
var wearables

const CHARACTER_EQUIPMENT_ADDRESS = "0xe7b82794Cab21e665a3e6f8ea562d392AA6E0619"
const CHARACTER_EQUIPMENT_ABI_PATH = "./json_abi/CharacterEquipment.json"
var characterEquipment

const DUNGEONS_ADDRESS = "0xd5dd33650Ef1DC6D23069aEDC8EAE87b0D3619B2"
const DUNGEONS_ABI_PATH = "./json_abi/Dungeons.json"
var dungeons

var accounts
var web3

function metamaskReloadCallback() {
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se cambió el account, refrescando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se el network, refrescando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Porfavor conéctate a Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3, address, abi_path) => {
  const response = await fetch(abi_path);
  const data = await response.json();
  
  const netId = await web3.eth.net.getId();
  contract = new web3.eth.Contract(
    data,
    address
    );
  return contract
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Please connect to Metamask"
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          characters = await getContract(web3, CHARACTERS_ADDRESS, CHARACTERS_ABI_PATH)
          wearables = await getContract(web3, WEARABLES_ADDRESS, WEARABLES_ABI_PATH)
          characterEquipment = await getContract(web3, CHARACTER_EQUIPMENT_ADDRESS, CHARACTER_EQUIPMENT_ABI_PATH)
          dungeons = await getContract(web3, DUNGEONS_ADDRESS, DUNGEONS_ABI_PATH)
          document.getElementById("web3_message").textContent="You are connected to Metamask"
          onContractInitCallback()
          web3.eth.getAccounts(function(err, _accounts){
            accounts = _accounts
            if (err != null)
            {
              console.error("An error occurred: "+err)
            } else if (accounts.length > 0)
            {
              onWalletConnectedCallback()
              document.getElementById("account_address").style.display = "block"
            } else
            {
              document.getElementById("connect_button").style.display = "block"
            }
          });
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Sepolia";
      }
    });
  };
  awaitWeb3();
}

async function connectWallet() {
  await window.ethereum.request({ method: "eth_requestAccounts" })
  accounts = await web3.eth.getAccounts()
  onWalletConnectedCallback()
}

loadDapp()

const onContractInitCallback = async () => {
  for(dungeonId=1; dungeonId<=4; dungeonId+=1)
  {
    dungeon = await dungeons.methods.dungeons(dungeonId).call()

    const dungeonText = document.createTextNode(
      "Dungeon " + dungeonId + " " +
      " duration: " + dungeon[0] +
      " minimum level: " + dungeon[1]
    );
    var dungeonsElement = document.getElementById("dungeonsElement");
    dungeonsElement.appendChild(dungeonText);
    dungeonsElement.appendChild(document.createElement("br"));
    probabilities = ""
    for(wearableId=1; wearableId<=8; wearableId++)
    {
      probability = await dungeons.methods.getDungeonLootProbability(dungeonId, wearableId).call()
      if(probability != 0)
      {
        probabilities += " wearable " + wearableId + " " + probability/100 + "%,"
      }
    }
    const dungeonProbabilitiesText = document.createTextNode(
      probabilities
    );
    dungeonsElement.appendChild(dungeonProbabilitiesText);
    dungeonsElement.appendChild(document.createElement("br"));
    let enterDungeonButton = document.createElement("button");
    enterDungeonButton.innerHTML = "Enter";
    enterDungeonButton.dungeonId = "" + dungeonId;
    enterDungeonButton.onclick = function (eventParam) {
      enterDungeon("1"/* TODO */, eventParam.srcElement.dungeonId)
    };
    let lootButton = document.createElement("button");
    lootButton.innerHTML = "Loot";
    lootButton.onclick = function () {
      loot("1"/* TODO */)
    };
    dungeonsElement.appendChild(enterDungeonButton);
    dungeonsElement.appendChild(lootButton);
    dungeonsElement.appendChild(document.createElement("br"));
    dungeonsElement.appendChild(document.createElement("br"));
  }
}


function onCharacterDataRetieved(tokenId, jsonMetadata)
{
  var span = document.createElement("span");
  span.innerHTML = tokenId
  var img = document.createElement("img");
  img.src = jsonMetadata["image"];
  img.setAttribute("style", "max-width: 250px;");

  var div = document.getElementById("characterImages");
  div.appendChild(span);
  div.appendChild(img);
  div.setAttribute("style", "text-align:center");

  const newOption = document.createElement('option');
  const optionText = document.createTextNode(tokenId);
  newOption.appendChild(optionText);
  newOption.setAttribute('value', tokenId);
  var characterSelect = document.getElementById("characterSelect");
  characterSelect.appendChild(newOption);
}

function addCharacterImage(tokenId, tokenURI)
{
  fetch(tokenURI)
  .then(res => res.json())
  .then(out =>
    onCharacterDataRetieved(tokenId, out))
  .catch();
}

function onWearableDataRetieved(tokenId, jsonMetadata)
{
  var span = document.createElement("span");
  span.innerHTML = tokenId
  var img = document.createElement("img");
  img.src = jsonMetadata["image"];
  img.setAttribute("style", "max-width: 250px;");

  var div = document.getElementById("wearableImages");
  div.appendChild(span);
  div.appendChild(img);
  div.setAttribute("style", "text-align:center");

  const newOption = document.createElement('option');
  const optionText = document.createTextNode(tokenId);
  newOption.appendChild(optionText);
  newOption.setAttribute('value', tokenId);
  var wearableSelect = document.getElementById("wearableSelect");
  wearableSelect.appendChild(newOption);
}

function addWearableImage(tokenId, tokenURI)
{
  console.log(tokenId)
  console.log(tokenURI)
  fetch(tokenURI)
  .then(res => res.json())
  .then(out =>
    onWearableDataRetieved(tokenId, out))
  .catch();
}

const onWalletConnectedCallback = async () => {
  accountCharacterBalance = await characters.methods.balanceOf(accounts[0]).call()
  accountWearableBalance = await wearables.methods.balanceOf(accounts[0]).call()
  
  accountCharacters = []
  accountCharactersURI = []
  for(i=0; i<accountCharacterBalance; i++)
  {
    let tokenId  = await characters.methods.tokenOfOwnerByIndex(accounts[0], i).call()
    let tokenURI = await characters.methods.tokenURI(tokenId).call()
    accountCharacters.push(tokenId)
    accountCharactersURI.push(tokenURI)
    addCharacterImage(tokenId,tokenURI)
  }

  let registration = await dungeons.methods.registration(accountCharacters[0]).call()
  characterStatus = ""
  if(registration.dungeonId != "0")
  {
    characterStatus = "Your character is currently at dungeon #" +
      + registration.dungeonId + ". " +
      "Come back at " + registration.advanceTimestamp
  } else
  {
    characterStatus = "Your character is ready to enter a dungeon."
  }
  document.getElementById("characterStatusElement").textContent = characterStatus;

  let characterLevel = await characterEquipment.methods.getCharacterLevel("1" /* TODO */, "2").call()
  document.getElementById("characterLevelElement").textContent = "Character Level: " + characterLevel;

  accountWearables = []
  accountWearablesURI = []
  for(i=0; i<accountWearableBalance; i++)
  {
    let tokenId  = await wearables.methods.tokenOfOwnerByIndex(accounts[0], i).call()
    let tokenURI = await wearables.methods.tokenURI(tokenId).call()
    accountWearables.push(tokenId)
    accountWearablesURI.push(tokenURI)
    addWearableImage(tokenId, tokenURI)
  }
}

//// Functions ////

const approve = async (wearableId) => {
  const result = await wearables.methods.approve(CHARACTER_EQUIPMENT_ADDRESS, wearableId)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Executing...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const mintCharacter = async (wearableId) => {
  const result = await characters.methods.mint(accounts[0])
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Executing...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const enterDungeon = async (characterId, dungeonId) => {
  const result = await dungeons.methods.enterDungeon(characterId, dungeonId)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Executing...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const loot = async (characterId) => {
  const result = await dungeons.methods.loot(characterId)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Executing...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const equip = async (characterId, wearableId) => {
  const result = await characterEquipment.methods.equip(characterId, wearableId)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Executing...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const unequip = async (characterId, wearableType) => {
  const result = await characterEquipment.methods.unequip(characterId, wearableType)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Executing...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

const updateMetadata = async (characterId) => {
  fetch("http://localhost:3005/update/" + characterId)
  .then(res => res.json())
  .then(out =>
    console.log(out))
  .catch();
}