var app = app || {};

app.MentionView = Backbone.View.extend({

  //... is a list tag.
  tagName:  'li',
  className: 'mention',

  // Cache the template function for a single item.
  template: _.template( $('#mention-template').html() ),

  // The DOM events specific to an item.
  events: {
    'click' : 'clicked'
  },

  initialize: function() {

  },

  render: function() {
    this.$el.html( this.template(this.model.toJSON()));
    return this;
  },

  clicked: function() {
    var link = this.model.get("link");
    if (link) { window.open(link); }
  }

});