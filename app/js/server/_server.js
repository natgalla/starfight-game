let root = __dirname;
let port = process.env.PORT || 8080;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let app = express();
let server = http.createServer(app);
let io = socketio(server);
let User = require('./js/models/user');
let MongoStore = require('connect-mongo')(session);
let currentUser;

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
  currentUser = req.session.userId;
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
  res.status(err.status || 500);
  res.render('error', {
    statusMessage: err.message || 'There was en error processing your request',
    error: {}
  });
});

server.listen(port, () => console.log('Ready. Listening at http://localhost:' + port));


// game logic
io.on('connect', onConnection);

let waitingPlayer1;
let waitingPlayer2;
let waitingPlayer3;

let currentTurn;

let gameSession = {
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

function onConnection(socket) {
  socket.emit('msg', 'Connection established.');
  let join = function(player) {
    let setName = function(userId, callback) {
      User.findById(userId, function(error, user) {
        if (error) {
          callback(err, null);
        } else {
          callback(null, user);
        }
      });
    }
    if (currentUser) {
      setName(currentUser, function(err, user) {
        if (err) {
          console.error(err);
        }
        player.name = user.callsign;
        game.friendlies.push(player);
        socket.emit('assign', player);
        socket.on('turn', turn);
        socket.on('chat', function(message) {
          io.sockets.emit('chatMessage', message);
        });
        io.sockets.emit('msg', player.name + ' joined game as ' + player.id);
      });
    }
  }
  if (waitingPlayer3) {
    waitingPlayer4 = socket;
    Player4 = new Player('Player4');
    join(Player4);
    io.sockets.emit('msg', 'Game full');
    clearSockets();
  } else if (waitingPlayer2) {
    waitingPlayer3 = socket;
    Player3 = new Player('Player3');
    join(Player3);
  } else if (waitingPlayer1) {
    waitingPlayer2 = socket;
    Player2 = new Player('Player2');
    join(Player2);
    io.sockets.emit('msg', 'Game ready');
    io.sockets.emit('openGame');
  } else {
    waitingPlayer1 = socket;
    Player1 = new Player('Player1');
    join(Player1);
    socket.emit('msg', 'Waiting for second player...');
    socket.emit('firstPlayer');
    socket.on('startGame', function() {
      if (game.friendlies.includes(Player2)) { //protects from premature game start
        io.sockets.emit('start');
        currentTurn = 1;
        clearSockets();
        startGame(game);
        updateObjects();
      }
    });
  }
}

function updateObjects() {
  game.update();
  gameSession = {
    turn: currentTurn,
    game: game,
    FriendlyBase: FriendlyBase,
    enemyBase: enemyBase
  }
  if (game.friendlies.includes(Player1)) {
    gameSession.Player1 = Player1;
  }
  if (game.friendlies.includes(Player2)) {
    gameSession.Player2 = Player2;
  }
  if (game.friendlies.includes(Player3)) {
    gameSession.Player3 = Player3;
  }
  if (game.friendlies.includes(Player4)) {
    gameSession.Player4 = Player4;
  }
  io.sockets.emit('update', gameSession);
}

function turn(data) {
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
  if (currentTurn === game.friendlies.length
    || (currentTurn === game.friendlies.length-1
      && game.friendlies[currentTurn].id === 'FriendlyBase')) {
    currentTurn = 0;
  }
  if (game.friendlies[currentTurn].id === 'FriendlyBase') {
    currentTurn += 1;
  }
  if (game.win) {
    // increment currentUser's meta.wins
    // check to see if currentUser should be promoted
    console.log('Game won');
    updateObjects();
    io.sockets.emit('end', 'Victory!');
    reset();
  } else if (game.lose) {
    // increment currentUser's meta.losses
    console.log('Game lost');
    updateObjects();
    io.sockets.emit('end', 'Defeat!');
    reset();
  } else {
    updateObjects();
  }
}
