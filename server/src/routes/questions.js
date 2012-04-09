var models = require('../models');

exports.listQuestions = function(req, res) {
  models.Question.list(function(rows) {
    var questions = {};
    rows.forEach(function(row) {
      if(!(row.id in questions))
        questions[row.id] = { body: row.body, answers: [] };
      questions[row.id].answers.push(row.answer_body);
    });
    res.json(questions);
  });
};

exports.answerQuestion = function(req, res) {
  res.json({});
};

exports.loadQuestions = function(req, res) {
  models.Question.loadFromJson();
  res.send();
};
