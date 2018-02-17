var express = require('express');
var router = express.Router();
var Post= require('./../models/Post');
var Account= require('./../models/Account');


/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session && req.session.user)
  {
    Post.find({},function(error,posts){

       
        
        res.render('index',{title:"home",posts:posts});
    });
  }
  else {
    res.render('welcome', { title: "Social Network" });

  }

});

module.exports = router;
