module.exports = function(req, res) {
  if (req.isAuthenticated()) {
    if (req.body.newPass != req.body.confirmed) {
      const h = "Password Does not match";
      const pm = "Please Try Again!"
      res.render("respond", {
        h: h,
        pm: pm,
        username: req.authCustom.username,
          user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
        auth: req.authCustom.auth
      });
    } else {
      req.user.setPassword(req.body.confirmed, function() {
        req.user.save();
        // res.status(200).json({message: 'password reset successful'});
        res.redirect("/profile");
      });
    }
  }
}
