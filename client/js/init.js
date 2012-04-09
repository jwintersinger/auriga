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
      carousel.carousel('next');
      setInterval(updateQuizStats, 10000);
    });
  });
});

function updateQuizStats() {
  $.ajax({
    url: '/stats',
    type: 'GET',
  }).done(function(stats) {
    var tmpl = $('#quiz-stats-template').html();
    var compiled = _.template(tmpl, stats);
    $('#quiz-stats').html(compiled);
  });
}
