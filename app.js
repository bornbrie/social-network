var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt= require('bcrypt');
var mongo = require('mongodb');
var mongoose= require('mongoose');
var session = require('express-session');
//var monk = require('monk');
var db = mongoose.connect('mongodb://localhost:27017/sn');
//var db = monk('localhost:27017/sn');



var index = require('./routes/index');
var users = require('./routes/users');
var Account= require('./models/Account');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'ssshhhhh'}));

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});

var authenticate = function(req,res,next){
  if (req.session && req.session.user) return next();

  return res.redirect('/login');

}

app.use('/', index);
app.use('/users', users);

app.get('/login',function(req,res){
  res.render('login', { title: "login" });
});

app.get('/signup',function(req,res){
  res.render('signup', { title: "signup" });
});

app.get('/me',authenticate,function(req,res){
  res.render('me');

});

app.post('/login',function(req,res){

  Account.findOne({username:req.body.username},function(error,account)
  {
    if (error) {
      return res.render('error',{message:"error in login",error:"haha"});
    }

    if (!account){
      return res.render('error',{message:"user doesnot exist",error:"hahah"});
    }

    if (account.compare(req.body.password)){
      req.session.user = account;
      req.session.save();
      res.redirect('/me');
    }
    else {
      return res.render('error',{message:"wrong password",error:"hahah"});
    }

  });
});

app.post('/signup',function(req,res){
  if (req.body.username && req.body.password )
  {
    Account.create({
      username : req.body.username,
      password : req.body.password
    }, function(error,account){
      if (error)
      {
        /*
        res.locals.message = error.message;
        res.locals.error=error;
        res.status(error.status || 500);
        */
        res.render('error',{message:"user not created",error:"some error occured"});
      }

      else{
        res.send(account);
      }
    })
  }
  else {
    res.locals.message = error.message;
    res.locals.error=error;
    res.status(error.status || 500);
    res.render('error',{message: "username and password required"});
  }
});


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


module.exports = app;
