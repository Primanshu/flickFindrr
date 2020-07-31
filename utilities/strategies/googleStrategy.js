require('dotenv').config()
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const path = require('path');
const User = require(path.join(__dirname,'../../schema/user'));

module.exports = new GoogleStrategy({
    clientID: process.env.GID,
    clientSecret: process.env.GSECRET,
    callbackURL: "https://flickfindrr.herokuapp.com/auth/google/imdb-project",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(req, accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
)
// https://flickfindrr.herokuapp.com/auth/google/imdb-project
// http://localhost:3000/auth/google/imdb-project
