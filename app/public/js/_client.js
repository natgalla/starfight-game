var sock = io();
var user;
var userTurn = false;

var game;
var Player1;
var Player2;
var Player3;
var Player4;
var FriendlyBase;
var enemyBase;
var turn;

sock.on("msg", onMessage);
sock.on("assign", assignPlayer);
sock.on("update", getUpdate);
sock.on("win", victory);
sock.on("lose", defeat);
sock.on("chatMessage", onChat);
sock.on("openGame", onOpen);
sock.on("firstPlayer", onFirst);
sock.on("start", onStart);

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

function onOpen() {
  $("#play").removeClass("disabled");
  $("#play").addClass("enabled");
  $("#info").removeClass("menu");
  $("#play").text("LAUNCH");
}

function onChat(text) {
  $("#status").prepend( "<li class='playerMessage'> >>  " + text + "<li>");
}

function onFirst() {
  let $play = $("<button>", {id: "play", text: "STANDBY", class: "disabled"});
  $("#room").append($play);
  $play.on("click", function() {
    if($(this).hasClass("enabled")) {
      sock.emit("startGame");
    }
  });
}

function onStart() {
  $("body").prepend($("#info"));
  $("#room").remove();
  $("#title").remove();
  $(".copyright").hide();
  $("h3").hide();
  $("#info").addClass("messages");
  $("#playArea").fadeIn();
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
