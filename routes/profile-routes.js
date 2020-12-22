const router = require('express').Router();
const mongoose = require('mongoose');
const IconService = require('icon-sdk-js');
const keys=require('../config/keys')
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

const authCheck = (req, res, next) => { 
  if (!req.user) {
    res.redirect('/auth/login');
  } else {
    next()
  }
}


router.get('/', (req, res) =>
{  
  const wallet = IconWallet.loadPrivateKey(req.user.p_key)
  async function getBalance() {
    try {
      const balance = await iconService.getBalance(wallet.getAddress()).execute();
      let result = balance["c"] / 10000
      return result

    } catch (err) {
      console.log(err)
    }
  }

  getBalance().then((result) => { res.render('profile', { user: req.user, balance: result}) })
  
 
 
})

// this handles the post request i.e. on-site icx transaction 
router.post('/', (req, res) => {
  const wallet = IconWallet.loadPrivateKey("3a54cc040e4fda1c9c1bad60473b191d70a5673976d65d2b4700bf5ee24ab4f9")
  const walletAddress = wallet.getAddress();

    const transaction = new Transaction({
      address: req.body.address.toString(),
      amount: req.body.amount.toString()
    })
  
  transaction.save()
  
  transferIcx().then((hash) => {
    setTimeout(() => {

      res.redirect(`https://bicon.tracker.solidwallet.io/transaction/${hash}/`)
      
    }, 7000);
    //console.log(`https://bicon.tracker.solidwallet.io/transaction/${hash}`)
    
  })
    


    async function transferIcx() {
      try {
        const txObj = new IcxTransactionBuilder()
          .from(walletAddress)
          .to(transaction.address)
          .value(IconAmount.of(transaction.amount, IconAmount.Unit.ICX).toLoop()) //retrieve from twitter stream
          .stepLimit(IconConverter.toBigNumber('2000000'))
          .nid(IconConverter.toBigNumber('3'))
          .nonce(IconConverter.toBigNumber(1))
          .version(IconConverter.toBigNumber('3'))
          .timestamp(new Date().getTime() * 1000)
          .build()

        const signedTransaction = new SignedTransaction(txObj, wallet);
        const txHash = await iconService.sendTransaction(signedTransaction).execute()
        return txHash
      } catch (err) {
        console.log({
          err
        })
      }
    }
  
  
    

})




module.exports = router;