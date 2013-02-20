 var app = app || {};

$(function ($, _, Backbone) {

  var Mention = Backbone.AssociatedModel.extend({

    idAttribute: "_id",

    defaults: {
      link: '',
      message: '',
      created_at: new Date()
    }

  });

  var Goal = Backbone.AssociatedModel.extend({

    idAttribute: "_id",

    relations: [
      {
        type: Backbone.Many,//nature of the relation
        key: 'mentions',
        relatedModel:Mention //AssociatedModel for attribute key
      }
    ],

    defaults: {
      hashtag: '#newgoal',
      description: 'Double click to enter a description...',
      parent_id: '',
      progress: 0
    }

  });

  var User = Backbone.AssociatedModel.extend({

    idAttribute: "_id",

    relations: [
      {
        type: Backbone.Many,//nature of the relation
        key: 'goals',
        relatedModel:Goal //AssociatedModel for attribute key
      }
    ],

    defaults: {
      fb_id: '',
      name: '',
      link: ''
    },

    createGoal: function(hashtag) {
      if (hashtag[0] != '#') {
        hashtag = '#' + hashtag;
      }
      var exsist = this.get('goals').where({hashtag:hashtag});
      if (exsist.length == 0) {
        var goal = new Goal({hashtag:hashtag, created_at: new Date() });
        this.get("goals").add(goal);
        this.save();
      }
      else {
        alert('Hashtag must be unique.');
      }
    }

  });

  var UserCollection = Backbone.Collection.extend({
    model: User,

    url: function () {
      return "/user" + ((this.id) ? '/' + this.id : '');
    },

    comparator: function(user) {
      return user.get('_id');
    }

  });

  app.Users = new UserCollection();

}(jQuery, _, Backbone));