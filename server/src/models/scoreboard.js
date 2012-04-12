var models = require('./index');
var db = models.db;

var errHandler = function(err) {
  if(err !== null)
    throw err;
};

var Scoreboard = function() {
};
exports.Scoreboard = Scoreboard;

Scoreboard.listScores = function(onResult) {
  Scoreboard._queries.listScores.all(function(err, rows) {
    errHandler(err);
    onResult(rows);
  });
};

Scoreboard._queries = {
  listScores: db.prepare(
    'SELECT t.* FROM teams AS t ' +
    'ORDER BY t.score'
  )
};
