var models = require('../models');
var util = require('./util');

exports.listQuestions = function(req, res) {
  models.Question.list(function(questionList) {
    res.json(questionList);
  });
};

exports.answerQuestion = function(req, res) {
  util.auth(req, res, function(team) {
    models.Question.answer(req.body.question_id, req.body.answer_id, team.team_id, function() {
      res.json({ status: 'correct' });
    }, function() {
      res.json({ status: 'incorrect' });
    }, function() {
      res.json({ status: 'already_answered' });
    });
  });
};

exports.loadQuestions = function(req, res) {
  models.Question.loadFromJson();
  res.send();
};
