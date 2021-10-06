require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({secret:"our little secret.",resave:false,saveUninitialized:true,cookie:{ maxAge: 60 * 60 * 1000}}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login", { errMsg: "", username: "", password: "" });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets",(req,res) =>{
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get('/logout', (req, res)=> {
  req.logout();
  res.redirect('/login');
});

app.post("/register", (req, res) => {

  User.register({username:req.body.username}, req.body.password, (err, user) =>{

    if (err) {
      console.log(err);
      res.redirect('/register')
      
    } else {

      passport.authenticate("local")(req,res, ()=>{
        res.redirect("/secrets");
      });
      
    }
    
  });
  
});;

app.post("/login",(req,res)=> {

  const user = new User({username:req.body.username,password:req.body.password});

  passport.authenticate('local', (err, user)=> {
    if (err) { console.log(err); }
   if (!user) { res.render("login", {
    errMsg: "Email or password incorrect",
    username: req.body.username,
    password: re.body.password,
  }); }
 req.logIn(user, (err)=> {
  if (err) { console.log(err); }
  console.log("New login ("+req.body.username+")" );
  return res.redirect('/secrets');
});
})(req, res);


});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
