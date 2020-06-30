const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')

const userSchema = new mongoose.Schema({
  username : String,
  firstName : String,
  lastName : String,
  password : String,
  googleId : String,
  facebookId : String,
  wishList : [{
    titleId : String,
    title : String,
    rating : Number,
    url : String,
    synopsis : String
  }]
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
//User is a model having userSchema
module.exports = new mongoose.model('User',userSchema);
