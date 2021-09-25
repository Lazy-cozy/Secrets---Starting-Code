const express=require("express");
const app=express();
const ejs = require("ejs");
const mongoose = require("mongoose");


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));   

mongoose.connect('mongodb://localhost:27017/userDB');


const userSchema = mongoose.Schema({
    email:String,
    password:String

});

const User = new mongoose.model("user",userSchema);

app.get("/",function(req,res) {
    res.render("home");
    
});

app.get("/login",function(req,res) {
    res.render("login",{errMsg:"", username:"", password:""});
    
});

app.get("/register",function(req,res) {
    res.render("register");
    
});

app.post("/register",function(req,res) {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
   });

   newUser.save((err)=>{
       if (err) {
           console.log(err);
           
       }else{
         res.render("secrets");
       }
         
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
   
    User.findOne({email: username}, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
            console.log("New login (" + username + ")");
          } else {
            res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
          }
        } else {
          res.render("login", {errMsg: "Email doesn't exist", username: username, password: password});
        }
      }
    });
  });


app.listen(3000,function() {

    console.log("Server is running on port 3000");
    
});
