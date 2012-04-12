var models = require('../models');
var util = require('./util');

exports.showScoreboard = function(req, res) {
  res.render('scoreboard');
}

exports.listScoreboard = function(req, res) {
  models.Scoreboard.listScores(function(scores) {
    res.json(scores);
  });
};
