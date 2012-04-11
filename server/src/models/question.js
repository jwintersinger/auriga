var config = require('../config');
var models = require('./index');
var db = models.db;
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
  Question._queries.listQuestions.all(function(err, rows) {
    errHandler(err);

    var questions = {};
    rows.forEach(function(row) {
      if(!(row.id in questions))
        questions[row.id] = { body: row.body, answers: [] };
      questions[row.id].answers.push({
        id: row.answer_id,
        body: row.answer_body
      });
    });

    var questionList = [];
    for(var qid in questions) {
      var question = questions[qid];
      question.id = qid;
      questionList.push(question);
    }
    onResult(questionList);
  });
};

Question.loadFromJson = function() {
  Question._deleteAll();

  var contents = fs.readFileSync(config.questionsPath, 'utf8');
  var parsed = JSON.parse(contents);
  parsed.forEach(function(question) {
    Question._queries.insertQuestion.run(question.body, question.points, function() {
      var questionId = this.lastID;
      question.answers.forEach(function(answer) {
        Question._queries.insertAnswer.run(questionId, answer.body, answer.correct, errHandler);
      });
    });

  });
};

Question.answer = function(questionId, answerId, teamId, onCorrect, onIncorrect, onAlreadyAnswered) {
  Question._queries.determineIfAlreadyAnswered.get(questionId, teamId, function(err, row) {
    if(typeof row !== 'undefined') {
      onAlreadyAnswered();
      return;
    }

    Question._queries.testAnswer.get(questionId, answerId, questionId, function(err, row) {
      errHandler(err);
      Question._queries.markQuestionAsAnswered.run(questionId, teamId, function(err) {
        errHandler(err);
        if(typeof row === 'undefined') {
          onIncorrect();
        } else {
          onCorrect();
          models.Team.updateScore(teamId, row.points);
        }
      });
    });
  });
};

Question._queries = {
  listQuestions: db.prepare(
    'SELECT q.*, a.id AS answer_id, a.body AS answer_body ' +
    'FROM questions AS q ' +
    'INNER JOIN answers AS a ON a.question_id = q.id'
  ),
  insertQuestion: db.prepare('INSERT INTO questions (body, points) VALUES (?, ?)'),
  insertAnswer: db.prepare('INSERT INTO answers (question_id, body, correct) VALUES (?, ?, ?)'),
  deleteQuestions: db.prepare('DELETE FROM questions'),
  deleteAnswers: db.prepare('DELETE FROM answers'),
  deleteAnsweredQuestions: db.prepare('DELETE FROM answered_questions'),
  testAnswer: db.prepare(
    'SELECT q.points FROM answers AS a ' +
    'INNER JOIN questions AS q ON q.id == ? ' +
    'WHERE a.id == ? AND a.question_id == ? AND a.correct == 1'
  ),
  markQuestionAsAnswered: db.prepare(
    'INSERT INTO answered_questions (question_id, team_id) ' +
    'VALUES (?, ?)'
  ),
  determineIfAlreadyAnswered: db.prepare(
    'SELECT question_id FROM answered_questions ' +
    'WHERE question_id == ? AND team_id == ?'
  )
};
