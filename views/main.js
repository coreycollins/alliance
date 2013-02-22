var app = app || {};

app.MainView = Backbone.View.extend({

  el: '#main',

  events: {
    'keypress #new-goal':'newGoal',
    'click #archive': 'archive'
  },

  initialize: function() {
    this.$main = this.$('#main');
    this.input = this.$('#new-goal');
    this.action = this.$('#archive');

    this.setMentionsHeight();

    window.app.Users.on( 'reset', this.addAll, this );

    window.app.Users.fetch();

  },

  addOne: function( user ) {
    var view = new app.UserView({ model: user });
    $('#user-list').append( view.render().el );
  },

  addAll: function() {
    this.$('#todo-list').html('');
    app.Users.each(this.addOne, this);
    $('.user').first().click();
  },

  newGoal: function(e) {

    if ( e.which !== 13 || !this.input.val().trim() ) {
      return;
    }

    var selected = this.$('.user.selected');
    var user = app.Users.at(selected.index());
    user.createGoal(this.input.val().trim());

    this.input.val('');
  },

  archive: function() {
    var selected = this.$('.user.selected');
    var user = app.Users.at(selected.index());
    var goals = user.get("goals");
    $('.goal').each(function(index, element){
      var checkbox = $(element).find('.checkbox');
      if (checkbox.is(":checked")){
        var id = $(element).find('.hashtag').text();
        var matched = goals.where({'hashtag':id});
        goals.remove(matched);
      }
    });
    user.save();
  },

  setMentionsHeight: function(){
    $('#mentions').css('height',window.innerHeight-80);
  }

});
