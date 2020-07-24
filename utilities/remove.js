module.exports = function(req, res) {
  if (req.user) {
    //search the wishlist of the user
    let indx = -1;
    for (var i = 0; i < req.user.wishList.length; i++) {
      if (req.user.wishList[i].titleId == req.body.id) {
        indx = i;
        break;
      }
    }
    req.user.wishList.splice(indx, 1);
    req.user.save();
    res.redirect("/seewatchlist");
  } else {
    const h = "You need to log in first!"
    const pm = "";
    res.render("respond", {
      h: h,
      pm: pm,
      username: req.authCustom.username,
      auth: req.authCustom.auth
    });
  }
}
