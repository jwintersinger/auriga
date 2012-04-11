var models = require('../models');

exports.auth = function(req, res, onValid) {
  return models.Team.auth(req.cookies.session_token, onValid, function() {
    res.json({ error: 'auth' });
  });
};
