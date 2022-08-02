const NETWORK_ID = 5

const CHARACTERS_ADDRESS = "0x49f524BB56cB060A0Ae669fBF256156add74FE66"
const CHARACTERS_ABI_PATH = "./json_abi/Characters.json"
var characters

const WEARABLES_ADDRESS = "0xB856587fe1cbA8600F75F1b1176E44250B11C788"
const WEARABLES_ABI_PATH = "./json_abi/Wearables.json"
var wearables

const CHARACTER_EQUIPMENT_ADDRESS = "0xB5F4756Ef5BE714Bd35fCf976da52F1F7aD11f66"
const CHARACTER_EQUIPMENT_ABI_PATH = "./json_abi/CharacterEquipment.json"
var characterEquipment

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
        document.getElementById("web3_message").textContent="Please connect to Goerli";
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
}

function addCharacterImage(tokenId, tokenURI)
{
  var span = document.createElement("span");
  span.innerHTML = tokenId
  var img = document.createElement("img");
  img.src = tokenURI;
  img.setAttribute("style", "margin-top: 80px;");

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

function addWearableImage(tokenId, tokenURI)
{
  var span = document.createElement("span");
  span.innerHTML = tokenId
  var img = document.createElement("img");
  img.src = tokenURI;
  img.setAttribute("style", "margin-top: 80px;");

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

  console.log(accountCharacters)
  console.log(accountCharactersURI)
  console.log(accountWearables)
  console.log(accountWearablesURI)
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