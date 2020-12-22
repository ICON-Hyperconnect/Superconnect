
const IconService = require('icon-sdk-js');
const {
  IconWallet,
  HttpProvider,
  IconBuilder,
  IconConverter,
  IconAmount,
  SignedTransaction
} = IconService;
const provider = new HttpProvider("https://bicon.net.solidwallet.io/api/v3");
const iconService = new IconService(provider);
const {
  IcxTransactionBuilder
} = IconBuilder;

// only needs to import the privatekey details. 
const wallet = IconWallet.loadPrivateKey("3a54cc040e4fda1c9c1bad60473b191d70a5673976d65d2b4700bf5ee24ab4f9")


async function getBalance() {
  try {
    const balance = await iconService.getBalance(wallet.getAddress()).execute();
    let result = balance["c"] / 10000
    return result

  } catch (err) {
    console.log(err)
  }
}

getBalance().then(result => { 
  console.log(result)
})
