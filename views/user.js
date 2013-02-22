var app = app || {};

app.UserView = Backbone.View.extend({

  //... is a list tag.
  tagName:  'li',
  className: 'user',

  // Cache the template function for a single item.
  template: _.template( $('#user-template').html() ),

  // The DOM events specific to an item.
  events: {
    'click':'show'
  },

  // The TodoView listens for changes to its model, re-rendering. Since there's
  // a one-to-one correspondence between a **Todo** and a **TodoView** in this
  // app, we set a direct reference on the model for convenience.
  initialize: function() {
    this.model.on('reset', this.show, this );
    //this.model.on('add:goals', this.addGoal, this);
    this.model.on('error', this.errors, this );
    this.model.on('reset:goals', this.addAllGoals, this);
    //this.model.on('remove:goals', this.removeGoals, this);
  },

  // Re-renders the todo item to the current state of the model and
  // updates the reference to the todo's edit input within the view.
  render: function() {
    this.$el.html( this.template({link: "http://graph.facebook.com/"+this.model.get('fb_id')+"/picture?type=square&width=80&height=80"  }));
    return this;
  },

  errors: function(user, response) {
    var error = JSON.parse(response.responseText).error.message;
    var type = /.*\"(.*)\".*/.exec(error)[1];
    user.get('goals').last().trigger('error', type);
  },

  show: function() {
    this.addAllGoals();
    _.each($('.user'), function(user){
      $(user).removeClass('selected');
    });
    this.$el.addClass('selected');
    //$('.select-bar').css('left', this.$el.position().left);

    $('#mentions-list').html('');
  },

  addGoal: function(goal) {
    var view = new app.GoalView({ model: goal, user: this.model });
    $('#goals-list').prepend( view.render().el );
  },

  addAllGoals: function() {
    $('#goals-list').html('');
    var goals = this.model.get('goals');
    goals.comparator = function(goal) {
      return (new Date(goal.get('created_at'))).getTime();
    }
    goals.each(this.addGoal,this);
  }

});