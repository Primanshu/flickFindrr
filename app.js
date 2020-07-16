// **************************************************************************************************

// READ THIS FIRST
// uncomment for better reading
//
// 1. home.ejs is like a landing page with constant non changing links
// 2. top rated.ejs will use top rated api
// 3. search will use find api
// 4. sign in using local method or FB/Google oauth
// 5. each movie info is rendered on show.ejs
// 6. show.ejs has user review section
// 7. each user should have a watchlist(functioning like a todo list)
// 8. DATA COLLECTIONs :
//     - Schema for each movie/show to store comments and reviews
//     - UserSchema for storing user information
//     - UserSchema has subschema of ListSchema for watchlist
//
// Oauth cliedIDs
const gid = "548992362683-4jkdoc9o06vsec4vrt62tf4p1m84cvtu.apps.googleusercontent.com"
const gsecret = "9E-ViWLMyUUDgmQzmMf4kkCf"
//
const fsecret = "bf0b55c5d503d40b1661d94fb46ee512";
const fid = "360036008293149";
//
// **************************************************************************************************
const key1 = "266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5";
const key2 = "e7467cc8bemsh68aa412ff63270cp18e36djsn56e63391854d";
const key3 = "8f35c57ed6msh927808076ca59dbp15cf69jsnce65f6b039f7";
const key4 = "9a593801a7mshaf16c0b025b46f5p1929c2jsn8dff22f1fec8";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var $ = require('jquery');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const request = require("request");
const obj = require(__dirname + '/obj');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var jsalert = require('js-alert');
//console.log(obj);
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: "This is something",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/imdbDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const Comment = require(__dirname + '/schema/comment');
const User = require(__dirname + '/schema/user');

//Using passportJS for authentication creating Strategy and OAuth
//Here local Strategy is created using passport-local-mongoose package
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: gid,
    clientSecret: gsecret,
    callbackURL: "http://localhost:3000/auth/google/imdb-project",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(req, accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));
passport.use(new FacebookStrategy({
    clientID: fid,
    clientSecret: fsecret,
    callbackURL: "http://localhost:3000/auth/facebook/imdb-project"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({
      facebookId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));


const autherisationFunc = function(req, res, next) {
  req.authCustom = {};
  if (req.isAuthenticated()) {
    req.authCustom.auth = true;
    req.authCustom.username = req.user.username;
    req.authCustom.firstName = "";
    req.authCustom.lastName = "";
    if(!req.user.firstName){
     req.authCustom.firstName = "";
     req.authCustom.lastName = "";
   }else{
     req.authCustom.firstName = req.user.firstName;
     req.authCustom.lastName = req.user.lastName;
   }
   // console.log(req.authCustom,req.user);
  } else {
    req.authCustom.auth = false;
    req.authCustom.username = undefined;
  }
  next();
};
app.use(autherisationFunc);


app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  }));

app.get('/auth/google/imdb-project',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/facebook/imdb-project',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get("/", function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    res.render("home", {
      username: req.authCustom.username,
      auth: req.authCustom.auth,
      user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
    });
  }

});

app.post('/getUsername', function(req, res) {
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
})

app.get('/getUsername', function(req, res) {
  res.render('getUsername', {
    username: "undefined",
    auth: true,
    user:{firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
    message:undefined
  });
})

app.get("/signin", function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    res.render("signin", {
      username: req.authCustom.username,
      auth: req.authCustom.auth,
      user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
    });
  }

});

app.get("/signup", function(req, res) {
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

});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

var movieName = "";
app.get('/search', function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    if (movieName.length === 0) {
      const h = "Looks like you haven't searched for anything!";
      const pm = "Search for a movie/show in the search box provided above.";
      res.render("respond", {
        h: h,
        pm: pm,
        auth: req.authCustom.auth,
        user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
        username: req.authCustom.username
      });
    } else {
      var findTitle = {
        method: 'GET',
        url: 'https://imdb8.p.rapidapi.com/title/find',
        qs: {
          currentCountry: 'US',
          q: movieName
        },
        headers: {
          'x-rapidapi-host': 'imdb8.p.rapidapi.com',
          'x-rapidapi-key': key4, //use own key
          useQueryString: true
        }
      }
      movieName = "";
      //Now I have to send these results to search.ejs
      request(findTitle, function(error, response, body) {
        if (error) {
          console.log("dasfasfafsadgasgdasdg");
        };
        const jsObj = JSON.parse(body);

        console.log(jsObj);
        res.render("search", {
          results: jsObj.results,
          username: req.authCustom.username,
          auth: req.authCustom.auth,
          user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
        });
      });
    }
  }
});

app.get("/profile", function(req, res) {
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

});

app.get("/seewatchlist", function(req, res) {
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
        console.log(req.user.wishList);
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
});

app.get("/developers", function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    res.render("developers", {
      username: req.authCustom.username,
      auth: req.authCustom.auth,
      user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
    })
  }

});

app.get("/show/:id", function(req, res) {
  if (req.isAuthenticated() && !req.user.username) {
    res.redirect('/getUsername');
  } else {
    // res.render('show', obj);
    //there are nested requests 1)for overall show 2)crew of show 3)user reviews
    //REQUEST FOR OVERVIEW
    var options = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/get-overview-details',
      qs: {
        currentCountry: 'US',
        tconst: req.params.id
      },
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': key4, //use own key
        useQueryString: true
      }
    };

    request(options, function(error, response, showX) {
      if (error) {
        throw new Error(error);
      }

      try {

        const show = JSON.parse(showX);
        // console.log(show,"pppppppppppp");
        //console.log(typeof(show));
        //console.log(show);
        const title = show.title.title;
        let url = "Some constant failsafe url";
        if (show.title.image) {
          if (show.title.image.url) {
            url = show.title.image.url
          }
        }
        const genres = show.genres;
        const titleType = show.title.titleType;
        const year = show.title.year;
        let synopsis = "Synopsis not added";
        let rating = "Not Rated";
        let summary = "Summary not added";
        if (show.plotOutline) {
          synopsis = show.plotOutline.text;
        }
        if (show.ratings.rating) {
          rating = show.ratings.rating;
        }
        if (show.plotSummary) {
          summary = show.plotSummary.text;;
        }
        //console.log(title,url,genres,titleType,year,synopsis,rating,summary);

        //REQUEST FOR CREW
        var crewGet = {
          method: 'GET',
          url: 'https://imdb8.p.rapidapi.com/title/get-top-crew',
          qs: {
            tconst: req.params.id
          },
          headers: {
            'x-rapidapi-host': 'imdb8.p.rapidapi.com',
            'x-rapidapi-key': key4,
            useQueryString: true
          }
        };

        request(crewGet, function(error, response, crewX) {
          if (error) throw new Error(error);

          try {
            const crew = JSON.parse(crewX);
            //console.log(crew);
            let directors = "DDD";
            let writers = [];
            if (titleType == "movie") {
              directors = crew.directors;
              writers = crew.writers;
            } else if (titleType == "tvSeries") {
              const writersMain = crew.writers;
              writersMain.forEach(function(writerx) {
                if (writerx.job == "creator") {
                  writers.push(writerx);
                }
              });
            } else {
              directors = crew.directors;
              writers = crew.writers;
            }
            //console.log(directors,writers);

            //REQUEST for REVIEWS
            var rev = {
              method: 'GET',
              url: 'https://imdb8.p.rapidapi.com/title/get-user-reviews',
              qs: {
                tconst: req.params.id
              },
              headers: {
                'x-rapidapi-host': 'imdb8.p.rapidapi.com',
                'x-rapidapi-key': key4,
                useQueryString: true
              }
            };

            request(rev, function(error, response, revs) {
              if (error) throw new Error(error);

              try {
                const reviewsX = JSON.parse(revs);
                const reviews = reviewsX.reviews;
                //console.log(reviewsX);

                Comment.find({
                  titleId: req.params.id
                }, function(err, comments) {
                  if (!err) {
                    const finalObject = {
                      title: title,
                      titleId: req.params.id,
                      url: url,
                      genres: genres,
                      titleType: titleType,
                      year: year,
                      synopsis: synopsis,
                      rating: rating,
                      summary: summary,
                      writers: writers,
                      directors: directors,
                      reviews: reviews,
                      comments: comments,
                      username: req.authCustom.username, //current username of logged in account
                      auth: req.authCustom.auth,
                      user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
                    };
                    // console.log(finalObject);
                    // res.json(finalObject);
                    res.render('show', finalObject);
                  }
                })
                //console.log(revs);
              } catch (reviewserr) {
                console.log("review error !");
                console.log(reviewserr);
              }

            });
          } catch (directorserr) {
            console.log("directors error !");
            console.log(directorserr);
          }

        });
      } catch (showerr) {
        console.log("show error !");
        console.log(showerr);
      }
    });
  }
});

app.post("/updateWatchlist", function(req, res) {
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
});

app.post('/deleteComment', function(req, res) {
  if (req.isAuthenticated()) {
    const commentId = req.body.delete;
    Comment.deleteOne({
      username: req.user.username,
      _id: commentId
    }, function(err, response) {
      res.redirect('back');
    })
  }
});

app.post('/changeSettings', function(req, res) {
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

});

app.post("/changePassword", function(req, res) {
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
});

app.post('/register', function(req, res) {
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
});

app.post('/login', function(req, res) {
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
});
//removing from watch list
app.post("/remove", function(req, res) {
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
});
//searching Movies
app.post('/search', function(req, res) {
  movieName = req.body.movieName;
  console.log(movieName);
  res.redirect("/search");
});

app.post('/show/search', function(req, res) {
  movieName = req.body.movieName;
  console.log(movieName);
  res.redirect("/search");
});

io.on('connection', (socket) => {
  socket.on("new comment", function(newComment) { //adding new comment to database
    console.log(newComment);
    if (newComment.auth == 'false') { //checking if the user is authorised
      socket.emit("comment failed");
    } else {
      const d = new Date();
      const date = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      const comment = new Comment({ //creating new comment
        titleId: newComment.titleId,
        username: newComment.username,
        firstName:newComment.firstName,
        lastName:newComment.lastName,
        date: date,
        body: newComment.body,
        upvotes: {
          sum: 0,
          users: []
        }
      })
      comment.save(function(err) {
        if (err) {
          alert("Oops ! Could not post comment. Please try again.")
        } else {
          console.log("comment added");
          socket.emit("comment added", {
            titleId: newComment.titleId,
            username: newComment.username,
            firstName:newComment.firstName,
            lastName:newComment.lastName,
            date: date,
            body: newComment.body,
            upvotes: {
              sum: 0,
              users: []
            },
            _id: comment._id //passing id also becoz we need to render new comment with name as its id
          });
        }
      });
    }
  });

  socket.on("upvote", function(comment) {
    console.log(comment);
    Comment.findById(comment.commentId, function(err, foundComment) {
      if (!err) {
        //console.log(foundComment);
        var x = comment.username;
        const index = foundComment.upvotes.users.indexOf(comment.username); //
        if (index > -1) {
          // socket.emit("upvote exist"); if the upvote already exists by the username then nothing is done
        } else {
          foundComment.upvotes.users.push(x); //otherwise username is pushed
          foundComment.upvotes.sum += 1; //upvotes are incremented
          foundComment.save();
          socket.emit("upvote", comment);
        }
      }
    })
  });

  socket.on("downvote", function(comment) {
    console.log(comment);
    Comment.findById(comment.commentId, function(err, foundComment) {
      if (!err) {
        //console.log(foundComment);
        const index = foundComment.upvotes.users.indexOf(comment.username);
        if (index > -1) {
          foundComment.upvotes.users.splice(index, 1); //opposite logic to upvote io
          foundComment.upvotes.sum -= 1;
          foundComment.save();
          //console.log(foundComment);
          socket.emit("downvote", comment);
        }
      }
    })
  })
});

server.listen(3000, function() {
  console.log("Server started on port 3000");
});
