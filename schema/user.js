const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username : String,
  password : String,
  wishList : [{
    titleId : String,
    title : String,
    rating : Number,
    url : String,
    synopsis : String
  }]
});
userSchema.plugin(passportLocalMongoose);
//User is a model having userSchema
module.exports = new mongoose.model('User',userSchema);
