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

let packet = {
  game: game,
  FriendlyBase: FriendlyBase,
  Player1: Player1,
  Player2: Player2,
  enemyBase: enemyBase
}

io.on("connect", onConnection);

app.use(express.static(root + "/.."));

server.listen(port, () => console.log("Ready. Listening at http://localhost:" + port));

app.post("/", function(req, res) {
  console.log("POST request to home page");
  let body = "";
  req.on("data", function(data) {
    body += data;
  });
  req.on("end", function() {
    if (body === "start") {
      waitingPlayer1 = null;
      waitingPlayer2 = null;
      waitingPlayer3 = null;
      startGame(game);
      res.send("Game started.");
      updateObjects();
    }
  });
});

function createGame(sessionName) {
  let nsp = io.of('/' + sessionName);
  nsp.on('connection', onConnection);
}

function onConnection(socket) {
  socket.emit("msg", "Connection established.");
  if(waitingPlayer3) {
    waitingPlayer4 = socket;
    game.friendlies.push(Player4);
    socket.emit("assign", Player4);
    socket.on("turn", turn);
    io.sockets.emit("msg", Player4.name + " joined game as " + Player4.id);
    io.sockets.emit("msg", "Game full");
    waitingPlayer1 = null;
    waitingPlayer2 = null;
    waitingPlayer3 = null;
  } else if (waitingPlayer2) {
    waitingPlayer3 = socket;
    game.friendlies.push(Player3);
    socket.emit("assign", Player3);
    socket.on("turn", turn);
    io.sockets.emit("msg", Player3.name + " joined game as " + Player3.id);
  } else if(waitingPlayer1) {
    waitingPlayer2 = socket;
    socket.emit("assign", Player2);
    socket.on("turn", turn);
    io.sockets.emit("msg", Player2.name + " joined game as " + Player2.id);
    io.sockets.emit("msg", "Game ready");
    // waitingPlayer = null;
  } else {
    waitingPlayer1 = socket;
    socket.emit("msg", "You initiated game as " + Player1.id);
    socket.emit("msg", "Waiting for second player...");
    socket.emit("assign", Player1)
    socket.on("turn", turn);
  }
}

function updateObjects(vars) {
  game.update();
  let packet = {
    game: game,
    FriendlyBase: FriendlyBase,
    Player1: Player1,
    Player2: Player2,
    enemyBase: enemyBase
  }
  if (game.friendlies.includes(Player4)) {
    packet.Player4 = Player4;
  }
  if (game.friendlies.includes(Player3)) {
    packet.Player3 = Player3;
  }
  io.sockets.emit("update", packet);
}

function turn(data) {
  console.log("Confirm receipt of turn info");
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
  let cardsLeft;
  game.friendlies.forEach((friendly) => {
    if (friendly === FriendlyBase) {
      return;
    } else {
      cardsLeft += friendly.hand.length;
    }
  });
  if (cardsLeft === 0) {
    game.postRound();
    game.round();
  }
  updateObjects();
}
