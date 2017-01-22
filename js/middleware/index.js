var Game = require('../models/game');

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
  Game.findById(req.session.gameId, function(err, gameSession) {
    if (err) {
      return next(err);
    }
    if (gameSession === null
       || gameSession.gameName == gameSession._id
       || (!req.session.gameId && req.header('Referer') !== req.header('Host') + '/menu')) {
         let err = new Error('You must create or join a game');
         err.status = 403;
         return next(err);
    }
    return next();
  });
}

function setCookie(req, res, next) {
  res.cookie('gameId', req.session.gameId);
  res.cookie('userId', req.session.userId);
  return next();
}

// function preventRefresh(req, res, next) {
//   if (req.header('Referer') === req.header('Host') + '/game') {
//     return res.redirect('/profile');
//   };
//   console.log(req.headers);
//   return next();
// }

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.requiresGameSession = requiresGameSession;
module.exports.setCookie = setCookie;
// module.exports.preventRefresh = preventRefresh;
