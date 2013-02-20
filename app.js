var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var schemas = require('./schemas');
var routes = require('./config/routes');
var app = express();
var watcher = require('./utils/watcher');

watcher.packageFiles();

app.configure(function () {
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
  watcher.watch();
});

routes.init(app);

mongoose.connect("127.0.0.1", "alliance", 27017);

http.createServer(app).listen(3000);

console.log("Express server listening on port 3000");