const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  titleId : String,
  username : String,
  date : String,
  body : String,
  upvotes : Number,
  downvotes : Number
})

module.exports = new mongoose.model("Comment",schema);
