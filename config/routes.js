(function (exports) {

  "use strict";

  var mongoose = require('mongoose');
  var crudUtils = require('../utils/crud');
  var Todo = mongoose.model('Todo');

  function index(req, res) {
    res.render('index', { 'title': 'Skeleton App' });
  }

  exports.init = function (app) {
    app.get('/', index);
    crudUtils.initRoutesForModel({ 'app': app, 'model': Todo });
  };

}(exports));