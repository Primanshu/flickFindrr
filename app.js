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
// key1: 266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5
// key2: e7467cc8bemsh68aa412ff63270cp18e36djsn56e63391854d
// key3: 8f35c57ed6msh927808076ca59dbp15cf69jsnce65f6b039f7

// **************************************************************************************************

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var $ = require('jquery');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const request = require("request");
const obj = require(__dirname + '/obj');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//console.log(obj);
//Api keys
const key1= "266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5";
const key2= "e7467cc8bemsh68aa412ff63270cp18e36djsn56e63391854d";
const key3= "8f35c57ed6msh927808076ca59dbp15cf69jsnce65f6b039f7";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret : "this is something",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/imdbDB",{ useUnifiedTopology: true, useNewUrlParser: true} );
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex',true);

const Comment = require(__dirname + '/schema/comment');
const User = require(__dirname + '/schema/user');

//Using passportJS for authentication creating Strategy and OAuth
//Here local Strategy is created using passport-local-mongoose package
passport.use(User.createStrategy());
var isAuthenticated = false;
passport.serializeUser(function(user, done) {
  isAuthenticated = true;
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  isAuthenticated = false;
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


var options = {
  method: 'GET',
  url: 'https://raw.githubusercontent.com/RJrachit/IMDB-data/master/movie_of_the_week.json',
};
request(options, function (error, response, body) {
	if (error) throw new Error(error);
  const jsObj = JSON.parse(body);
	//console.log(jsObj);
});



app.get("/", function(req, res) {
  // res.send("hattbc");
  var username = '';
  var auth = 'false';
  if(req.user){
    username = req.user.username;
    auth = 'true';
  }
  res.render("home",{username:username,auth : auth});
});

app.get("/signin", function(req, res) {
  res.render("signin");
});

app.get("/toprated", function(req, res) {
  res.render("toprated");
});

var movieName = "";
app.get("/search", function(req, res) {
  if (movieName.length === 0) {
    res.write("<h1>Looks like you haven't searched for anything.</h1>");
    res.write("<p>Go back to search for a movie/show</p>");
    res.send();
  } else {
    var findTitle = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/find',
      qs: {
        currentCountry: 'US',
        q:movieName
      },
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': key2, //use own key
        useQueryString: true
      }
    }
    movieName = "";
    //Now I have to send these results to search.ejs
    request(findTitle, function(error, response, body) {
      if (error) throw new Error(error);
      const jsObj = JSON.parse(body);
      console.log(jsObj);
      res.render("search", {results: jsObj.results});
      // res.send("<h1>Figuring out</h1>")
    });
  }
});


app.get("/show/:id",function(req,res){
  var username = '';
  var auth = 'false';
  if(req.user){
    username = req.user.username;
    auth = 'true';
  }

  res.render('show',obj);
  //there are nested requests 1)for overall show 2)crew of show 3)user reviews
  //REQUEST FOR OVERVIEW
  // var options = {
  //   method: 'GET',
  //   url: 'https://imdb8.p.rapidapi.com/title/get-overview-details',
  //   qs: {currentCountry: 'US', tconst: req.params.id},
  //   headers: {
  //     'x-rapidapi-host': 'imdb8.p.rapidapi.com',
  //     'x-rapidapi-key': key2, //use own key
  //     useQueryString: true
  //   }
  // };
  //
  // request(options, function (error, response, showX) {
  // 	if (error){
  //      throw new Error(error);
  //   }
  //
  //   const show = JSON.parse(showX);
  //   //console.log(typeof(show));
  //   //console.log(show);
  //   const title = show.title.title;
  //   let url = "Some constant failsafe url";
  //   if(show.title.image){
  //     if(show.title.image.url){
  //       url = show.title.image.url
  //     }
  //   }
  //   const genres = show.genres;
  //   const titleType = show.title.titleType;
  //   const year = show.title.year;
  //   let synopsis = "Synopsis not added";
  //   let rating = "Not Rated";
  //   let summary = "Summary not added";
  //   if(show.plotOutline){
  //     synopsis = show.plotOutline.text;
  //   }
  //   if(show.ratings.canRate){
  //     rating = show.ratings.rating;
  //   }
  //   if(show.plotSummary){
  //     summary = show.plotSummary.text;;
  //   }
  //   //console.log(title,url,genres,titleType,year,synopsis,rating,summary);
  //
  //   //REQUEST FOR CREW
  //   var crewGet = {
  //   method: 'GET',
  //   url: 'https://imdb8.p.rapidapi.com/title/get-top-crew',
  //   qs: {tconst: req.params.id},
  //   headers: {
  //     'x-rapidapi-host': 'imdb8.p.rapidapi.com',
  //     'x-rapidapi-key': key2,
  //     useQueryString: true
  //   }
  // };
  //
  // request(crewGet, function (error, response, crewX) {
  // 	if (error) throw new Error(error);
  //
  //   const crew = JSON.parse(crewX);
  //   let directors = "DDD" ;
  //   let writers = [];
  // 	if(titleType == "movie"){
  //     directors = crew.directors;
  //     writers = crew.writers;
  //   }
  //   else if(titleType == "tvSeries"){
  //     const writersMain = crew.writers;
  //
  //     writersMain.forEach(function(writerx){
  //       if(writerx.job == "creator"){
  //         writers.push(writerx);
  //       }
  //     });
  //   }
  //
  //   //REQUEST for REVIEWS
  //   var rev = {
  //     method: 'GET',
  //     url: 'https://imdb8.p.rapidapi.com/title/get-user-reviews',
  //     qs: {tconst: req.params.id},
  //     headers: {
  //       'x-rapidapi-host': 'imdb8.p.rapidapi.com',
  //       'x-rapidapi-key': key2,
  //       useQueryString: true
  //     }
  //   };
  //
  //   request(rev, function (error, response, revs) {
  //   	if (error) throw new Error(error);
  //
  //     const reviewsX = JSON.parse(revs);
  //     const reviews = reviewsX.reviews;
  //     //console.log(reviewsX);
  //
  //     Comment.find({titleId : req.params.id},function(err,comments){
  //       if(!err){
  //         res.render('show',{
  //           title : title,
  //           titleId : req.params.id,
  //           url : url,
  //           genres : genres,
  //           titleType : titleType,
  //           year : year,
  //           synopsis : synopsis,
  //           rating : rating,
  //           summary : summary,
  //           writers : writers,
  //           directors : directors,
  //           reviews : reviews,
  //           comments : comments,
  //           username : username,
  //           auth : auth
  //         });
  //       }
  //     })
  //   	//console.log(revs);
  //   });
  // });
  // });
});

app.post('/comment',function(req,res){
  if(isAuthenticated()){

    const d = new Date();
    const date = d.toLocaleDateString("en-US",{month: "short",  day: "numeric"});

    const comment = new Comment({
      titleId : req.body.titleId,
      username : req.user.username,
      date : date,
      body : req.body.body,
      upvotes : 0,
      downvotes : 0
    })
    comment.save(function(err){
      if(err){
        alert("Oops ! Could not post commnet. Please try again.")
      }else{
        res.redirect('/show/'+req.body.titleId);
      }
    });

  }else{
    res.send("Please SignIn First !");
  }
});

app.post('/register',function(req,res){
  //registering user using passport-local-mongoose using LocalStrategy
  User.register({username : req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect('/signin');
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect('/');
      })
    }
  });
});

app.post('/login',function(req,res){

  const user = new User({
    username : req.body.username,
    password : req.body.password
  });
  //Logging in user using LocalStrategy by using passport-local-mongoose
  req.login(user,function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function(){

        res.redirect('/');
      });
    }
  });
});

//searching Movies
app.post("/search", function(req, res) {

  movieName = req.body.movieName;
  console.log(movieName);
  res.redirect("/search");
});

io.on('connection', (socket) => {
  socket.on("new comment",function(newComment){
    console.log(newComment);
    if(newComment.auth == 'false'){
      socket.emit("comment failed");
    }else{
      const d = new Date();
      const date = d.toLocaleDateString("en-US",{month: "short",  day: "numeric"});

      const comment = new Comment({
        titleId : newComment.titleId,
        username : newComment.username,
        date : date,
        body : newComment.body,
        upvotes : 0,
        downvotes : 0
      })
      comment.save(function(err){
        if(err){
          alert("Oops ! Could not post commnet. Please try again.")
        }else{
          // res.redirect('/show/'+req.body.titleId);
          console.log("comment added");
          socket.emit("comment added",{
            titleId : newComment.titleId,
            username : newComment.username,
            date : date,
            body : newComment.body,
            upvotes : 0,
            downvotes : 0
          });
        }
      });
    }




  })
});

server.listen(3000, function() {
  console.log("Server started on port 3000");
});
