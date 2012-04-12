var express = require('express');
var config = require('./config');
var routes = require('./routes');
var app = module.exports = express.createServer();

/*=============
  Configuration
  =============*/
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(config.staticDocPath, { maxAge: config.staticDocMaxAge }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


/*======
  Routes
  ======*/
app.get('/questions', routes.listQuestions);
app.post('/questions/load', routes.loadQuestions);
app.post('/questions/:id([0-9]+)', routes.answerQuestion);

app.get('/stats', routes.listStats);
app.post('/team', routes.createTeam);

app.get('/scoreboard', routes.showScoreboard);

// This route isn't strictly necessary, as Express' static-file-handling code
// seems to automaticaly serve a static file named index.html if no "root"
// route is provided. Nevertheless, I feel more comfortable making this
// behaviour explicit.
app.get('/', routes.index);


/*=====================
  Server initialization
  =====================*/
app.listen(config.serverPort);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
