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

function loadGameState(gameId, specs, callback) {
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    let game = new Game();
    let FriendlyBase = new Friendly();
    let Player1 = new Player();
    let Player2 = new Player();
    let Player3 = new Player();
    let Player4 = new Player();
    let enemyBase = new EnemyBase();
    let gameState = gameSession.state.game[0];
    let updatePlayer = function(player, friendly) {
      player.name = friendly.name;
      player.currentArmor = friendly.currentArmor;
      player.lastCardUsed = friendly.lastCardUsed;
      player.hand = friendly.hand;
      player.pursuers = friendly.pursuers;
      player.pursuerDamage = friendly.pursuerDamage;
      player.merit = friendly.merit;
      player.effects = friendly.effects;
    }
    game.roundNumber = gameState.roundNumber;
    for (let i = 0; i < gameState.friendlies.length; i++) {
      let friendly = gameState.friendlies[i];
      if (friendly.id === FriendlyBase.id) {
        FriendlyBase.pursuers = friendly.pursuers;
        FriendlyBase.pursuerDamage = friendly.pursuerDamage;
        FriendlyBase.effects = friendly.effects.
        FriendlyBase.currentArmor = friendly.currentArmor;
        gameSession.friendlies.push(friendly);
      } else if (friendly.id === Player1.id) {
        updatePlayer(Player1, friendly);
      } else if (friendly.id === Player2.id) {
        updatePlayer(Player2, friendly);
      } else if (friendly.id === Player3.id) {
        updatePlayer(Player3, friendly);
      } else if (friendly.id === Player4.id) {
        updatePlayer(Player4, friendly);
      }
    }
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

    let ebState = gameSession.state.enemyBase[0];
    enemyBase.currentArmor = ebState.currentArmor;
    enemyBase.effects = ebState.effects;

    game.update();

    if(callback) {
      callback(gameSession);
    }
  });
}

function saveGameState(gameId, game, enemyBase, currentTurn) {
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    if (currentTurn === undefined) {
      currentTurn = 1;
    }
    game.update();
    gameSession.state.currentTurn = currentTurn;

    gameSession.state.game[0].roundNumber = game.roundNumber;
    gameSession.state.game[0].friendlies = game.friendlies;
    gameSession.state.game[0].tacticalDeck = game.tacticalDeck;
    gameSession.state.game[0].advTactics = game.advTactics;
    gameSession.state.game[0].enemyBaseDeck = game.enemyBaseDeck;
    gameSession.state.game[0].enemyDeck = game.enemyDeck;
    gameSession.state.game[0].market = game.market;
    gameSession.state.game[0].enemiesActive = game.enemiesActive;
    gameSession.state.game[0].enemiesPerTurn = game.enemiesPerTurn;
    gameSession.state.game[0].currentEnemyBaseCard = game.currentEnemyBaseCard;
    gameSession.state.game[0].gameID = game.gameID;
    gameSession.state.game[0].win = game.win;
    gameSession.state.game[0].lose = game.lose;

    gameSession.state.enemyBase[0].currentArmor = enemyBase.currentArmor;
    gameSession.state.enemyBase[0].effects = enemyBase.effects;

    gameSession.save(function(err) {
      if (err) {
        console.error(err);
      } else {
        updateObjects(gameId, gameSession);
      }
    });
  });
}

function onConnection(socket) {
  let gameId = currentGame;
  let userId = currentUser;
  let join = function(player) {
    if(gameId) {
      gameId
      socket.join(gameId);
      console.log('A user joined room ' + gameId);
    }
    if (userId) {
      userId = currentUser;
      getUser(userId, function(err, user) {
        if (err) {
          console.error(err);
        }
        player.name = user.callsign;
        console.log('Game: ' + gameId + ' Assigning ' + user.callsign + ' to ' + player.id);
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
              saveGameState(gameId, game, enemyBase);
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
          socket.leave(userId)
          console.log('user disconnected');
        });
      });
    }
  }
  let addPlayer = function(gameId, userId) {
    getGameSession(gameId, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      getUser(userId, function(err, user) {
        if (err) {
          console.error(err);
        }
        if (gameSession.users.user1 === user.callsign) {
          Player1 = new Player('Player1');
          join(Player1);
        } else if (gameSession.users.user2 === user.callsign) {
          Player2 = new Player('Player2');
          join(Player2);
        } else if (gameSession.users.user3 === user.callsign) {
          Player3 = new Player('Player3');
          join(Player3);
        } else if (gameSession.users.user4 === user.callsign) {
          Player4 = new Player('Player4');
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
      Player1 = new Player('Player1');
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
              game = new Game(gameSession._id, gameSession.difficulty);
              enemyBase = new EnemyBase();
              game.friendlies = [FriendlyBase]
              if (gameSession.users.user1) {
                Player2 = new Player('Player2', gameSession.users.user2);
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
              gameSession.state.enemyBase.push(enemyBase);
              gameSession.save(function(err) {
                if (err) {
                  console.error(err)
                }
                saveGameState(gameId, game, enemyBase);
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
    turn: gameSession.state.currentTurn,
    game: gameSession.state.game[0],
    enemyBase: gameSession.state.enemyBase[0]
  }
  for (let i = 0; i < gameSession.state.game[0].friendlies.length; i++) {
    let friendly = gameSession.state.game[0].friendlies[i];
    if (friendly.id === "FriendlyBase") {
      gameData.FriendlyBase = friendly;
    } else if (friendly.id === "Player1") {
      gameData.Player1 = friendly;
    } else if (friendly.id === "Player2") {
      gameData.Player2 = friendly;
    } else if (friendly.id === "Player3") {
      gameData.Player3 = friendly;
    } else if (friendly.id === "Player4") {
      gameData.Player4 = friendly;
    }
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
  io.to(gameId).emit('update', gameData);
}

function turn(data) {
  console.log(data);
  let gameId = data.room;
  let specs = data.turnInfo;
  loadGameState(gameId, specs, function(gameSession) {
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
    let currentTurn = gameSession.state.currentTurn;
    if (cardsLeft === 0) {
      game.postRound(); // throwing error: can't read property 'jammed' of undefined
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
      saveGameState(gameId, game, enemyBase, currentTurn);
      io.to(gameId).emit('end', 'Victory!');
      reset();
      getGameSession(gameId, function(err, gameSession) {
        if (err) {
          console.error(err);
        }
        let endTime = new Date();
        let ms = endTime - gameSession.meta.startTime;
        let min = Math.round(ms/1000/60);
        gameSession.state.currentTurn = currentTurn;
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
      saveGameState(gameId, game, enemyBase, currentTurn);
      io.to(gameId).emit('end', 'Defeat!');
      reset();
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
      saveGameState(gameId, game, enemyBase, currentTurn);
    }
  });
}
