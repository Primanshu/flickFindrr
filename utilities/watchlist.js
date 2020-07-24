module.exports = function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    //access the database
    if (req.isAuthenticated()) {
      if (req.user.wishList.length === 0) {
        const h = "Your watch list is currently empty.";
        const pm = "Search for some movies to add them into your watch list"
        res.render("respond", {
          h: h,
          pm: pm,
          username: req.authCustom.username,
          auth: req.authCustom.auth,
          user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
        })
      } else {
        res.render("watchlist", {
          watchList: req.user.wishList,
          username: req.authCustom.username,
          auth: req.authCustom.auth,
          user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
        });
      }
    } else {
      res.redirect("/signin");
    }
  }
}
