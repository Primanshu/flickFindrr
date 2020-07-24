require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const path = require('path');
const User = require(path.join(__dirname,'../../schema/user'));

module.exports = new FacebookStrategy({
    clientID: process.env.FID,
    clientSecret: process.env.FSECRET,
    callbackURL: "https://flickfindrr.herokuapp.com/auth/facebook/imdb-project"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({
      facebookId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
)
