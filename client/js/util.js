Util = {
  executeNowAndPeriodically: function(func, period) {
    func();
    setInterval(func, period);
  },

  timeAgoInWords: function(secondsAgo) {
    if(secondsAgo === null)
      return '&mdash;';
    var timeAgo = '';
    var mins = Math.floor(secondsAgo / 60);
    if(mins > 0)
      timeAgo += mins + ' min' + (mins === 1 ? ' ' : 's ');
    timeAgo += (secondsAgo % 60) + ' s';
    return timeAgo;
  },

  sortRandomly: function(arr) {
    arr.sort(function() {
      return Math.random() - 0.5;
    });
  }
};
