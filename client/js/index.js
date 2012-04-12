var ejs = require('ejs');

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

  this._carousel.carousel({
    interval: 6*3600*1000 // 6 hours -- ugly hack.
  });
  this._configureTeamCreation();
  this._configureAnswerSubmission();

  var self = this;
  this._checkForExistingTeam(function() { self._onTeamChanged(); });
}

QuestionLoader.prototype._onTeamChanged = function() {
  this._loadQuestions();
  this._configureStatsUpdater();
  this._advanceToNextQuestion();
};

QuestionLoader.prototype._checkForExistingTeam = function(onUserStaysOnSameTeam) {
  // User hasn't previously joined team.
  if(document.cookie.indexOf('session_token') === -1)
    return;

  this._getStats(function(stats) {
    var teamName = stats.team_name;
    // If teamName is undefined, client has invalid sessionToken cookie. 
    if(typeof teamName === 'undefined')
      return;

    // User is already on valid team.
    var dialog = $('#changeTeamPrompt');
    var stayOnTeam = dialog.find('.stay-on-team');
    var changeTeam = dialog.find('.change-team');
    dialog.find('.teamName').html(teamName);
    stayOnTeam.click(function() {
      onUserStaysOnSameTeam();
      dialog.modal('hide');
      // If button not removed from DOM, provided that user gave focus to it
      // before hitting enter, he can continue hitting enter to repeatedly
      // trigger the button.
      $(this).remove();
    });
    changeTeam.click(function() {
      dialog.modal('hide');
      $(this).remove();
    });
    dialog.modal('show');
    stayOnTeam.focus();
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
      self._onTeamChanged();
    });
  });
}

QuestionLoader.prototype._configureAnswerSubmission = function() {
  var self = this;
  $(document).on('submit', '#primaryCarousel .question form', function(evt) {
    evt.preventDefault();
    var form = $(this);

    if(form.find(':radio[name=answer_id]:checked').length === 0) {
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
        self._notifier.success("You're correct! Good show, my friend!");
      else if(response.status === 'incorrect')
        self._notifier.failure("I'm terribly sorry, dear, but you're incorrect.");
      else if(response.status === 'already_answered')
        self._notifier.failure('You already tried to answer that question, you jerk.');
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

  var carouselInner = this._carousel.find('.carousel-inner');
  carouselInner.append(compiled);
  this._carousel.carousel('next');
}


$(function() {
  var carousel = $('.carousel');
  var ql = new QuestionLoader(carousel);
});
