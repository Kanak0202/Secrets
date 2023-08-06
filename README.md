# Secrets
Level 1- Register users with Username and Password
- We will have to store username and password
- Connect with mongoDB using mongoose 

Level 2- Database encryption
- Caeser Cipher---> Used to encrypt messeges - crypti.com
- npm package ----> mongoose-encryption ---> Uses a modern encryption algorithm AES
- This package does 2 things...it can encrypt and it can authenticate
- Install the package
- read mongoose-encryption documentation
- Read mongoose plugins - plugins are bits of extra package piece of code that you can add to give more functionality or give more powers
- We need to encrypt only the password ----> add ::: encryptedFields: ['password']
- mongoose encrypt encrypts when you call save and decrypts when you call find

Using Environment Variables to Keep Secrets Safe (381)
- keep your api keys and secrets off the internet
- Environment variables- A simple file that we will keep certain sensitive variables such as encryption keys and api keys
- Use package dotenv---> 
- Install the package
- require it
- Create a .env file in the root directory
- Define environment variables  in .env file
- While committing the entire project---> touch gitignore //git ignore .env file
- Also we don't commit node modules folder as it is a very large  folder
- It is very important that the first thing you do while starting a new project is to incorporate your env, create .env file and as you create anything secure incorporate in that file, create a gitignore file and push to github

Level 3- Hashing passwords (382)
- Password + Key ---->(using cipher method) Cipher Text  
- Hashing ---> No need for encryption key
- To decrypt---> We don't
- Password --> (Hash Function) Hash
- Hash Functions---> Mathematical equations designed to make it almost impossible to go back and convert into a password
- We first convert out password into a hash then store that hash into the database
- During login we again hash the password and if the two hashes match then the user gets logged in
- Install md5 ---> An algorithm producing hash function
- require it
- When you run a hash function the hash that is created on the same string will be the same

Hacking 101
- Same password--->Same hash
- Hackers can construct a hash table then can compare the hash value of the users to guess the passwords

Level 4 - Salting and Hashing Passwords with bcrypt
- Salting ---> Salt is a random number added to the password and then no matter how simple the password is it will create a unique hash
- password + salt ----> (Hash Function) Hash
- We will store salt and hash in our database
- To increase security instead of using md5 algorithm we will use bcrypt algorithm
- only 17000  bcypt Hashes/sec can be calculated
- Salt rounds - In first round we have a password and to it we add the salt, If we want two rounds then to the generated hash we add salt again
- Install bcrypt  version 3.0.2 (Here we are using node version 10.15.0--> To install use nvm
- const bcrypt = require('bcrypt');
- const saltRounds = 10;
- Encrypting using hashing
- Regenerating password

What are cookies and sessions (385)
- Cookies- used to save browsing session. eg. Saving the details of your shopping cart
- With the help of cookies tech companies show the users personalized adds
- Cookies help in maintaining sessions
- Session - time till cookie is active
- Passport - flexible, helps in authentication

Using passport.js to Add Cookies and Sessions
- Install passport, passport-local, passport-local-mongoose, express-session
const passport = require('express');
const passportLocalMongoose = require('passport-local-mongoose');
const saltRounds = 10;
- First we tell our app to use session configuration
- Then we will initialize passport and also deal with the session
app.use(passport.initialize());
app.use(passport.session()); (Read passport documentation)
- Set up passport-local-mongoose
- A schema to have a plugin has to be a mongoose.schema
userSchema.plugin(passportLocalMongoose);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.post("/register",function(req,res){
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
- A cookie is stored in the browser till we don't close the browser
- When we close the browser the cookie gets deleted
- When user logs in:
app.post("/login", function(req,res){
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
- To logout--> set up logout route
app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

Level 6 - OAuth 2.0 & How to Implement Sign In with Google (387)
- OAuth---> Open Authorization, open standard for token based authorization
- Why OAuth is special --- >1.  Allows granular level of access ---> It means that if we want only a specific data for eg only email id, contact no. then it is possible, instead of acquiring the whole database
- 2. It allows for only read only or read and write access
- 3. Revoke access ---> User should be able to remove access of their data by going to the site from where we are fetching the data
- Steps of working of OAuth--->
- Step 1: Set Up your app in their developer console, in return we get an app id
- Step 2: Redirect to Authenticate
- Step 3: User logs in 
- Step 4: User grants permissions
- Step 5: Receive Authorization code, using this code we will be able to make them log in to our website
- Step 6: Exchange AuthCode for Access Token, this token can we used if we require pieces of information subsequently
- Auth Code is like a ticket, Access token is like a year pass
- We will implement login with google using passport and google OAuth
