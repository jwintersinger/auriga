var path = require('path');
var config = require('../config');

exports.index = function(req, res) {
  res.sendfile(path.join(config.staticDocPath, 'index.html'));
};

['questions', 'stats', 'teams'].forEach(function(moduleName) {
  var module = require('./' + moduleName);
  for(var ex in module)
    exports[ex] = module[ex];
});