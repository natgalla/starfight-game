let root = __dirname;
let port = process.env.PORT || 8080;
let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let app = express();
let server = http.createServer(app);
let socketio = require('socket.io');
let io = socketio(server);
let User = require('./js/models/user');
let GameSession = require('./js/models/game');
let MongoStore = require('connect-mongo')(session);
let currentUser;
let currentGame;

// mongodb connection
mongoose.connect('mongodb://localhost:27017/starfire');
let db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
  secret: 'Do a barrel roll!',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID available in app and templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  res.locals.currentGame = req.session.gameId;
  currentUser = req.session.userId;
  currentGame = req.session.gameId;
  next();
})

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from root
app.use(express.static(root));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
let routes = require('./js/routes/index');
app.use('/', routes);

// 404 handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (currentUser) {
    let backUrl = req.header('Referer') || '/login';
    res.status(err.status || 500);
    res.render('error', {
      statusMessage: err.message || 'There was en error processing your request',
      error: {},
      backPrompt: 'Go back',
      backUrl: backUrl
    });
  } else {
    res.status(err.status || 500);
    res.render('error', {
      statusMessage: err.message || 'There was en error processing your request',
      error: {},
      backPrompt: 'Go to login',
      backUrl: '/login'
    });
  }

});

server.listen(port, () => console.log('Ready. Listening at http://localhost:' + port));

// let nsps = [];
// getGameSessions(function(err, gameSessions) {
//   if (err) {
//     console.error(err);
//   }
//   gameSessions.forEach(function(gameSession) {
//     if (gameSession._id != gameSession.gameName) {
//       nsps.push(gameSession._id);
//     }
//   })
//   console.log(nsps);
//   nsps.forEach(function(nsp) {
//     io.of('/' + nsp).on('connection', onConnection);
//   });
// });

// game logic
io.on('connect', onConnection);

let waitingPlayer1;
let waitingPlayer2;
let waitingPlayer3;

let currentTurn;

let startTime;

let gameData = {
  turn: currentTurn,
  game: game,
  FriendlyBase: FriendlyBase,
  Player1: Player1,
  Player2: Player2,
  enemyBase: enemyBase
}

function clearSockets() {
  waitingPlayer1 = null;
  waitingPlayer2 = null;
  waitingPlayer3 = null;
}

function createGame(sessionName) {
  let nsp = io.of('/' + sessionName);
  nsp.on('connection', onConnection);
}

function getUser(userId, callback) {
  User.findById(userId, function(error, user) {
    if (error) {
      callback(err, null);
    } else {
      callback(null, user);
    }
  });
}

function getGameSession(gameId, callback) {
  GameSession.findById(gameId, function(error, game) {
    if (error) {
      callback(err, null);
    } else {
      callback(null, game);
    }
  });
}

function getGameSessions(callback) {
  GameSession.find({}, function(error, gameSessions) {
    if (error) {
      callback(err, null);
    } else {
      callback(null, gameSessions);
    }
  });
}

function onConnection(socket) {
  let join = function(player) {
    if(currentGame) {
      socket.join(currentGame);
      console.log('user joined room '+ currentGame);
    }
    if (currentUser) {
      getUser(currentUser, function(err, user) {
        if (err) {
          console.error(err);
        }
        player.name = user.callsign;
        GameSession.findById(currentGame, function(err, gameSession) {
          if (err) {
            console.error(err);
          }
          gameSession.state.friendlies.push(player);
          gameSession.save();
        });
        socket.emit('assign', player);
        socket.on('turn', turn);
        socket.on('chat', function(message) {
          io.to(currentGame).emit('chatMessage', message);
        });
        io.to(currentGame).emit('msg', player.name + ' joined as ' + player.id);
        socket.on('disconnect', function() {
          GameSession.findById(currentGame, function(err, gameSession) {
            if (err) {
              console.error(err);
            }
            if (gameSession.locked) {
              player.effects.dead = true;
            } else {
              io.to(currentGame).emit('msg', player.name + ' left.');
              if (waitingPlayer3) {
                waitingPlayer3 = null;
              } else if (waitingPlayer2) {
                waitingPlayer2 = null;
                io.to(currentGame).emit('closeGame');
                io.to(currentGame).emit('msg', 'Waiting for second player...')
              } else {
                waitingPlayer1 = null;
                let playerIndex;
                for (let i = 0; i < game.state.friendlies.length; i++) {
                  let friendly = game.state.friendlies[i];
                  if (friendly.id === player.id) {
                    playerIndex = i;
                  }
                }
                gameSession.state.friendlies.splice(playerIndex);
                gameSession.state.friendlies.join();
              }
            }
            for (person in gameSession.users) {
              if (gameSession.users[person] === user.callsign) {
                gameSession.users[person] = undefined;
                gameSession.players -= 1;
              }
            }
            if (gameSession.players === 0) {
              gameSession.gameName = gameSession._id;
              gameSession.state.game = [];
              gameSession.state.friendlies = [];
              gameSession.meta.aborted = true;
              console.log('Game id:' + gameSession._id + ' aborted');
            }
            gameSession.save(function(err) {
              if (err) {
                console.error(err);
              } else {
                console.log('user removed');
              }
            });
          });
          socket.leave(currentUser)
          console.log('user disconnected');
        });
      });
    }
  }
  let addPlayer = function() {
    GameSession.findById(currentGame, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      let p1 = false;
      let p2 = false;
      let p3 = false;
      let p4 = false;
      for (let i = 0; i < gameSession.state.friendlies.length; i++) {
        let player = gameSession.state.friendlies[i];
        if (player.id === 'Player1') {
          p1 = true;
        } else if (player.id === 'Player2') {
          p2 = true;
        } else if (player.id === 'Player3') {
          p3 = true;
        } else if (player.id === 'Player4') {
          p4 = true;
        } else {
          continue;
        }
      }
      if (!p2) {
        Player2 = new Player('Player2');
        join(Player2);
      } else if (!p3) {
        Player3 = new Player('Player3');
        join(Player3);
      } else {
        Player4 = new Player('Player4');
        join(Player4);
      }
    });
  }
  if (waitingPlayer3) {
    waitingPlayer4 = socket;
    addPlayer();
    io.to(currentGame).emit('msg', 'Game full');
    clearSockets();
  } else if (waitingPlayer2) {
    waitingPlayer3 = socket;
    addPlayer();
  } else if (waitingPlayer1) {
    waitingPlayer2 = socket;
    addPlayer();
    io.to(currentGame).emit('msg', 'Game ready');
    io.to(currentGame).emit('openGame');
  } else {
    waitingPlayer1 = socket;
    GameSession.findById(currentGame, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
      gameSession.state.friendlies.push(FriendlyBase);
      gameSession.save();
    });
    Player1 = new Player('Player1');
    join(Player1);
    socket.emit('msg', 'Waiting for second player...');
    socket.emit('firstPlayer');
    socket.on('startGame', function() {
      //protects from premature game start
      GameSession.findById(currentGame, function(err, gameSession) {
        if (err) {
          console.error(err);
        }
        if (gameSession.users.user2) {
          let update = { 'meta.locked': true, 'meta.startTime': new Date(), 'meta.endTime': new Date() };
          GameSession.update(gameSession, update, function() {
            io.to(currentGame).emit('start');
            clearSockets();
            game = new Game(gameSession._id, gameSession.difficulty);

            // can't use since database objects don't have their methods.
            // need to have the actual friendly objects in the game object,
            // and only update their properties
            // write a function that does this and can be used for turns as well
            // v
            game.friendlies = gameSession.state.friendlies;
            game.buildDecks();
            gameSession.state.game.push(game);
            gameSession.save(function(err) {
              if (err) {
                console.error(err)
              }
              updateObjects();
            });
          });
        }
      });
    });
  }
}

function updateObjects() { // needs update for database version
  game.update();
  gameData = {
    turn: currentTurn,
    game: game,
    FriendlyBase: FriendlyBase,
    enemyBase: enemyBase
  }
  if (game.friendlies.includes(Player1)) {
    gameData.Player1 = Player1;
  }
  if (game.friendlies.includes(Player2)) {
    gameData.Player2 = Player2;
  }
  if (game.friendlies.includes(Player3)) {
    gameData.Player3 = Player3;
  }
  if (game.friendlies.includes(Player4)) {
    gameData.Player4 = Player4;
  }
  io.to(currentGame).emit('update', gameData);
}

function turn(data) { // needs update for database version
  let specs = JSON.parse(data);
  let getPlayer = function(id) {
    if (id === 'Player1') {
      return Player1;
    } else if (id === 'Player2') {
      return Player2;
    } else if (id === 'Player3') {
      return Player3;
    } else if (id === 'Player4') {
      return Player4;
    } else if (id === 'FriendlyBase') {
      return FriendlyBase;
    } else if (id === 'enemyBase') {
      return enemyBase;
    }
  }
  let friendly = undefined;
  let player = getPlayer(specs.player.id);
  if (specs.friendly !== undefined) {
    friendly = getPlayer(specs.friendly.id);
  }
  if (specs.button === 'use') {
    player.useTactic(specs.cardIndex, friendly, specs.pursuerIndex);
  } else {
    player.discard(specs.cardIndex, specs.button, friendly,
                                          specs.pursuerIndex,
                                          specs.purchaseIndex);
  }

  let cardsLeft = 0;
  game.friendlies.forEach((friendly) => {
    if (friendly === FriendlyBase) {
      cardsLeft += 0;
    } else {
      cardsLeft += friendly.hand.length;
    }
  });
  if (cardsLeft === 0) {
    game.postRound();
    game.round();
    currentTurn = 0;
  } else {
    currentTurn += 1;
  }
  let resetTurns = function() {
    if (currentTurn >= game.friendlies.length
        || (currentTurn === game.friendlies.length-1
        && game.friendlies[currentTurn].id === 'FriendlyBase')
        || (currentTurn === game.friendlies.length-1
        && game.friendlies[currentTurn].effects.dead)) {
      currentTurn = 0;
    }
  }
  resetTurns();
  while (game.friendlies[currentTurn].id === 'FriendlyBase'
      || game.friendlies[currentTurn].effects.dead) {
    currentTurn += 1;
    resetTurns();
  }
  if (game.win) {
    updateObjects();
    io.to(currentGame).emit('end', 'Victory!');
    reset();
    getGameSession(currentGame, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      let endTime = new Date();
      let ms = endTime - gameSession.meta.startTime;
      let min = Math.round(ms/1000/60);
      gameSession.gameName = gameSession._id;
      gameSession.meta.rounds = gameSession.state.game.roundNumber;
      gameSession.meta.won = true;
      gameSession.meta.endTime = endTime;
      gameSession.meta.elapsedTime = min;
      gameSession.save(function(err, updated) {
        if (err) {
          console.error(err);
        }
        for (let i = 1; i < 5; i++) {
          let user = 'user' + i;
          if (gameSession.users[user]) {
            let query = { callsign: gameSession.users[user] };
            User.find(query, function(err, player) {
              let wins = player.meta.wins + 1;
              player.meta.wins = wins;
              if (wins = 21) {
                player.meta.rank = 'Admiral';
              } else if (wins = 18) {
                player.meta.rank = 'Commander';
              } else if (wins = 15) {
                player.meta.rank = 'Colonel';
              } else if (wins = 12) {
                player.meta.rank = 'Lt. Colonel';
              } else if (wins = 9) {
                player.meta.rank = 'Major';
              } else if (wins = 6) {
                player.meta.rank = 'Captain';
              } else if (wins = 3) {
                player.meta.rank = 'Lieutenant';
              }
              player.save(function(err, updated) {
                if (err) {
                  console.error(err);
                } else {
                  console.log(gameSession.users[user] + " updated");
                  if (updated.meta.wins < 22 && updated.meta.wins%3 === 0) {
                    console.log(updated.callsign + " promoted to " + updated.meta.rank);
                  }
                }
              });
            });
          } else {
            continue;
          }
        }
      });
    });
  } else if (game.lose) {
    updateObjects();
    io.to(currentGame).emit('end', 'Defeat!');
    reset();
    getGameSession(currentGame, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      let endTime = new Date();
      let ms = endTime - gameSession.meta.startTime;
      let min = Math.round(ms/1000/60);
      gameSession.gameName = gameSession._id;
      gameSession.meta.rounds = game.roundNumber;
      gameSession.meta.lost = true;
      gameSession.meta.endTime = endTime;
      gameSession.meta.elapsedTime = min;
      gameSession.save(function(err, updated) {
        if (err) {
          console.error(err);
        }
        for (let i = 1; i < 5; i++) {
          let user = 'user' + i;
          if (gameSession.users[user]) {
            let query = { callsign: gameSession.users[user] };
            let update = { $inc: { 'meta.losses': 1 }};
            User.update(query, update, function() {
              console.log(gameSession.users[user] + " updated");
            });
          } else {
            continue;
          }
        }
      });
    });
  } else {
    updateObjects();
  }
}
