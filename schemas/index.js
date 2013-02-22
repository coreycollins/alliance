var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

MentionSchema = new mongoose.Schema({
  link: String,
  message: String,
  created_at: Date,
  updated_at: Date,
  post_id: String
});

GoalSchema = new mongoose.Schema({
  hashtag: { type: String },
  description: String,
  progress: Number,
  link: String,
  created_at: Date,
  updated_at: Date,
  mentions: [MentionSchema],
  archived: {type:Boolean, default: false}
});

/*
GoalSchema.path('hashtag').validate(function (v, callback) {
  mongoose.models["User"].findOne({fb_id:this.parent_id, 'goals.hashtag' : v },function(err, user) {
    if (err) {return callback(false);}
    else if (user) { return callback(false);}
    else { return callback(true); }
  });
}, 'Unique Hashtag'); 
*/

UserSchema = new mongoose.Schema({
  fb_id: String,
  name: String,
  goals: [GoalSchema]
});


module.exports = mongoose.model('User', UserSchema);