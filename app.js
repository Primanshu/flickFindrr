
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
//
// **************************************************************************************************

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var request = require("request");

var options = {
  method: 'GET',
  url: 'https://imdb8.p.rapidapi.com/title/get-overview-details',
  qs: {currentCountry: 'US', tconst: 'tt4574334'},
  headers: {
    'x-rapidapi-host': 'imdb8.p.rapidapi.com',
    'x-rapidapi-key': '266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5', //use own key
    useQueryString: true
  }
};
// request(options, function (error, response, body) {
// 	if (error) throw new Error(error);
// const jsObj = JSON.parse(body);
// 	console.log(jsObj);
// });

var findTitle = {
  method: 'GET',
  url: 'https://imdb8.p.rapidapi.com/title/find',
  qs: {currentCountry: 'US', q: 'shubh mangal savdhan'},
  headers: {
    'x-rapidapi-host': 'imdb8.p.rapidapi.com',
    'x-rapidapi-key': '266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5', //use own key
    useQueryString: true
  }
};
// request(findTitle, function (error, response, body) {
// 	if (error) throw new Error(error);
//   const jsObj = JSON.parse(body);
// 	console.log(jsObj);
// });

app.get("/",function(req,res){
  // res.send("hattbc");
  res.render("home");
});

app.get("/signin",function(req,res){
  res.render("signin");
});

app.get("/toprated",function(req,res){
  res.render("toprated");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
