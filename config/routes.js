(function (exports) {

  "use strict";

  var mongoose = require('mongoose');
  var crudUtils = require('../utils/crud');
  var User = mongoose.model('User');

  function index(req, res) {
    res.render('index', { 'title': 'The Alliance' });
  }

  exports.init = function (app) {
    app.get('/', index);
    crudUtils.initRoutesForModel({ 'app': app, 'model': User });
  };

}(exports));