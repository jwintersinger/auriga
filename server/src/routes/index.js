var path = require('path');
var config = require('../config');

exports.index = function(req, res) {
  res.render('index');
};

['questions', 'stats', 'teams', 'scoreboard'].forEach(function(moduleName) {
  var module = require('./' + moduleName);
  for(var ex in module)
    exports[ex] = module[ex];
});
