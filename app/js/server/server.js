
let root = __dirname;
let port = 8080;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');
// let game = require("./game");

let app = express();
let server = http.createServer(app);
let io = socketio(server);

let waitingPlayer;

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
      game.round();
      res.send("Game started.");
      updateObjects();
    }
  });
});

function onConnection(socket) {
  socket.emit("msg", "Connection established.");
  if(waitingPlayer) {
    socket.emit("assign", Player2);
    socket.on("turn", turn);
    notifyGameReady(waitingPlayer, socket);
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit("msg", "Waiting for second player...");
    socket.emit("assign", Player1)
    socket.on("turn", turn);
  }
}

function notifyGameReady(...sockets) {
  sockets.forEach((socket) => {
    socket.emit("msg", "Game Ready");
  });
}

function updateObjects(vars) {
  let packet = {
    game: game,
    FriendlyBase: FriendlyBase,
    Player1: Player1,
    Player2: Player2,
    enemyBase: enemyBase
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
