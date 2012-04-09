var db = require('./index').db;

var errHandler = function(err) {
  if(err !== null)
    throw err;
};

var Stats = function() {
};
exports.Stats = Stats;

Stats.list = function(sessionToken, onResult) {
  Stats._queries.getTeam.get(sessionToken, function(err, row) {
    errHandler(err);
    onResult(row);
  });
};

Stats._queries = {
  getTeam: db.prepare('SELECT name AS team_name FROM teams AS t ' +
                      'INNER JOIN sessions AS s ON s.team_id = t.id ' +
                      'WHERE s.token = ?')
};
