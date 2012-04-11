var ejs = require('ejs');

function QuestionLoader(carousel) {
  this._carousel = carousel;
  this._carousel.carousel({
    interval: 6*3600*1000 // 6 hours -- ugly hack.
  });
  this._configureTeamCreation();
  this._configureQuestionSubmission();

  this._loadQuestions();
  this._advanceToNextQuestion();
}

QuestionLoader.prototype._loadQuestions = function() {
  var self = this;
  $.ajax({
    url: '/questions',
    type: 'GET'
  }).done(function(questions) {
    self._questions = questions;
  });
};

QuestionLoader.prototype._configureTeamCreation = function() {
  var createTeamForm = $('form.create-team');
  createTeamForm.find('[name=teamName]').focus();

  var self = this;
  createTeamForm.submit(function(evt) {
    evt.preventDefault();
    $.ajax({
      url: '/team',
      type: 'POST',
      data: $(this).serialize()
    }).done(function(response) {
      setInterval(function() {
        self._updateQuizStats();
      }, 1000);
      self._advanceToNextQuestion();
    });
  });
}

QuestionLoader.prototype._configureQuestionSubmission = function() {
  var self = this;
  $(document).on('submit', '#primaryCarousel .question form', function(evt) {
    evt.preventDefault();
    self._advanceToNextQuestion();
  });
};

QuestionLoader.prototype._updateQuizStats = function() {
  $.ajax({
    url: '/stats',
    type: 'GET',
  }).done(function(stats) {
    var tmpl = $('#quiz-stats-template').html();
    var compiled = ejs.render(tmpl, stats);
    $('#quiz-stats').html(compiled);
  });
}

QuestionLoader.prototype._advanceToNextQuestion = function() {
  var self = this;
  if(typeof self._questions === 'undefined') {
    setTimeout(function() {
      self._advanceToNextQuestion();
    }, 1);
    return;
  }

  if(this._questions.length > 0) {
    var question = this._questions.shift();
    var tmpl = $('#quiz-question-template').html();
    var compiled = ejs.render(tmpl, question);
  } else {
    var compiled = $('#all-questions-answered-template').html();
  }

  this._carousel.find('.carousel-inner').append(compiled);
  this._carousel.carousel('next');
}

$(function() {
  var carousel = $('.carousel');
  var ql = new QuestionLoader(carousel);
});
