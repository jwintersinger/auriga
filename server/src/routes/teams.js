var models = require('../models');

exports.createTeam = function(req, res) {
  var teamName = req.body.teamName;
  var team = models.Team.create(teamName, function(teamId) {
    var session = models.Session.create(teamId, function(sessionToken) {
      res.cookie('session_token', sessionToken);
      res.send();
    });
  });
};
