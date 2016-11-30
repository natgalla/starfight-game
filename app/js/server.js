'use strict';

let application_root = __dirname;
let port = 8080;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketio(server);

io.on("connection", (socket) => socket.emit("msg", "Connection established."));

app.use(express.static(application_root + "/.."));

server.listen(port, () => console.log("Ready. Listening at " + port));
