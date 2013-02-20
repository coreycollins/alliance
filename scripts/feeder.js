var request = require('request');
var mongoose = require('mongoose');
var schemas = require('../schemas');
var query_string = require('querystring');
var _ = require('underscore');
var timer = require('timers');
var async = require('async');

var User = mongoose.model('User');

var FB_APP_ID = '584495804911901';
var FB_APP_SECRET = 'b7708e7435937f8ae5b9bc5d86ed8a83';
var ACCESS_TOKEN = 'AAAITmIjTER0BABlbDZCjuTTpbsg8YOkzpISbZBB7ZCCSI04UyA3xgcZBttHCtoND1rv0f2peZAsu329DG27gOr6mZCOgP2D0gkZCNOKR7sFIAZDZD';

mongoose.connect("127.0.0.1", "alliance", 27017);

function getMembers() {
  request("https://graph.facebook.com/409434605800948/members?access_token="+ACCESS_TOKEN, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      _.each(data.data, function(member){
        User.findOne({fb_id:member.id}, function(err,user){
          if (user === null) {
            console.log("Adding user...");
            user = new User({fb_id:member.id, name:member.name});
            user.save(function(err){
              if (err) {console.log(err)}
              else { console.log("Saved");}
            });
          }
          else {
            user.set('name', member.name);
            user.save();
          }
        });
      });
    }
    else {
      console.log("Error: ", body);
    }
  });
};

function getGoals(){
  request("https://graph.facebook.com/409434605800948/feed?access_token="+ACCESS_TOKEN, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var posts = _.sortBy(data.data, function(post){ return new Date(post.created_time); });
      async.eachSeries(posts, function(post, callback){

        var match = post.message.match(/.*(#\w+).*/);
        if (match) {
          var hashtag = match[1];
          User.count(function(err, count){

            User.findOne({fb_id:post.from.id}, function(err, user){
              var ids = post.id.split('_');
              var link = "http://www.facebook.com/"+ids[0]+"/posts/"+ids[1];

              var splits = hashtag.split('_');
              var progress;
              if (splits.length > 1) { 
                progress = _.last(splits); 
                hashtag = hashtag.replace(("_"+progress),''); 
              }

              var goal = _.find(user.goals, function(g){ return g.hashtag == hashtag; });

              if (!goal && !progress) {
                if (post.likes && post.likes.count > (count*.4999)) {
                  var mention = {link:link, message:post.message, post_id:ids[1], created_at: new Date()};
                  goal = {hashtag:match[1], description: post.message, created_at: new Date(), mentions:[mention]};

                  user.goals.push(goal);
                  
                  user.save(function(err, user){
                    console.log("Saved Goal.");
                    callback();
                  });
                }
                else {
                  callback();
                }
              }
              else if(goal) {
                var mention = _.find(goal.mentions, function(m){ return m.post_id == ids[1]; });
                if (!mention) {
                  goal.progress = progress ? progress : goal.progress;
                  goal.mentions.push({link:link, message:post.message, post_id:ids[1], created_at: new Date()});
                  user.save(function(err, user){
                    console.log("Saved Mention.");
                    callback();
                  });
                }
                else {
                  callback();
                }
              }
              else {
                callback();
              }

            });

          });
        }
        else { 
          callback();
        }
      });
    }
    else {
      console.log("Error: ", body);
    }
  });
};

timer.setInterval( function(){
  getMembers();
  getGoals();
}, 10000);


/*
request('https://graph.facebook.com/oauth/access_token?client_id='+FB_APP_ID+'&client_secret='+FB_APP_SECRET+'&grant_type=fb_exchange_token&fb_exchange_token=AAAITmIjTER0BAGMZB8a1AfqHLUtrjWZAkRzbRwDTPjV0m6ihdmejGVRE0F6mzpDEiCbCWxwnGZBYUVZAJFIEDTG8QddLbsZCZCqjiKZA5nH8gZDZD', function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var access_token = query_string.parse(body)['access_token'];
    console.log(access_token);
    //getMembers(access_token);
  }
  else {
    console.log("Error: ", body);
  }
});
*/