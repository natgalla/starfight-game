var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

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
  return res.redirect('/login');
});

router.get('/login', mid.loggedOut, function(req, res) {
  return res.render('login', { title: '| Log In' });
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
  return res.render('register', { title: '| Register' });
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
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      return res.render('profile',
        {
          title: '| Profile',
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
        return res.render('logout');
      }
    });
  }
});

// Menu view
router.get('/menu', mid.requiresLogin, function(req, res, next) {
  return res.render('menu', { title: '| Menu' });
});

router.post('/menu', function(req, res, next) {
  console.log(req.body);
  // was "new game" or "join game" selected?
    // let err = new Error('Must choose whether to create a new game or join an existing game.');
    // err.status = 400;
    // return next(err);
  if(!validateNormalCharacters(req.body.sessionName)) {
      let err = new Error('Invalid game name. Can only contain letters, numbers, dashes (-), and underscores (_)');
      err.status = 400;
      return next(err);
  }
  // if new game is selected
    // create a namespace with the provided name
    // store the "difficulty" in an instance of the game
    // redirect to that namespace
  // else if join game is selected
    // if session name does not exist
      // return error
    // redirect to this namespace
  return res.redirect('game');
});

// Game view
router.get('/game', mid.requiresLogin, function(req, res, next) {
  return res.render('game');
});

module.exports = router;
