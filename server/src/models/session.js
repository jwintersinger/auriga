var db = require('./index').db;
var crypto = require('crypto');

var errHandler = function(err) {
  if(err !== null)
    throw err;
};

var Session = function() {
};
exports.Session = Session;

function _generateToken(teamId) {
  var salt = 'Mmmm, sodium chloride!';
  var hasher = crypto.createHash('sha512');
  hasher.update(salt + teamId);
  return hasher.digest('hex');
}

Session.create = function(teamId, onCreated) {
  var token = _generateToken(teamId);
  Session._queries.create.run(teamId, token, function(err) {
    errHandler(err);
    onCreated(token);
  });
};

Session._queries = {
  create: db.prepare("INSERT INTO sessions (team_id, token, created_at) VALUES (?, ?, strftime('%s', 'now'))")
};
