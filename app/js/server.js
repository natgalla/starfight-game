'use strict';

let application_root = __dirname;
let port = 8080;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');
// let game = require("./game");

let app = express();
let server = http.createServer(app);
let io = socketio(server);

let waitingPlayer;

let testPacket = {
  game: "test1",
  friendlyBase: "test2",
  player1: "test3",
  player2: "test4",
  enemyBase: "test5"
}

io.on("connect", onConnection);

app.use(express.static(application_root + "/.."));

server.listen(port, () => console.log("Ready. Listening at http://localhost:" + port));

app.post("/", function(req, res) {
  console.log("POST request to home page");
  let body = "";
  req.on("data", function(data) {
    body += data;
  })
  req.on("end", function() {
    let specs = JSON.parse(body);
    // if (specs.button === "use") {
    //   game.friendlies[specs.player].useTactic(specs.cardIndex,
    //                                           game.friendlies[specs.friendly],
    //                                           specs.pursuerIndex);
    // } else {
    //   game.friendlies[specs.player].discard(specs.cardIndex,
    //                                         specs.button,
    //                                         game.friendlies[specs.friendly],
    //                                         specs.pursuerIndex,
    //                                         specs.purchaseIndex);
    // }
    console.log(specs);
    updateObjects();
  });
  res.send("Server received the request");
});

function onConnection(socket) {
  socket.emit("msg", "Connection established.");
  if(waitingPlayer) {
    socket.emit("assign", "Player2");
    notifyGameReady(waitingPlayer, socket);
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit("msg", "Waiting for second player...");
    socket.emit("assign", "Player1")
  }
}

function notifyGameReady(...sockets) {
  sockets.forEach((socket) => {
    socket.emit("msg", "Game Ready");
    // socket.emit("update", packet);
  });
}

function updateObjects(vars) {
  // let packet = {
  //   game: game,
  //   friendlyBase: FriendlyBase,
  //   player1: Player1,
  //   player2: Player2,
  //   enemyBase: enemyBase
  // }
  console.log("A card was played");
  console.log(vars);
  testPacket = {
    game: "test1",
    FriendlyBase: "test2",
    Player1: "test3",
    Player2: "test4",
    Player3: "test5",
    enemyBase: "test6"
  }
  sockets.forEach((socket) => {
    socket.emit("update", testPacket);
  });
}

io.on("confirm", updateObjects);
  // if (packet.button === "use") {
  //   packet.player.useTactic(packet.cardIndex, packet.friendly, packet.pursuerIndex); //server will run
  // } else {
  //   packet.player.discard(packet.cardIndex, packet.action, packet.friendly, packet.pursuerIndex, packet.purchaseIndex); //server will run
  // };
// });
