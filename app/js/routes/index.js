var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Game = require('../models/game');
var mid = require('../middleware');

let gameTitle = 'Contact!';

function validateNormalCharacters(string) {
  let valid = true;
  for (let i=0; i < string.length; i++) {
    let character = string[i];
    if (!'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.includes(character)) {
      valid = false;
    }
  }
  return valid;
}

// Login view
router.get('/', function(req, res) {
  return res.render('index', { gameTitle: gameTitle });
});

router.get('/login', mid.loggedOut, function(req, res) {
  return res.render('login', { title: '| Log In', gameTitle: gameTitle });
});

router.post('/login', function(req, res, next) {
  if (req.body.callsign && req.body.password) {
    User.authenticate(req.body.callsign.toUpperCase(), req.body.password, function(error, user) {
      if (error || !user) {
        let err = new Error('Wrong callsign or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    let err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});


// Register view
router.get('/register', mid.loggedOut, function(req, res) {
  return res.render('register', { title: '| Register', gameTitle: gameTitle });
});

router.post('/register', function(req, res, next) {
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  if (req.body.callsign &&
      req.body.email &&
      req.body.password &&
      req.body.passwordConfirm) {
    if ( !validateEmail(req.body.email) ) {
      var err = new Error('Must enter a valid email');
      err.status = 400;
      return next(err);
    }
    if (req.body.password.length < 8) {
      var err = new Error('Password must be at least 8 characters');
      err.status = 400;
      return next(err);
    }
    if (req.body.password !== req.body.passwordConfirm) {
      var err = new Error('Passwords do not match');
      err.status = 400;
      return next(err);
    }
    if ( !validateNormalCharacters(req.body.callsign) && (req.body.callsign.length === 0 || req.body.callsign.length > 8) ) {
      var err = new Error('Invalid callsign. Must be between 1 and 8 characters long and can only contain letters, numbers, dashes (-), and underscores (_)');
      err.status = 400;
      return next(err);
    }
    let userData = {
      callsign: req.body.callsign.toUpperCase(),
      email: req.body.email,
      password: req.body.password,
    }
    if (req.body.updates === undefined) {
      userData.updates = false;
    } else {
      userData.updates = true;
    }
    User.create(userData, function(error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('profile');
      }
    });
  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// Profile view
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId).exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      return res.render('profile',
        {
          title: '| Profile',
          gameTitle: gameTitle,
          callsign: user.callsign,
          wins: user.meta.wins,
          losses: user.meta.losses,
          rank: user.meta.rank
        })
    }
  });
});

// Logout view
router.get('/logout', mid.requiresLogin, function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.render('logout', { gameTitle: gameTitle });
      }
    });
  }
});

// Menu view
router.get('/menu', mid.requiresLogin, function(req, res, next) {
  return res.render('menu', { title: '| Menu', gameTitle: gameTitle });
});

router.post('/menu', function(req, res, next) {
  if (!req.body.session) {
    let err = new Error('Must choose to create a new game or join an existing game.');
    err.status = 400;
    return next(err);
  }
  if( !validateNormalCharacters(req.body.sessionName) ) {
    let err = new Error('Invalid game name. Can only contain letters, numbers, dashes (-), and underscores (_)');
    err.status = 400;
    return next(err);
  }
  if (req.body.session === 'create') {
    Game.find({ gameName: req.body.sessionName }, function(err, game) {
      if (err) {
        return next(err);
      }
      if (game.length) {
        let err = new Error('This name is currently unavailable. Please choose a different name.');
        err.status = 400;
        return next(err);
      }
      User.findById(req.session.userId).exec(function (error, user) {
        if (error) {
          return next(error);
        }
        let gameData = {
          gameName: req.body.sessionName,
          difficulty: req.body.difficulty,
          users: {
            user1: user.callsign
          }
        }
        Game.create(gameData, function(error, game) {
          if (error) {
            return next(error);
          } else {
            req.session.gameId = game._id;
            return res.redirect('game');
          }
        });
      });
    });
  }
  if (req.body.session === 'join') {
    Game.find({ gameName: req.body.sessionName }, function(err, game) {
      if (err) {
        return next(err);
      }
      if (game.length) {
        if (game[0].meta.locked) {
          let err = new Error('This game is full or has already started.');
          err.status = 400;
          return next(err);
        }
        User.findById(req.session.userId).exec(function (error, user) {
          if (error) {
            return next(error);
          }
          let query = { gameName: req.body.sessionName };
          let update;
          if (game[0].users.user1 === undefined) {
            update = { "users.user1": user.callsign, $inc: { players: 1 } };
          } else if (!game[0].users.user2 || game[0].users.user2 === undefined) {
            update = { "users.user2": user.callsign, $inc: { players: 1 } };
          } else if (!game[0].users.user3 || game[0].users.user3 === undefined) {
            update = { "users.user3": user.callsign, $inc: { players: 1 } };
          } else if (!game[0].users.user4 || game[0].users.user4 === undefined) {
            update = { "users.user4": user.callsign, $inc: { players: 1 }, "meta.locked": true };
          }
          Game.update(query, update, function() {
            req.session.gameId = game[0]._id;
            return res.redirect('game');
          });
        });
      } else {
        let err = new Error('This game does not exist. Make sure you are entering the name correctly.');
        err.status = 400;
        return next(err);
      }
    })
  }
});

// Game view
router.get('/game', mid.requiresLogin, mid.requiresGameSession, mid.setCookie, function(req, res, next) {
  Game.findById(req.session.gameId, function(err, gameSession) {
    if (err) {
      return next(err);
    }
    return res.render('game', {
      gameTitle: gameTitle,
      gameName: gameSession.gameName
    });
  });
});

module.exports = router;
