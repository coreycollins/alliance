var app = app || {};

app.GoalView = Backbone.View.extend({

  //... is a list tag.
  tagName:  'li',
  className: 'goal',

  // Cache the template function for a single item.
  template: _.template( $('#goal-template').html() ),

  // The DOM events specific to an item.
  events: {
    'dblclick .description' : 'edit',
    'keypress .edit': 'updateOnEnter',
    'blur .edit': 'close',
    'click' : 'highlight'
  },

  initialize: function() {
    this.model.on('error', this.methods, this );
    this.model.on('remove', this.remove, this );
    this.model.on('change', this.render, this );
  },

  render: function() {
    var json = this.model.toJSON();
    json['completed'] = (this.model.get("progess") == 100) ? 'completed' : '';
    this.$el.html( this.template(json));
    this.input = this.$('.edit');
    return this;
  },

  edit: function() {
    this.$el.addClass('editing');
    this.input.focus();
  },

  remove: function() {
    this.$el.remove();
    if (this.$el.hasClass('active')) {
      $('#mentions-list').html('');
    }
  },

  methods: function(error_type) {
    if (error_type === "Unique Hashtag") {
      console.log('Hashtag must be unique.');
      this.edit();
    }
  },

  highlight: function() {
    _.each($('.goal'), function(goal){
      $(goal).removeClass('active');
    });
    this.$el.addClass('active');
    this.addAllMentions();
  },

    // Close the `"editing"` mode, saving changes to the todo.
  close: function() {
    var value = this.input.val().trim();
    if ( value ) {
      this.model.set('description',value);
      this.options.user.save();
    }

    this.$el.removeClass('editing');
  },

  // If you hit `enter`, we're through editing the item.
  updateOnEnter: function( e ) {
    if ( e.which === 13 ) {
      this.close();
    }
  },

  addMention: function(mention) {
    var view = new app.MentionView({ model: mention, goal: this.model });
    $('#mentions-list').prepend( view.render().el );
  },

  addAllMentions: function() {
    $('#mentions-list').html('');
    var mentions = this.model.get('mentions');
    if (mentions) {
      mentions.comparator = function(mention) {
        return (new Date(mention.get('created_at'))).getTime();
      }
      mentions.each(this.addMention,this);
    }
  }

});