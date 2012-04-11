var db = require('./index').db;
var models = require('./index');

var Stats = function() {
};
exports.Stats = Stats;

Stats.list = function(sessionToken, onResult) {
  models.Team.auth(sessionToken, function(result) {
    onResult(result);
  }, function() {
    onResult({});
  });
};
