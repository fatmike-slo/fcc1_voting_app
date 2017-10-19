const express = require('express');
const router = express.Router();

const Db = require("../db/db.js");

// dashboard 
//--------------------------------------------------------------------------------------

router.get("/", (req, res) => {
    // console.log('loadali root dashboarda');
    // console.log(req.session);
    // console.log('-------------------------------------------------------------------');

    if (req.session.username) {
        console.log('smo sprozili error');
        res.render("error.hbs", {
            urlError: true,
            registerUrl: "/signup"
        });
    } else {
        res.redirect("/");
    }
});

router.get("/:user", (req, res) => {
    console.log('sesuij ki ga dobimo,', req.session);
    console.log('---------------------------------------------------------');

    // check if user has logged, session is on
    if (req.session.username && req.params.user === req.session.username) {
        // just view polls -------------------------------------------------------------------------
        if (req.session.viewPolls) {
            console.log('se aktivira dashboard VIEW polls check');
            console.log('---------------------------------------------');

            res.render("dashboard.hbs", {
                username: req.session.username,
                viewPolls: req.session.viewPolls,
                // data of arrays coming from /viewUserPolls
                pollDataOptionView: req.session.pollDataOptionView
            });
            req.session.viewPolls = false;

        }
        // delete poll 
        else if (req.session.deleteConfirm) {
            req.session.pollOptions = true;
            console.log('smo tle delete,', req.session);
            console.log("---------------------------------------------------");
            Db.Polls.find({
                userId: req.session.username
            }, (err, data) => {
                if (err) {
                    console.log(err);
                }
                res.render("dashboard.hbs", {
                    username: req.session.username,
                    pollOptions: req.session.pollOptions,
                    triggerOptions: req.session.triggerOptions,
                    deleteConfirm: req.session.deleteConfirm,
                    // data of arrays coming from /viewUserPolls
                    pollDataOptionView: data
                });
            });
            req.session.deleteConfirm = false;
            req.session.viewPolls = false;
        }
        // Option mode ----------------------------------------------------------------------------
        else if (req.session.pollOptions) {
            console.log('req.session.pollOptions -----------------------------------------------------');

            res.render("dashboard.hbs", {
                username: req.session.username,
                pollOptions: req.session.pollOptions,
                triggerOptions: req.session.triggerOptions,
                // data of arrays coming from /viewUserPolls
                pollDataOptionView: req.session.pollDataOptionView
            });
            req.session.pollOptions = false;
        }



        // normal default dashboard ---------------------------------------------------------------
        else {
            Db.Polls.find({}).sort("-date").exec((err, data) => {
                console.log('se aktivira dashboard DEFAULT');
                if (err) {
                    console.log(err);
                }
                if (req.session.twitterSession) {
                    req.session.splashView = true;
                    res.render("dashboard.hbs", {
                        status: "You have logged successfully via Twitter",
                        username: req.session.username,
                        splashView: req.session.splashView,
                        unregData: data,
                        twitterSession: req.session.twitterSession
                    });
                } else {
                    req.session.splashView = true;
                    res.render("dashboard.hbs", {
                        status: "You have logged successfully",
                        username: req.session.username,
                        splashView: req.session.splashView,
                        unregData: data
                    });
                }
                req.session.splashView = false;
                req.session.status = null;
            });
        }
        // if user not registered, get him back to index
    } else {
        res.redirect("/");
    }
});
router.get("/:user/view", (req, res) => {
    if (req.session.username) {
        console.log('Sprozil se je router.get("/:user/view")');

        Db.Polls.find({
            userId: req.session.username
        }).sort("-date").exec((err, data) => {
            console.log('se aktivira dashboard DEFAULT');
            if (err) {
                console.log(err);
            }
            req.session.splashView = true;
            res.render("dashboard_view.hbs", {
                username: req.session.username,
                viewPolls: true,
                pollDataView: data
            });
            req.session.viewPolls = false;
        });
    } else {
        res.redirect("/");
    }

});
// user options / settings
router.get("/userOptions/:userId", (req, res) => {
    req.session.userOptions = "User Options";

    res.render("dashboard.hbs", {
        userOptions: req.session.userOptions,
        username: req.params.userId
    });
    req.session.userOptions = false;
});

// post query db, change nickname, password
router.post("/userOptions/:userId", (req, res) => {
    console.log('smo tle');

    // using logger from morgan module to check for criterias
    req.check("oldPassword", "Password length must be at least 2 charachters").isLength({
        min: 2
    });
    // check if confirm password matched new password
    req.check("newPassword", "Password length must be at least 2 charachters").isLength({
        min: 2
    }).equals(req.body.newPasswordConfirm);

    // another logger method. It returns an array with an object as info  
    let errors = req.validationErrors();
    // if error when typing password
    if (errors) {
        console.log('ERRORJI');

        res.render("dashboard.hbs", {
            errors: errors[0].msg
        });
    } else {
        console.log('NI ERRORJEV');

        // find by username and change password
        let username = req.params.userId;

        Db.Users.findOneAndUpdate({
            username: username
        }, {
            password: req.body.newPassword
        }, (err, data) => {
            if (err) {
                console.log(err);
            }
            req.session.confirmChangePassword = true;
            res.render("dashboard.hbs", {
                confirmChangePassword: req.session.confirmChangePassword,
                username: username
            });
            req.session.confirmChangePassword = false;
        });

    }

});

module.exports = router;