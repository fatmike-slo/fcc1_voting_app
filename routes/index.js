const express = require('express');
const router = express.Router();

const Db = require("../db/db.js");


// log in, splashscreen-------------------------------------------------------------------------------------
router.get("/", (req, res) => {

  // console.log('Sprozil se je router.get("/', req.session);
  Db.Polls.find({}).sort("-date").exec((err, data) => {
    if (err) {
      console.log(err);
    }
    res.render("index.hbs", {
      unregData: data
    });
  });
  req.session = null;
});

router.get('/:loginFailed', (req, res, next) => {
  if (req.params.loginFailed === "loginFailed") {
    Db.Polls.find({}).sort("-date").exec((err, data) => {
      if (err) {
        console.log(err);
      }
      res.render("index.hbs", {
        unregData: data,
        errors: ["Invalid username or password"],
        invalidUserPass: true
      });
      req.session = null;
    });
  } else {
    req.session = null;
    res.redirect("/");
  }
});

// log in post process --------------------------------------------------------------------------------------

router.post("/login", (req, res) => {
  console.log('Sprozil se je router.post("/login');
  // check if user is in database
  Db.Users.findOne({
    username: req.body.username,
    password: req.body.password
  }, (err, data) => {
    if (err) {
      console.log(err);
    } 
    else {
      // if match, data take username name
      if (data) {
        req.session.username = req.body.username;
        res.redirect("/dashboard/" + req.body.username);
      } else {
        // if not, pass and user don't mach
        res.redirect("/loginFailed");
      }
    }
  });
});
// logout --------------------------------------------------------------------------------------
router.get('/logout/:userId', (req, res)=> {
  req.logOut();
  req.session.destroy((err)=> {
    if(err) {
      console.log('Cannot destroy session ----->', err);
    }
    res.redirect('/'); //Inside a callback… bulletproof!
  });
});











module.exports = router;
