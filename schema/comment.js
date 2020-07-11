const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  titleId: String,
  firstName: String,
  lastName: String,
  username: String,
  date: String,
  body: String,
  upvotes: {
    sum: Number,
    users: [String]
  }
})

module.exports = new mongoose.model("Comment", schema);
