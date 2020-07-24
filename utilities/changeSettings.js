const path = require('path');
const User = require(path.join(__dirname,'../schema/user'));
const Comment = require(path.join(__dirname,'../schema/comment'));
module.exports = function(req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user._id).then(function(sanitizedUser) {
      if (sanitizedUser) {
        sanitizedUser.firstName = req.body.firstName;
        sanitizedUser.lastName = req.body.lastName;
        sanitizedUser.save();
        Comment.updateMany({
          username: sanitizedUser.username
        }, {
          firstName: sanitizedUser.firstName,
          lastName: sanitizedUser.lastName
        }, function(err, res) {
          if (err) {
            console.log(err);
          } else {
            console.log(res);
          }
        })
        res.redirect('/profile');
      } else {
        res.status(500).json({
          message: 'This user does not exist'
        });
      }
    }, function(err) {
      console.error(err);
    });
  }

}
