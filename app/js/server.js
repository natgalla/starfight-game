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

io.on("connection", onConnection);

app.use(express.static(application_root + "/.."));

server.listen(port, () => console.log("Ready. Listening at " + port));

function onConnection(socket) {
  socket.emit("msg", "Connection established.");
  if(waitingPlayer) {
    notifyGameReady(waitingPlayer, socket);
    // new Game(waitingPlayer, sock);
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit("msg", "Waiting for second player...");
  }
}

function notifyGameReady(...sockets) {
  sockets.forEach((socket) => socket.emit("msg", "Game Ready"));
}
