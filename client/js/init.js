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
      console.log(response);
      carousel.carousel('next');
    });
  });
  /*$('form').submit(function(evt) {
    evt.preventDefault();
    carousel.carousel('next');
  });*/
});
