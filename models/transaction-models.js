const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const transactionSchema = new Schema({
  sender: String, 
  send_name:String,
  receiver: String,
  receive_name: String, 
  amount: String, 
  created: String
})

const Transaction = mongoose.model('transaction', transactionSchema);
module.exports = Transaction;