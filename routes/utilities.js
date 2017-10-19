const express = require('express');
const router = express.Router();

const Db = require("../db/db.js");

// test view db
router.get("/view", (req, res) => {
  Db.Users.find({}, (err, data) => {

    if (err) {
      console.log('error viewing data', err);
    } else {
      res.json(data);
    }
  });
});
// view sessions status
router.get("/view2", (req, res) => {
  res.send(req.session)
});

// view polls db
router.get("/polls", (req, res) => {
  Db.Polls.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});
// delete latest
router.get("/delete", (req, res) => {
  Db.Users.findOneAndRemove({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {

      console.log(data);
      
      console.log("data deleted");
      res.send("data deleted");
    }
  });
});
// purge all polls
router.get("/deleteAllPolls", (req, res) => {
  Db.Polls.remove({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("data deleted");
      res.send("data deleted");
    }
  });
});
// purge all users
router.get("/deleteAll", (req, res) => {
  Db.Users.remove({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("data deleted");
      res.send("data deleted");
    }
  });
});
module.exports = router;