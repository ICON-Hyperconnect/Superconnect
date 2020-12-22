const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String, 
  twitterId: String,
  wallet: String,
  p_key: String,
  sent: Number,
  received: Number 
})

const User = mongoose.model('user', userSchema);

module.exports = User;
