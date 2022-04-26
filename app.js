require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
   secret: process.env.SECRET,
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://"+process.env.ADMIN+":"+process.env.MONGODB_PASS+"@qesproject.gneie.mongodb.net/QES", {useNewURLParser: true});

const postSchema = {
   title: String,
   content: String
};

const userSchema = new mongoose.Schema({
   email: String,
   password: String
   // like: [likeSchema]
});

const likeSchema = new mongoose.Schema({
   likes: Number
});

const replySchema = new mongoose.Schema({
   postSchema_id: String,
   rep: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);
const Like = mongoose.model("Like", likeSchema);
const Reply = mongoose.model("Reply", replySchema)

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
   done(null, user.id);
});

passport.deserializeUser(function(id, done) {
   User.findById(id, function(err, user) {
      done(err, user);

   });
});

const ques = "What do you think I should opt after my 12th schooling or puc?";
const quesInfo = "I've been thinking lately that I should choose engineering after my 12th, but I'm not very sure about which field to choose in it. Can someone help me decide what to choose?"

app.get("/", function (req, res) {
   res.render("home");
});

app.get("/logIn", function (req, res) {
   res.render("logIn");
});

app.get("/signup", function (req, res) {
   res.render("signup");
});

app.get("/askQuestion", function (req, res) {
   if (req.isAuthenticated()) {
      res.render("askQuestion");
   } else {
      res.redirect("/login");
   }
});

app.get("/postHome", function (req, res) {


   if (req.isAuthenticated()) {
      Post.find({}, function(err, posts) {
         res.render("postHome", {
            question: ques,
            startingInfo: quesInfo,
            posts: posts
         });
      });
   } else {
      res.redirect("/login");
   }
});

app.post("/askQuestion", function (req, res) {
   const post = new Post({
      title: req.body.asktitle,
      content: req.body.askinfo
   });
   post.save(function(err) {
      if(!err) {
         res.redirect("/postHome");
      }
   });
});

app.post("/like", function(req, res) {
   const like = new Like({

   });
});

app.post("/posting", function (req, res) {
   const reply = new Reply({
      rep: req.body.reply
   });
   reply.save(function(err) {
      if (!err) {
         res.redirect("post");
      }
   });
});

app.get("/posts/:postId", function (req, res) {
   const requestedId = req.params.postId;
   Post.findOne({_id: requestedId}, function(err, post){
      res.render("post", {
         title: post.title,
         content: post.content,
         reply: post.reply
      });
   });
});


app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});

app.post("/signup", function (req, res) {
   User.register({username: req.body.username}, req.body.password, function(err, user) {
      if (err) {
         console.log(err);
         res.redirect("/signup");
      } else {
         passport.authenticate("local")(req, res, function(){
            res.redirect("/postHome");
         });
      }
   });
});

app.post("/login", function(req, res){

   const user = new User({
      username: req.body.username,
      password: req.body.password
   });

   req.login(user, function(err){
      if (err) {
         console.log(err);
         res.redirect("/signup");
      } else {
         passport.authenticate("local")(req, res, function(){
            res.redirect("/postHome");
         });
      }
   });

});


app.listen(3000 || process.env.PORT, function () {
   console.log("Server connected to port 3000.");
});
