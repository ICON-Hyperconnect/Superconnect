const Twit = require('twit');
const User = require('./models/user-models');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const Transaction = require('./models/transaction-models');
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
  track: "@superconnecticx"// this could be set as a variable to take in numbers
})
  stream.on('tweet', function (tweet) {
    let sender_id = tweet.user.id_str
    let sender_name = tweet.user.screen_name
    let receiver_id = tweet.in_reply_to_user_id_str
    let receiver_name = tweet.in_reply_to_screen_name

    let content = tweet.text.split(" ")




    if (sender_id !== receiver_id && content[0] !== "RT" && content[0] !== "@superconnecticx") {

      let regex = /([+]\d+)/
      let regex2 = /(\d+)/
      let index = content.indexOf("@superconnecticx") - 1
      let amount = content[index].match(regex)[0]
      let icx_amount = amount.match(regex2)[0]



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
            return txHash 

          } catch (err) {
            console.log(err)
          }
        }

        transferIcx().then((result) => {
        if (result) {

          new Transaction({
            sender: sender_add,
            send_name: sender_name,
            receiver: receiver_add,
            receive_name: receiver_name,
            amount: icx_amount,
            created: new Date()
          }).save().then(() => {
            console.log('successfully transfered')
            Promise.all([User.updateOne({
                wallet: sender_add
              }, {
                $inc: {
                  sent: icx_amount
                }
              }, function (err, rawResponse) {
                if (err) {
                  console.log(err)
                  process.exit(2)
                }
              }),

              User.updateOne({
                wallet: receiver_add
              }, {
                $inc: {
                  received: icx_amount
                }
              }, function (err, rawResponse) {
                if (err) {
                  console.log(err)
                  process.exit(2)
                }
              })
            ])
          })


        } else {
          console.log('transaction unsuccessful')
        }

        })

        })
    } else {
      console.log("Invalid access entry")
    }
  })


  