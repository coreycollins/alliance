$(function ($, _, Backbone) {

  var Todo = Backbone.Model.extend({

      // MongoDB uses _id as default primary key
      idAttribute: "_id",

      // Default attributes for the todo item.
      defaults: function () {
        return {
          title: "empty todo...",
          order: Todos.nextOrder(),
          done: false
        };
      },

      // Ensure that each todo created has `title`.
      initialize: function () {
        if (!this.get("title")) {
          this.set({"title": this.defaults.title});
        }
      },

      // Toggle the `done` state of this todo item.
      toggle: function () {
        this.save({done: !this.get("done")});
      },

      // Remove this Todo and delete its view.
      clear: function () {
        this.destroy();
      }

  });


}(jQuery, _, Backbone));