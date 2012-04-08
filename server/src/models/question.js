var config = require('../config');
var db = require('./index').db;

var Question = function() {
};
exports.Question = Question;

Question.list = function() {
};

Question._dbQueries = {
  list: db.prepare('SELECT q.*, a.body AS answer_body ' +
                   'FROM questions AS q ' +
                   'INNER JOIN answers AS a ON a.question_id = q.id');
};
