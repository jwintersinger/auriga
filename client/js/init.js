var ejs = require('ejs');

/*====
  Util
  ====*/
Util = {
  executeNowAndPeriodically: function(func, period) {
    func();
    setInterval(func, period);
  }
};


/*========
  Notifier
  ========*/
function Notifier(container) {
  this._container = $(container);
  this._autoCloseDelay = 3000;
  this._fadeInDuration = 250;
}

Notifier.prototype.notify = function(msg, additionalClasses) {
  var tmpl = $('#notification-template').html();
  var compiled = ejs.render(tmpl, {
    msg: msg,
    additionalClasses: additionalClasses.join(' ')
  });
  var compiled = $(compiled);
  compiled.hide();
  this._container.append(compiled);
  compiled.fadeIn(this._fadeInDuration);

  setTimeout(function() {
    // Simulate click rather than triggering 'close' event to get fancy
    // fade-out effect.
    compiled.find('.close').click();
  }, this._autoCloseDelay);
};

Notifier.prototype.success = function(msg) {
  return this.notify(msg, ['success']);
};

Notifier.prototype.failure = function(msg) {
  return this.notify(msg, ['failure']);
};


/*==============
  QuestionLoader
  ==============*/
function QuestionLoader(carousel) {
  this._carousel = carousel;
  this._notifier = new Notifier('#notifications');

  this._loadQuestions();

  this._carousel.carousel({
    interval: 6*3600*1000 // 6 hours -- ugly hack.
  });
  this._configureTeamCreation();
  this._configureAnswerSubmission();
  this._promptForExistingTeam();
}

QuestionLoader.prototype._promptForExistingTeam = function() {
  // User hasn't previously joined team.
  if(document.cookie.indexOf('sessionToken') === -1)
    return;


  var self = this;
  this._getStats(function(stats) {
    var teamName = stats.team_name;
    // If teamName is undefined, client has invalid sessionToken cookie.
    if(typeof teamName === 'undefined')
      return;

    var dialog = $('#changeTeamPrompt');
    dialog.find('.teamName').html(teamName);
    dialog.find('.stay-on-team').click(function() {
      self._configureStatsUpdater();
      self._advanceToNextQuestion();
      dialog.modal('hide');
    });
    dialog.find('.change-team').click(function() {
      dialog.modal('hide');
    });
    dialog.modal('show');
  });
};

QuestionLoader.prototype._loadQuestions = function() {
  var self = this;
  $.ajax({
    url: '/questions',
    type: 'GET'
  }).done(function(questions) {
    self._questions = questions;
  });
};

QuestionLoader.prototype._configureStatsUpdater = function() {
  var self = this;
  Util.executeNowAndPeriodically(function() {
    self._updateQuizStats();
  }, 1000);
};

QuestionLoader.prototype._configureTeamCreation = function() {
  var createTeamForm = $('form.create-team');
  var teamNameInput = createTeamForm.find('[name=teamName]');
  teamNameInput.focus();

  var self = this;
  createTeamForm.submit(function(evt) {
    evt.preventDefault();

    var teamName = teamNameInput.val();
    if(/^\s*$/.test(teamName)) {
      self._notifier.failure('Please enter a team name.');
      teamNameInput.val('');
      teamNameInput.focus();
      return;
    }

    $.ajax({
      url: '/team',
      type: 'POST',
      data: $(this).serialize()
    }).done(function(response) {
      self._configureStatsUpdater();
      self._advanceToNextQuestion();
    });
  });
}

QuestionLoader.prototype._configureAnswerSubmission = function() {
  var self = this;
  $(document).on('submit', '#primaryCarousel .question form', function(evt) {
    evt.preventDefault();
    var form = $(this);

    if(form.find(':radio[name=answer]:checked').length === 0) {
      self._notifier.failure('Please select an answer.');
      return;
    }

    var questionId = form.find('[name=question_id]').val();
    $.ajax({
      url: '/questions/' + questionId,
      type: 'POST',
      data: form.serialize()
    }).done(function(response) {
      if(response.status === 'correct')
        self._notifier.success('Good show, mate!');
      else if(response.status === 'incorrect')
        self._notifier.failure('Oh, dear.');
    });
    self._advanceToNextQuestion();
  });
};

QuestionLoader.prototype._getStats = function(onResult) {
  $.ajax({
    url: '/stats',
    type: 'GET',
  }).done(onResult);
};

QuestionLoader.prototype._updateQuizStats = function() {
  this._getStats(function(stats) {
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
