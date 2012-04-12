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

  // Use non-standard opening and closing tags to allow ejs templates using the
  // standard tags to be embedded in the HTML for client-side use without being
  // interpeted by the server.
  app.set('view options', {
    open: '{{',
    close: '}}'
  });
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

app.get('/', routes.index);


/*=====================
  Server initialization
  =====================*/
app.listen(config.serverPort);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
