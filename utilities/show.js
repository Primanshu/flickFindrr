const request = require('request');
const path = require('path');
const Comment = require(path.join(__dirname , '../schema/comment'));
module.exports = function(req, res) {
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
        'x-rapidapi-key': process.env.KEY4, //use own key
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
            'x-rapidapi-key': process.env.KEY4,
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
                'x-rapidapi-key': process.env.KEY4,
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
}
