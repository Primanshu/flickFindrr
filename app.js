require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const $ = require('jquery');
const session = require('express-session');
const passport = require('passport');
const request = require("request");
// const obj = require(__dirname + '/obj');

const authfunc = require(__dirname + '/utilities/auth/authfunc');
const login = require(__dirname + '/utilities/auth/login');
const register = require(__dirname + '/utilities/auth/register');
const profile = require(__dirname + '/utilities/profile');
const watchlist = require(__dirname + '/utilities/watchlist');
const developers = require(__dirname + '/utilities/developers');
const signin = require(__dirname + '/utilities/signin');
const signup = require(__dirname + '/utilities/signup');
const show = require(__dirname + '/utilities/show');
const googleStrategy = require(__dirname + '/utilities/strategies/googleStrategy');
const fbStrategy = require(__dirname + '/utilities/strategies/fbStrategy');
const getUsername = require(__dirname + '/utilities/getUsername');
const updateWatchlist = require(__dirname + '/utilities/updateWatchlist');
const changeSettings = require(__dirname + '/utilities/changeSettings');
const changePassword = require(__dirname + '/utilities/changePassword');
const remove = require(__dirname + '/utilities/remove');
const socketio = require(__dirname + '/utilities/socketio');

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const jsalert = require('js-alert');
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

mongoose.connect("mongodb+srv://primanshu:"+process.env.MONGO_PASS+"@cluster0.15ion.mongodb.net/imdbDB?retryWrites=true&w=majority", {
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

passport.use(googleStrategy);
passport.use(fbStrategy);

app.use(authfunc);


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

app.post('/getUsername',getUsername);

app.get('/getUsername', function(req, res) {
  res.render('getUsername', {
    username: "undefined",
    auth: true,
    user:{firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
    message:undefined
  });
})

app.get("/signin", signin);

app.get("/signup", signup);

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
      movieName = "";
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
          'x-rapidapi-key': process.env.KEY4, //use own key
          useQueryString: true
        }
      }

      //Now I have to send these results to search.ejs
      request(findTitle, function(error, response, body) {
        if (error) {
          console.log(error);
        };
        const jsObj = JSON.parse(body);

        console.log(jsObj);
        if(typeof(jsObj.results) === 'undefined'){
          const h = "Sorry ! No result found for '"+movieName+" '";
          movieName = "";
          const pm = "Search for another movie/show in the search box provided above.";
          res.render("respond", {
            h: h,
            pm: pm,
            auth: req.authCustom.auth,
            user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
            username: req.authCustom.username
          });
        }else{
          movieName = "";
          res.render("search", {
            results: jsObj.results,
            username: req.authCustom.username,
            auth: req.authCustom.auth,
            user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
          });
        }
      });
    }
  }
});

app.get("/profile",profile);

app.get("/seewatchlist", watchlist);

app.get("/developers", developers);

app.get("/show/:id", show);

app.post("/updateWatchlist", updateWatchlist);

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

app.post('/changeSettings', changeSettings);

app.post("/changePassword", changePassword);

app.post('/register', register);

app.post('/login', login);
//removing from watch list
app.post("/remove", remove);
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

io.on('connection',  socketio);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


// app.listen(port, function() {
//   console.log("Server started successfully");
// });

server.listen(port, function() {
  console.log("Server started successfully");
});
