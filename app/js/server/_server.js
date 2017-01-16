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
let gameTitle = "Contact!";
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
      gameTitle: gameTitle,
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
//     if (!gameSessions.includes(gameSession) && gameSession._id != gameSession.gameName) {
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

function saveGameState(game) {
  GameSession.findById(game.gameID, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    gameSession.state.game = [game];
    gameSession.save(function(err, updatedSession) {
      if (err) {
        console.error(err);
      } else {
        updateObjects(game.gameID, updatedSession);
      }
    });
  });
}

function onConnection(socket) {
  let gameId = currentGame;
  let userId = currentUser;
  function join(player) {
    socket.join(gameId);
    getUser(userId, function(err, user) {
      if (err) {
        console.error(err);
      }
      player.name = user.callsign;
      console.log(user.callsign + ' joined ' + gameId + ' as ' + player.id);
      socket.emit('assign', { player: player, room: gameId } );
      socket.on('turn', turn);
      socket.on('chat', function(data) {
        io.to(data.room).emit('chatMessage', data.message);
      });
      io.to(gameId).emit('msg', player.name + ' joined the game.');
      socket.on('disconnect', function() {
        GameSession.findById(gameId, function(err, gameSession) {
          if (err) {
            console.error(err);
          }
          if (gameSession.locked) {
            player.effects.dead = true;
            saveGameState(game);
          } else {
            io.to(gameId).emit('msg', player.name + ' left.');
          }
          for (person in gameSession.users) {
            if (gameSession.users[person] === user.callsign) {
              gameSession.users[person] = undefined;
              gameSession.players -= 1;
            }
          }
          if (gameSession.players === 1) {
            io.to(gameId).emit('closeGame');
            io.to(gameId).emit('msg', 'Waiting for second player...')
          } else if (gameSession.players === 0) {
            gameSession.gameName = gameSession._id;
            gameSession.state.game = [];
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
        socket.leave(gameId)
        console.log('user disconnected');
      });
    });
  }
  function addPlayer(gameId, userId) {
    getGameSession(gameId, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      getUser(userId, function(err, user) {
        if (err) {
          console.error(err);
        }
        if (gameSession.users.user1 === user.callsign) {
          let Player1 = new Player('Player1');
          join(Player1);
        } else if (gameSession.users.user2 === user.callsign) {
          let Player2 = new Player('Player2');
          join(Player2);
        } else if (gameSession.users.user3 === user.callsign) {
          let Player3 = new Player('Player3');
          join(Player3);
        } else if (gameSession.users.user4 === user.callsign) {
          let Player4 = new Player('Player4');
          join(Player4);
        }
      });
    });
  }
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    if (gameSession.players === 4) {
      addPlayer(gameId, userId);
      io.to(gameId).emit('msg', 'Game full');
    } else if (gameSession.players === 3) {
      addPlayer(gameId, userId);
    } else if (gameSession.players === 2) {
      addPlayer(gameId, userId);
      io.to(gameId).emit('msg', 'Game ready');
      io.to(gameId).emit('openGame');
    } else {
      let Player1 = new Player('Player1');
      join(Player1);
      socket.emit('msg', 'Waiting for second player...');
      socket.emit('firstPlayer');
      socket.on('startGame', function(data) {
        let gameId = data.room;
        getGameSession(gameId, function(err, gameSession) {
          if (err) {
            console.error(err);
          }
          if (gameSession.players >= 2) {
            let update = { 'meta.locked': true, 'meta.startTime': new Date(), 'meta.endTime': new Date() };
            GameSession.update(gameSession, update, function() {
              io.to(gameId).emit('start');
              let game = new Game(gameSession._id, gameSession.difficulty);
              let FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
              let Player1;
              let Player2;
              let Player3;
              let Player4;
              game.friendlies = [FriendlyBase];
              if (gameSession.users.user1) {
                Player1 = new Player('Player1', gameSession.users.user1);
                game.friendlies.push(Player1);
              }
              if (gameSession.users.user2) {
                Player2 = new Player('Player2', gameSession.users.user2);
                game.friendlies.push(Player2);
              }
              if (gameSession.users.user3) {
                Player3 = new Player('Player3', gameSession.users.user3);
                game.friendlies.push(Player3);
              }
              if (gameSession.users.user4) {
                Player4 = new Player('Player4', gameSession.users.user4);
                game.friendlies.push(Player4);
              }
              game.buildDecks();
              game.round();
              gameSession.state.game.push(game);
              gameSession.save(function(err, updatedSession) {
                if (err) {
                  console.error(err)
                }
                updateObjects(gameId, updatedSession);
              });
            });
          } else {
            console.log('Error launching game.');
          }
        });
      });
    }
  });
}

function updateObjects(gameId, gameSession) {
  let gameData = {
    game: gameSession.state.game[0],
  }
  io.to(gameId).emit('update', gameData);
}

function turn(data) {
  let gameId = data.room;
  let specs = data.turnInfo;
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    let game = new Game();
    let FriendlyBase = new Friendly('FriendlyBase', 'Friendly Base', 30);
    let Player1 = new Player('Player1');
    let Player2 = new Player('Player2');
    let Player3 = new Player('Player3');
    let Player4 = new Player('Player4');
    let gameState = gameSession.state.game[0];
    let loadPlayer = function(player, friendly) {
      player.name = friendly.name;
      player.currentArmor = friendly.currentArmor;
      player.lastCardUsed = friendly.lastCardUsed;
      player.hand = friendly.hand;
      player.pursuers = friendly.pursuers;
      player.pursuerDamage = friendly.pursuerDamage;
      player.merit = friendly.merit;
      player.effects = friendly.effects;
      game.friendlies.push(player);
    }
    for (let i = 0; i < gameState.friendlies.length; i++) {
      let friendly = gameState.friendlies[i];
      if (friendly.id === 'FriendlyBase') {
        FriendlyBase.pursuers = friendly.pursuers;
        FriendlyBase.pursuerDamage = friendly.pursuerDamage;
        FriendlyBase.effects = friendly.effects;
        FriendlyBase.currentArmor = friendly.currentArmor;
        game.friendlies.push(FriendlyBase);
      } else if (friendly.id === 'Player1') {
        loadPlayer(Player1, friendly);
      } else if (friendly.id === 'Player2') {
        loadPlayer(Player2, friendly);
      } else if (friendly.id === 'Player3') {
        loadPlayer(Player3, friendly);
      } else if (friendly.id === 'Player4') {
        loadPlayer(Player4, friendly);
      }
    }
    game.roundNumber = gameState.roundNumber;
    game.currentTurn = gameState.currentTurn;
    game.tacticalDeck = gameState.tacticalDeck;
    game.advTactics = gameState.advTactics;
    game.enemyBaseDeck = gameState.enemyBaseDeck;
    game.enemyDeck = gameState.enemyDeck;
    game.market = gameState.market;
    game.enemiesActive = gameState.enemiesActive;
    game.enemiesPerTurn = gameState.enemiesPerTurn;
    game.currentEnemyBaseCard = gameState.currentEnemyBaseCard;
    game.gameID = gameState.gameID;
    game.win = gameState.win;
    game.lose = gameState.lose;
    game.enemiesPerTurn = gameState.enemiesPerTurn;
    game.enemyBase.currentArmor = gameState.enemyBase.currentArmor;
    game.enemyBase.effects = gameState.enemyBase.effects;

    let getPlayer = function(id) {
      for (let i=0; i < game.friendlies.length; i++) {
        let friendly = game.friendlies[i];
        if (id === friendly.id) {
          return friendly;
        } else if (id === game.enemyBase.id) {
          return game.enemyBase;
        }
      }
    }
    let friendly = undefined;
    let player = getPlayer(specs.player.id);
    if (specs.friendly !== undefined) {
      friendly = getPlayer(specs.friendly.id);
    }
    if (specs.button === 'use') {
      game = player.useTactic(game, specs.cardIndex, friendly, specs.pursuerIndex);
    } else {
      game = player.discard(game, specs.cardIndex, specs.button, friendly,
                                            specs.pursuerIndex,
                                            specs.purchaseIndex);
    }
    if (game.win) {
      // saveGameState(game);
      io.to(gameId).emit('end', 'Victory!');
      getGameSession(gameId, function(err, gameSession) {
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
        gameSession.save(function(err, updatedSession) {
          if (err) {
            console.error(err);
          }
          for (let i = 1; i < 5; i++) {
            let user = 'user' + i;
            if (updatedSession.users[user]) {
              let query = { callsign: updatedSession.users[user] };
              User.find(query, function(err, player) {
                if (err) {
                  console.error(err);
                }
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
                player.save(function(err, updatedUser) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(updatedSession.users[user] + " updated");
                    if (updatedUser.meta.wins < 22 && updatedUser.meta.wins%3 === 0) {
                      console.log(updatedUser.callsign + " promoted to " + updatedUser.meta.rank);
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
      // saveGameState(game);
      io.to(gameId).emit('end', 'Defeat!');
      getGameSession(gameId, function(err, gameSession) {
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
        gameSession.save(function(err, updatedSession) {
          if (err) {
            console.error(err);
          }
          for (let i = 1; i < 5; i++) {
            let user = 'user' + i;
            if (updatedSession.users[user]) {
              let query = { callsign: updatedSession.users[user] };
              let update = { $inc: { 'meta.losses': 1 }};
              User.update(query, update, function() {
                console.log(updatedSession.users[user] + " updated");
              });
            } else {
              continue;
            }
          }
        });
      });
    } else {
      saveGameState(game);
    }
  });
}
