var models = require('../models');

exports.fetchQuestions = function(req, res) {

};

exports.answerQuestion = function(req, res) {

};

exports.loadQuestions = function(req, res) {
  models.Question.loadFromJson();
  res.send();
};
