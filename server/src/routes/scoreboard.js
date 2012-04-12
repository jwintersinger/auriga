var models = require('../models');
var util = require('./util');

exports.showScoreboard = function(req, res) {
  models.Scoreboard.listScores(function(scores) {
    res.render('pants');
    //res.json(scores);
  });
}
