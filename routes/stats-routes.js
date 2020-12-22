 const router = require('express').Router();
const mongoose = require('mongoose');
const keys = require('../config/keys');
const Transaction = require('../models/transaction-models');
const User = require('../models/user-models');


router.get('/', (req, res) => {
  Transaction.find({}, function (err, data) { 
    if (!err) {
      //data.forEach(function (dat) { 
      //  let sender = dat.sender
      //  let receiver = dat.receiver
      //  User.find({
      //    
      //  })
      //})

      res.render('stats', { transactions: data, user:req.user })
    } else { 
      console.log(err)
      res.send(500).status
    }
  })
    //.find()
    //.then(transactions => { 
    //  res.json(transactions)
    //  // we need to loop through the function using for each
    //  // to access each individual transactions 
    //  
    //})
  //
    //})
//    
//res.render('stats', {
//    user: req.user, transaction: req.transaction
//  })
})


module.exports = router

