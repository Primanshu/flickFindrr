const passport = require('passport');
const path = require('path');
const User = require(path.join(__dirname,'../../schema/user'));
module.exports = function(req, res) {
  //registering user using passport-local-mongoose using LocalStrategy
  User.register({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.render("signup", {
        username: req.authCustom.username,
        auth: req.authCustom.auth,
        user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
        message:"username is already registered"
      });
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect('/');
      })
    }
  });
}
