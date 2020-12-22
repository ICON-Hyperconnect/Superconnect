const Twit = require('twit');
const User = require('../models/user-models');
const mongoose = require('mongoose');
const keys = require('../config/keys');
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


const T = new Twit({
  consumer_key: keys.tstream.consumer_key,
  consumer_secret: keys.tstream.consumer_secret,
  access_token: keys.tstream.access_token,
  access_token_secret: keys.tstream.access_token_secret

})
mongoose.connect(keys.mongodb.dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('mongo connected')
  }
});


let stream = T.stream('statuses/filter', {
  track: "@superconnecticx" // this could be set as a variable to take in numbers
})
stream.on('tweet', function (tweet) {

  let sender_id = tweet.user.id_str
  let receiver_id = tweet.in_reply_to_user_id_str
  let content = tweet.text.split(" ")
  console.log(content)



  if (sender_id !== receiver_id && content[0] !== "RT" && content[0] !== "@superconnecticx") {
    let regex = /([+]\d+)/
    let regex2 = /(\d+)/
    let index = content.indexOf("@superconnecticx") - 1
    let amount = content[index].match(regex)[0]
    let icx_amount = amount.match(regex2)[0]
    console.log(index)
    console.log(icx_amount)

    Promise.all([
      User.find({
        twitterId: sender_id
      }),
      User.find({
        twitterId: receiver_id
      })
    ]).then(([sender, receiver]) => {

      let sender_add = sender[0].wallet
      let sender_key = sender[0].p_key
      let receiver_add = receiver[0].wallet

      const wallet = IconWallet.loadPrivateKey(sender_key)
      async function transferIcx() {
        try {
          const txObj = new IcxTransactionBuilder()
            .from(sender_add)
            .to(receiver_add)
            .value(IconAmount.of(icx_amount, IconAmount.Unit.ICX).toLoop()) //retrieve from twitter stream
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
    });


  } else {
    console.log("Invalid access entry")
  }
})