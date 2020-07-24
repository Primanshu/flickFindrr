module.exports = function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    if (req.isAuthenticated()) {
      // console.log(req.user);
      res.render("profile", {
        username: req.authCustom.username,
        auth: req.authCustom.auth,
        user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
      });
    } else {
      const h = "You need to log in to your account first!"
      const pm = "Click On 'Sign in' provided In Navigation Bar";
      res.render("respond", {
        h: h,
        pm: pm,
        auth: req.authCustom.auth,
        user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
      })
    }
  }
}
