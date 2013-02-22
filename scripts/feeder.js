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

var USERS = 6

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

function createMention(user, post, hashtag, goal, callback) {
  var ids = post.id.split("_");
  var link = "http://www.facebook.com/"+ids[0]+"/posts/"+ ids[1];

  var mention = _.find(goal.mentions, function(m){ return m.post_id == post.id; });
  if (!mention) {
    goal.mentions.push({link:link, message:post.message, post_id:post.id, created_at: new Date()});
    user.save(function(err, user){
      console.log("Saved Mention.");
      callback();
    });
  }
  else {
    callback();
  }
}

function createGoal(user, post, hashtag, callback){
  var link = post.actions != undefined ? post.actions[0].link : '';

  if (post.likes && post.likes.count > (USERS)) {
    var mention = {link:link, message:post.message, post_id:post.id, created_at: new Date()};
    goal = {hashtag:hashtag, description: post.message, created_at: new Date(), mentions:[mention]};

    user.goals.push(goal);
    
    user.save(function(err, user){
      console.log("Saved Goal.");
      callback();
    });
  }
  else {
    callback();
  }

};


function parseComment(comment, callback) {
  var hashtags = comment.message.match(/(#\w+)/g);

  if (hashtags) {

    User.findOne({fb_id:comment.from.id}, function(err, user){
      if (hashtags.length > 0) {
        _.each(hashtags, function(hashtag){
          //console.log(hashtag);
          //////////// Split hashtag to get progress and hashtag
          var splits = hashtag.split('_');
          var progress;
          if (splits.length > 1) { 
            progress = _.last(splits); 
            hashtag = hashtag.replace(("_"+progress),''); 
          }
          ////////////

          var goal = _.find(user.goals, function(g){ return g.hashtag == hashtag; });

          if(goal) {
            goal.progress = progress ? progress : goal.progress;
            createMention(user, comment, hashtag, goal, callback);
          }
          else {
            callback();
          }

        });
      }
      else { callback(); }

    });

  }
  else { callback(); }
};

function parseMain(post, callback){

  // CHECK MESSAGE FOR HASHTAGS
  var match = post.message.match(/.*(#\w+).*/);
  if (match) {

    User.findOne({fb_id:post.from.id}, function(err, user){
      var hashtags = post.message.match(/(#\w+)/g);

      if (hashtags.length > 0) {
        var hashtag = hashtags[0];
        async.eachSeries(hashtags, function(hashtag, callback2){

          //////////// Split hashtag to get progress and hashtag
          var splits = hashtag.split('_');
          var progress;
          if (splits.length > 1) { 
            progress = _.last(splits); 
            hashtag = hashtag.replace(("_"+progress),''); 
          }
          ////////////

          var goal = _.find(user.goals, function(g){ return g.hashtag == hashtag; });

          if (!goal && !progress) {
            createGoal(user, post, hashtag, callback2);
          }
          else if(goal) {
            goal.progress = progress ? progress : goal.progress;
            createMention(user, post, hashtag, goal, callback2);
          }
          else {
            callback2();
          }

        }, callback);
      }
      else { callback(); }

    });
  }
  else { callback(); }
  
};

function parsePost(post, callback) {

  parseMain(post, function(){

    // Now parse comments
    var comments = post.comments.data;
    if (comments && comments.length > 0) {
      async.eachSeries(comments, parseComment, callback);
    }
    else { callback(); }

  });
}


function getGoals(){
  request("https://graph.facebook.com/409434605800948/feed?access_token="+ACCESS_TOKEN, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var posts = _.sortBy(data.data, function(post){ return new Date(post.created_time); });
      async.eachSeries(posts, parsePost, function(){
        console.log("Done parsing goals.");
      });
    }
    else {
      console.log("Error: ", body);
    }
  });
};

timer.setInterval( function(){
  //getMembers();
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