module.exports = function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    res.render("signup", {
      username: req.authCustom.username,
      auth: req.authCustom.auth,
      user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
      message:undefined
    });
  }

}
