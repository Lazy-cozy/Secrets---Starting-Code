require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("user", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login", { errMsg: "", username: "", password: "" });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, salt, function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });

    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
            console.log("New login (" + username + ")");
          } else {
            res.render("login", {
              errMsg: "Email or password incorrect",
              username: username,
              password: password,
            });
          }
        });
      } else {
        res.render("login", {
          errMsg: "Email doesn't exist",
          username: username,
          password: password,
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
