var sock = io();
let user;
let userTurn = false;

let game;
let Player1;
let Player2;
let Player3;
let Player4;
let FriendlyBase;
let enemyBase;
let turn;

sock.on("msg", onMessage);
sock.on("assign", assignPlayer);
sock.on("update", getUpdate);
sock.on("win", victory);
sock.on("lose", defeat);
sock.on("chatMessage", onChat);

$("#chat").submit(function() {
  sock.emit("chat", user.name + ": " + $("#message").val());
  $("#message").val("");
  return false;
})

function getUpdate(packet) {
  turn = packet.turn;
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

function onChat(text) {
  $("#status").prepend( "<li class='playerMessage'> >>  " + text + "<li>");
}

function victory(text) {
  disableSelect();
  let $victory = $("<h1>", {id: "victory", text: text})
  $("body").append($victory);
}

function defeat(text) {
  disableSelect();
  let $defeat = $("<h1>", {id: "defeat", text: text})
  $("body").append($defeat);
}
