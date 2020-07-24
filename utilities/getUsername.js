const path = require('path');
const User = require(path.join(__dirname,'../schema/user'));
module.exports = function(req, res) {
  const username = req.body.newUsername;
  User.find({
    username: username
  }, function(err, user) {
    if (!err) {
      if (user.length != 0) {
        console.log(user);
        res.render('getUsername', {
          username: "undefined",
          auth: true,
          user:{firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
          message:"username is already registered"
        });
      } else {
        req.user.username = username;
        req.user.save();
        res.redirect('/profile');
      }
    }
  })
}
