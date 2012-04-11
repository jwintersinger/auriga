var models = require('../models');

exports.listQuestions = function(req, res) {
  models.Question.list(function(questionList) {
    res.json(questionList);
  });
};

exports.answerQuestion = function(req, res) {
  res.json({ status: 'incorrect' });
};

exports.loadQuestions = function(req, res) {
  models.Question.loadFromJson();
  res.send();
};
