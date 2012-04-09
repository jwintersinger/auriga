var config = require('../config');
var db = require('./index').db;
var fs = require('fs');

var Question = function() {
};
exports.Question = Question;

var errHandler = function(err) {
  if(err !== null)
    throw err;
};

Question._deleteAll = function() {
  ['deleteQuestions', 'deleteAnswers', 'deleteAnsweredQuestions'].forEach(function(queryName) {
    var query = Question._queries[queryName];
    query.run(errHandler);
  });
};

Question.list = function(onResult) {
  Question._queries.list.all(function(err, rows) {
    errHandler(err);
    onResult(rows);
  });
};

Question.loadFromJson = function() {
  Question._deleteAll();

  var contents = fs.readFileSync(config.questionsPath, 'utf8');
  var parsed = JSON.parse(contents);
  parsed.forEach(function(question) {
    Question._queries.insertQuestion.run(question.body, function() {
      var questionId = this.lastID;
      question.answers.forEach(function(answer) {
        Question._queries.insertAnswer.run(questionId, answer.body, answer.correct, function() {
        });
      });
    });

  });
};

Question._queries = {
  list: db.prepare('SELECT q.*, a.body AS answer_body ' +
                   'FROM questions AS q ' +
                   'INNER JOIN answers AS a ON a.question_id = q.id'),
  insertQuestion: db.prepare('INSERT INTO questions (body) VALUES (?)'),
  insertAnswer: db.prepare('INSERT INTO answers (question_id, body, correct) VALUES (?, ?, ?)'),
  deleteQuestions: db.prepare('DELETE FROM questions'),
  deleteAnswers: db.prepare('DELETE FROM answers'),
  deleteAnsweredQuestions: db.prepare('DELETE FROM answered_questions'),
};
