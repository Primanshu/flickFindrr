module.exports = function(req, res) {
  //search in the db if this movie already exist in the wishList of the user
  if (req.isAuthenticated()) {
    let present = false;
    for (var i = 0; i < req.user.wishList.length; i++) {
      if (req.user.wishList[i].titleId == req.body.titleId) {
        present = true;
        const h = "This movie is already present in your Watch list";
        const pm = "Search for other movies with the help of search box provided above";
        res.render("respond", {
          h: h,
          pm: pm,
          auth: req.authCustom.auth,
          user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
          username: req.authCustom.username
        });
        break;
      }
    }
    if (present === false) {
      //i.e this movie isn't present in the wishList
      req.user.wishList.push({
        titleId: req.body.titleId,
        title: req.body.title,
        rating: req.body.rating,
        url: req.body.url,
        synopsis: req.body.synopsis
      });
      req.user.save();
      console.log(req.user);
      const h = "Movie Added To Your Watch List";
      const pm = "";
      res.render("respond", {
        h: h,
        pm: pm,
        auth: req.authCustom.auth,
        user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
        username: req.authCustom.username
      });
    }
  } else {
    const h = "Hi,You need to login first";
    const pm = "Click On 'Sign In' Provided In The Navigation Bar Above.";
    res.render("respond", {
      h: h,
      pm: pm,
      auth: req.authCustom.auth,
      user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
      username: req.authCustom.username
    });
  }
}
