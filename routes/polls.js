const express = require('express');
const router = express.Router();

const Db = require("../db/db.js");


// 1. create poll dashboard ------------------------------------------------------------
router.get("/new", (req, res) => {
  console.log('Sprozil se je router.get("polls/new)');
  res.render("createpoll.hbs", {
    title: "Create a new poll",
    username: req.session.username,
  });
});
// 2. create poll process
router.post("/create", (req, res) => {
  console.log('Sprozil se je router.get("polls/create)');
  
  // prepare object for insertion in db
  let pollData = [{
      poll: req.body.choice1,
      count: 0
    },
    {
      poll: req.body.choice2,
      count: 0
    }
  ];
  // write 
  let getDate = new Date();
  let dateSchema = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  } 
  let formatTime =  getDate.toLocaleString("US-en", dateSchema)
  console.log('URA ------->',formatTime);
  


  console.log('URA ------->', getDate.toLocaleString("US-en", formatTime));
  
  let dataToAdd = {
    userId: req.session.username,
    title: req.body.pollTitle,
    polls: pollData,
    date: getDate.toLocaleString(dateSchema)
  };
  let newPoll = new Db.Polls(dataToAdd);

  newPoll.save((err) => {
    if (err) {
      console.log("ERROR when saving into polls db: ", err);
    } else {
      req.session.pollPosted = true;
      res.redirect("/dashboard/" + req.session.username);
    }
  });
});

// 3. view posted polls from user-------------------------------------------------------
router.get("/viewUserPolls", (req, res) => {
  console.log('Sprozil se je router.get("polls/viewUserPolls)');
  
  // najdemo pollse od userja od zadnjega posta padajoce dol
  Db.Polls.find({
    userId: req.session.username
  }).sort("-date").exec((err, data) => {
    if (err) {
      console.log("error when retrieving user polss", err);
    } else {
      
      // dobimo array pollsov in routamo v dashboard
      req.session.pollDataView = data;
      req.session.viewPolls = true;
      res.redirect("/dashboard/" + req.session.username);
      
    }
  });
});
// 4. splash for options polls---------------------------------------------------------
router.get("/pollsOptions", (req, res) => {
  console.log('Sprozil se je router.get("polls/pollsOption)');
  console.log('---------------------------------------------');
  
  Db.Polls.find({
    userId: req.session.username
  }).sort("-date").exec((err, data) => {
    if (err) {
      console.log("error when retrieving user polls", err);
    } else {
      req.session.pollDataOptionView = data;
      req.session.pollOptions = true;
      req.session.triggerOptions = "Options";
      res.redirect("/dashboard/" + req.session.username);
    }
  });
});

// 5. perform various actions from poll options-----------------------------------------
router.post("/newPoll/:poll_Id", (req, res) => {
  console.log('Sprozil se je router.get("polls/newPoll/:poll_Id)');
  let retrieveDataArr;
  let poll_Id = req.params.poll_Id;
  let pollToAdd = req.body.pollToAdd;

  //Promise magic: 
  //1st. promise retrieve data from db
  let getData = new Promise((resolve, reject) => {
    Db.Polls.findById(poll_Id, (err, data) => {
      if (err) {
        console.log(err);
      }
      // got data
      retrieveDataArr = data.polls;
      resolve();
    });
  });
  //2nd. after resolving promise, replace (add) data
  getData.then(() => {
    retrieveDataArr.push({
      count: 0,
      poll: pollToAdd
    });
    Db.Polls.findByIdAndUpdate(poll_Id, {
      polls: retrieveDataArr
    }, (err, data) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/dashboard/" + req.session.username);
    });
  })
});

// 6. delete polls --------------------------------------------------------------------
router.post("/deletePoll/:poll_Id", (req, res) => {

  Db.Polls.findByIdAndRemove(req.params.poll_Id, (err) => {
    if (err) {
      console.log("Error when trying to delete: ", err);
    }
    req.session.deleteConfirm = true;
    console.log("Data deleted");
    res.redirect("/dashboard/" + req.session.username);
  });
});

// 7. vote --------------------------------------------------------------------------------
router.post("/vote/:poll_Id", (req, res) => {
  let dataInArr;
  let dataOutArr = [];

  // get data from db with a promise
  let getData = new Promise((resolve, reject) => {
    Db.Polls.findById(req.params.poll_Id, (err, data) => {
      if (err) {
        console.log(err);
      }
      dataInArr = data;
      resolve();
    });
  });
  // after getting data, process 
  getData.then(() => {
    dataInArr.polls.forEach((item, index) => {
      if (index !== parseInt(req.body.pollNumber)) {
        dataOutArr.push(item);
      } else {
        item.count += 1;
        dataOutArr.push(item);
      }
    });
    // replace the old poll
    Db.Polls.findByIdAndUpdate(req.params.poll_Id, {
      polls: dataOutArr
    }, (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    });
  });
});
// 7.b Vote registrated users
router.post("/vote/registrated/:poll_Id", (req, res) => {
  let dataInArr;
  let dataOutArr = [];
  // get data from db with a promise
  let getData = new Promise((resolve, reject) => {
    Db.Polls.findById(req.params.poll_Id, (err, data) => {
      if (err) {
        console.log(err);
      }
      dataInArr = data;
      resolve();
    });
  });
  // after getting data, process 
  getData.then(() => {
    dataInArr.polls.forEach((item, index) => {
      if (index !== parseInt(req.body.pollNumber)) {
        dataOutArr.push(item);
      } else {
        item.count += 1;
        dataOutArr.push(item);
      }
    });
    // replace the old poll
    Db.Polls.findByIdAndUpdate(req.params.poll_Id, {
      polls: dataOutArr
    }, (err) => {
      if (err) {
        console.log(err);
      }
      console.log('SMO TLE?');
      console.log(req.session.username);
      
      res.redirect("/dashboard/" + req.session.username);
    });
  });
});
// 8. get data for charts, from xtlHTTP req from static js.js
router.get("/getDataCharts", (req, res) => {
  Db.Polls.find({}).sort("-date").exec((err, data) => {
    if (err) {
      console.log(err);
    }
    res.json(data);
  });
});
// 9. get data for dashboard view, req. from registered user OWN's polls
router.get("/getOwnCharts/:user_Id", (req,res)=> {
  console.log('Sprozil se je router.get("polls/getOwnCharts/:user_Id)');
  console.log('--------------------------------------------------------');
  
  Db.Polls.find({
    userId:req.params.user_Id
  }).sort("-date").exec((err, data) => {
    if (err) {
      console.log(err);
    }
    res.json(data);
  });
}); 
module.exports = router;