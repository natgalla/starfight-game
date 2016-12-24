let root = __dirname;
let port = 8080;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketio(server);

let waitingPlayer1;
let waitingPlayer2;
let waitingPlayer3;

let currentTurn;

let session = {
  turn: currentTurn,
  game: game,
  FriendlyBase: FriendlyBase,
  Player1: Player1,
  Player2: Player2,
  enemyBase: enemyBase
}

io.on("connect", onConnection);

app.use(express.static(root + "/.."));

server.listen(port, () => console.log("Ready. Listening at http://localhost:" + port));

function validateNormalCharacters(string) {
  let valid = true;
  for (let i=0; i < string.length; i++) {
    let character = string[i];
    if (!"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".includes(character)) {
      valid = false;
    }
  }
  return valid;
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
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
  socket.emit("msg", "Connection established.");
  let join = function(player) {
    game.friendlies.push(player);
    socket.emit("assign", player);
    socket.on("turn", turn);
    socket.on("chat", function(message) {
      io.sockets.emit("chatMessage", message);
    });
    io.sockets.emit("msg", player.name + " joined game as " + player.id);
  }
  if (waitingPlayer3) {
    waitingPlayer4 = socket;
    Player4 = new Player("Player4", "Alan");
    join(Player4);
    io.sockets.emit("msg", "Game full");
    clearSockets();
  } else if (waitingPlayer2) {
    waitingPlayer3 = socket;
    Player3 = new Player("Player3", "Ruth");
    join(Player3);
  } else if (waitingPlayer1) {
    waitingPlayer2 = socket;
    Player2 = new Player("Player2", "Rudi");
    join(Player2);
    io.sockets.emit("msg", "Game ready");
    io.sockets.emit("openGame");
  } else {
    waitingPlayer1 = socket;
    Player1 = new Player("Player1", "Nathan");
    join(Player1);
    socket.emit("msg", "Waiting for second player...");
    socket.emit("firstPlayer");
    socket.on("startGame", function() {
      if (game.friendlies.includes(Player2)) { //protects from premature game start
        io.sockets.emit("start");
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
  session = {
    turn: currentTurn,
    game: game,
    FriendlyBase: FriendlyBase,
    enemyBase: enemyBase
  }
  if (game.friendlies.includes(Player1)) {
    session.Player1 = Player1;
  }
  if (game.friendlies.includes(Player2)) {
    session.Player2 = Player2;
  }
  if (game.friendlies.includes(Player3)) {
    session.Player3 = Player3;
  }
  if (game.friendlies.includes(Player4)) {
    session.Player4 = Player4;
  }
  io.sockets.emit("update", session);
}

function turn(data) {
  let specs = JSON.parse(data);
  let getPlayer = function(id) {
    if (id === "Player1") {
      return Player1;
    } else if (id === "Player2") {
      return Player2;
    } else if (id === "Player3") {
      return Player3;
    } else if (id === "Player4") {
      return Player4;
    } else if (id === "FriendlyBase") {
      return FriendlyBase;
    } else if (id === "enemyBase") {
      return enemyBase;
    }
  }
  let player = getPlayer(specs.player.id);
  let friendly = getPlayer(specs.friendly.id);
  if (specs.button === "use") {
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
      && game.friendlies[currentTurn].id === "FriendlyBase")) {
    currentTurn = 0;
  }
  if (game.friendlies[currentTurn].id === "FriendlyBase") {
    currentTurn += 1;
  }
  if (game.win) {
    console.log("Game won");
    updateObjects();
    io.sockets.emit("win", "Victory!");
    reset();
  } else if (game.lose) {
    console.log("Game lost");
    updateObjects();
    io.sockets.emit("lose", "Defeat!");
    reset();
  } else {
    updateObjects();
  }
}
