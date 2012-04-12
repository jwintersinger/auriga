var ejs = require('ejs');

$(function() {
  var tmpl = $('#scoreboard-template').html();
  Util.executeNowAndPeriodically(function() {
    $.ajax({
      url: '/scoreboard.json',
      type: 'GET',
    }).done(function(result) {
      var compiled = ejs.render(tmpl, { teams: result });
      $('body > .container').html(compiled);
    });
  }, 1000);
});
