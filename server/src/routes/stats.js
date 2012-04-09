var models = require('../models');

exports.listStats = function(req, res) {
  models.Stats.list(req.cookies.session_token, function(result) {
    res.json(result);
  });
};
