$(function ($, _, Backbone) {

  var TodoRouter = Backbone.Router.extend({
    /* define the route and function maps for this router */
    routes: {
      "todo/:id" : "getTodo"
    },

    getTodo: function(id){
        /*
        Note that the id matched in the above route will be passed to this function
        */
        console.log("You are trying to reach todo " + id);
    }
  });

  var myTodoRouter = new TodoRouter();

}(jQuery, _, Backbone));