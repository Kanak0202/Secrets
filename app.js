//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require('md5');
// const encrypt = require("mongoose-encryption");
// const bcrypt = require('bcrypt');
var session = require('express-session');
var passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const saltRounds = 10;
const app = express();

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended :true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
const userSchema = new mongoose.Schema({
  email:String,
  password:String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret:secret, encryptedFields:["password"]});
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google",{scope: ['profile']}));

app.get("/auth/google/secrets",
passport.authenticate("google", {failureRedirect: '/login'}),
function(req,res){
  res.redirect("/");
});

app.get("/login", function(req, res){
  res.render("login");
});
app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.post("/register",function(req,res){
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash){
//     const newUser = new User({
//       email:req.body.username,
//       password: hash/*md5( req.body.password)*/
//     });
//     newUser.save(function(err){
//       if(err){
//         console.log(err);
//       }
//       else{
//         res.render("secrets");
//       }
//     });
//   });
User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }
  else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets");
    })
  }
})

});
app.post("/login", function(req,res){
  // const userName = req.body.username;
  // const password = req.body.password/*md5(req.body.password)*/;
  // User.findOne({email:userName}, function(err, foundUser){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     if(foundUser){
  //       /*if(foundUser.password === password){*/
  //       bcrypt.compare(password, foundUser.password, function(err, result){
  //         if(result==true){
  //             res.render("secrets");
  //         }
  //       });
  //
  //       }
  //     }
  // });
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});
app.listen(3000, function(){
  console.log("Server started at port 3000");
});
