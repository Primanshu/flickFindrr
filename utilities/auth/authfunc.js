module.exports = function(req, res, next) {
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
