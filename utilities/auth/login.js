const passport = require('passport');
const path = require('path');
const User = require(path.join(__dirname,'../../schema/user'));

module.exports = function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    method: "local"
  });
  //Logging in user using LocalStrategy by using passport-local-mongoose
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local",{ failureRedirect: '/signin' })(req, res, function() {
        // console.log(user);
        res.redirect('/');
      });
    }
  });
}
