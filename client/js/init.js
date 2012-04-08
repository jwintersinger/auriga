$(function() {
  var carousel = $('.carousel');
  carousel.carousel({
    interval: 6*3600*1000
  });

  $('form').submit(function(evt) {
    evt.preventDefault();
    carousel.carousel('next');
  });
});
