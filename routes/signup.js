const express = require('express');
const router = express.Router();

const Db = require("../db/db.js");



//signup -----------------------------------------------------------------------------

router.get("/register", (req, res) => {
    req.session.signup = "Signup";

    //handling for different types of error responses 
    if (req.session.errors === undefined) {
        console.log('1 -------->');
        // splash screen for /register
        res.render("registerUser.hbs", {
            title: " for a new account",
            signup:req.session.signup
        });
    } else if (typeof req.session.errors === "object") {
        console.log('2 -------->');
        res.render("registerUser.hbs", {
            success: req.session.success,
            errors: req.session.errors,
            signup:req.session.signup
        });
        // string napaka je ko jo podamo iz posta pod obliko duplikata nasenega
    } 
    req.session.success = null;
    req.session.errors = null;
});
//when creating new user profile -------------------------------------------------------------------------------
router.post("/new", (req, res) => {
    console.log('POST /new----->', req.session);
    
    // check if mail is proper and pass has at least 2 chars,
    // we do that with Express-validator method .check()
    req.check("email", "Invalid email address").isEmail();
    req.check("password", "Password must have at least 2 characters or password retyped is not the same as first password provided").isLength({
        min: 2
    }).equals(req.body.confirmPassword);

    // shranimo podatke userja da posljemo naprej

    // cekiramo za validacijo. Ce ql, napisi v session da je true, ce je false, hiti v success=false in poslji podatke o napakah
    let errors = req.validationErrors();
    if (errors) {
        // podamo array naprej 
        req.session.errors = errors;
        req.session.success = false;
        res.render("registerUser.hbs", {
            errors:errors,
            success:req.session.success,
            signup:req.session.signup
        });
    } else {
        // ce vse ql, dalje, poberi podatke in pisi v db
        let setDate = new Date();
        req.session.username = req.body.username;
        req.session.success = true;
        let obj = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            date: setDate.toDateString()
        }

        let newUser = new Db.Users({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            date: setDate.toString()
        });
        newUser.save((err) => {
            // ce najdemo duplikat ali od username ali od password
            if (err) {
                let errors = ["User with same username or email already registered"];
                console.log('error occured when adding to db: ');
                req.session.success = false;
                res.render("registerUser.hbs", {
                    signup: req.session.signup,
                    duplicateFound: true,
                    errors:errors
                });
                duplicateFound = false;
            } else {
                console.log('new user added');
                res.redirect("/dashboard/" + req.body.username);
            }
        });
    }
});

module.exports = router;