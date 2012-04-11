var db = require('./index').db;

var errHandler = function(err) {
  if(err !== null)
    throw err;
};

var Team = function() {
};
exports.Team = Team;

Team.create = function(teamName, onCreated) {
  Team._queries.create.run(teamName, function(err) {
    errHandler(err);
    onCreated(this.lastID);
  });
};

Team._queries = {
  create: db.prepare("INSERT INTO teams (name, created_at) VALUES (?, strftime('%s', 'now'))"),
  auth: db.prepare('SELECT t.name AS team_name, t.id AS team_id, t.score AS team_score ' +
                   'FROM teams AS t ' +
                   'INNER JOIN sessions AS s ON s.team_id = t.id ' +
                   'WHERE s.token = ?'),
  updateScore: db.prepare('UPDATE teams SET score = (score + ?) WHERE id = ?')
};

Team.auth = function(sessionToken, onValid, onInvalid) {
  Team._queries.auth.get(sessionToken, function(err, row) {
    errHandler(err);
    if(typeof row === 'undefined') {
      if(typeof onInvalid !== 'undefined')
        onInvalid();
    } else {
      if(typeof onValid !== 'undefined')
        onValid(row);
    }
  });
};

Team.updateScore = function(teamId, delta) {
  Team._queries.updateScore.run(delta, teamId, errHandler);
};
