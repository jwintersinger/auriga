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
  create: db.prepare("INSERT INTO teams (name, created_at) VALUES (?, strftime('%s', 'now'))")
};
