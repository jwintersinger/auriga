var ejs = require('ejs');

$(function() {
  var carousel = $('.carousel');
  carousel.carousel({
    interval: 6*3600*1000
  });

  var createTeamForm = $('form.create-team');
  createTeamForm.find('[name=teamName]').focus();
  createTeamForm.submit(function(evt) {
    evt.preventDefault();
    $.ajax({
      url: '/team',
      type: 'POST',
      data: $(this).serialize()
    }).done(function(response) {
      setInterval(updateQuizStats, 1000);

      $.ajax({
        url: '/questions',
        type: 'GET'
      }).done(function(questions) {
        var question = questions[0];
        var compiled = $('#quiz-question-template').html();
        $('#primaryCarousel .question').html(compiled);
        carousel.carousel('next');
      });
    });
  });

  $(document).on('submit', '#primaryCarousel .question form', function(evt) {
    evt.preventDefault();
    console.log('Question submitted');
  });
});

function updateQuizStats() {
  $.ajax({
    url: '/stats',
    type: 'GET',
  }).done(function(stats) {
    var tmpl = $('#quiz-stats-template').html();
    var compiled = ejs.render(tmpl, stats);
    $('#quiz-stats').html(compiled);
  });
}
