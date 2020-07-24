const path = require('path');
const User = require(path.join(__dirname,'../schema/user'));
const Comment = require(path.join(__dirname,'../schema/comment'));

module.exports = function(socket){
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
}
