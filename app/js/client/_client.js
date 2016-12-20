var sock = io();
let user;

let game;
let Player1;
let Player2;
let Player3;
let Player4;
let FriendlyBase;
let enemyBase;

sock.on("msg", onMessage);
sock.on("assign", assignPlayer);
sock.on("update", getUpdate);

function getUpdate(packet) {
  console.log("Server sent an update");
  console.dir(packet);
  game = packet.game;
  Player1 = packet.Player1;
  Player2 = packet.Player2;
  FriendlyBase = packet.FriendlyBase;
  enemyBase = packet.enemyBase;
  if (packet.Player3) {
    Player3 = packet.Player3;
  }
  if (packet.Player4) {
    Player4 = packet.Player4;
  }
  update();
}

function assignPlayer(player) {
  user = player;
  console.log(user.name + " joined game as " + user.id);
}

function onMessage(text) {
  typeWord($("#status"), ">>  " + text, "li");
}
