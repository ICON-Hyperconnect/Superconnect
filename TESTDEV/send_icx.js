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

// variables include "from address" (wallet1). this is all stored within the mongoose database. 
// "to address" (wallet2)
// amount of icx to be transferred from wallet1 to wallet2
// always load with the private key
// make a separate storage with iconkeystore






const wallet = IconWallet.loadPrivateKey("1a5550e593f5de9bd690258ab05634dbca82ae7953e556883c83ddceea68221a")
const walletAddress = wallet.getAddress();

async function transferIcx() {
  try {
    const txObj = new IcxTransactionBuilder()
      .from(walletAddress)
      .to("hxf86cb5a057a003fb64d9c182942c04f334a961aa")
      .value(IconAmount.of(7, IconAmount.Unit.ICX).toLoop()) //retrieve from twitter stream
      .stepLimit(IconConverter.toBigNumber('2000000'))
      .nid(IconConverter.toBigNumber('3'))
      .nonce(IconConverter.toBigNumber(1))
      .version(IconConverter.toBigNumber('3'))
      .timestamp(new Date().getTime() * 1000)
      .build()

    const signedTransaction = new SignedTransaction(txObj, wallet);
    const txHash = await iconService.sendTransaction(signedTransaction).execute()
    console.log({
      txHash
    })

  } catch (err) {
    console.log({
      err
    })
  }
}
transferIcx()
