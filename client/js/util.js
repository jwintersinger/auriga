Util = {
  executeNowAndPeriodically: function(func, period) {
    func();
    setInterval(func, period);
  }
};
