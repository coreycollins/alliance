$(function ($, _, Backbone) {

  var MainView = Backbone.View.extend({

    el: '#main',

    footerTemplate: _.template( $('#footer-template').html() ),

    events: {
    },

    initialize: function() {
      this.$footer = this.$('#footer');
      this.$main = this.$('#main');

      this.render();
    },

    render: function() {
      this.$footer.html(this.footerTemplate({
          name: 'Corey Collins'
      }));
    }

  });

  // Create the app
  var mainView = new MainView();
  
}(jQuery, _, Backbone));