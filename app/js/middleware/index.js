function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }
  return next();
}

function requiresLogin(req, res, next) {
  if (!req.session.userId) {
    let err = new Error('CLASSIFIED: Authorized Personnel Only. (Please log in to view this page)');
    err.status = 403;
    return next(err);
  }
  return next();
}

function requiresGameSession(req, res, next) {
  if (!req.session.gameId && req.header('Referer') !== req.header('Host') + '/menu') {
    let err = new Error('You must create or join a game');
    err.status = 403;
    return next(err);
  }
  return next();
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.requiresGameSession = requiresGameSession;
