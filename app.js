const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

// session handlers
const expressSession = require("express-session");
const cookieParser = require('cookie-parser');

// validators
const logger = require('morgan');
const expressValidator = require("express-validator");
// handlebars
const handleBars = require("express-handlebars");

// passport for twitter login 
const passport = require("passport");
const Strategy = require("passport-twitter").Strategy;

// routes
let index = require('./routes/index');
let signup = require('./routes/signup');
let dashboard = require('./routes/dashboard');
let polls = require('./routes/polls');
let utilities = require('./routes/utilities');
let twitter = require("./routes/twitterLogin");

var app = express();


// Handlebars view engine setup
app.engine("hbs", handleBars({
  extname:"hbs",
  defaultLayout:"layout",
  layoutsDir: path.join(__dirname, "views/layout")
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//  favicon
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
  secret: "andrej",
  saveUninitialized:true,
  resave:false
}));

// init passport TWITTER LOGIN
app.use(passport.initialize());
app.use(passport.session());






// app.use('/', index);
app.use("/", index);
app.use("/signup", signup);
app.use("/dashboard", dashboard);
app.use("/polls", polls);
app.use("/utilities", utilities);
app.use("/twitter", twitter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 3000);


