// function getCookie(cname) {
//     var name = cname + "=";
//     var decodedCookie = decodeURIComponent(document.cookie);
//     var ca = decodedCookie.split(';');
//     for(var i = 0; i <ca.length; i++) {
//         var c = ca[i];
//         while (c.charAt(0) == ' ') {
//             c = c.substring(1);
//         }
//         if (c.indexOf(name) == 0) {
//             return c.substring(name.length, c.length);
//         }
//     }
//     return "";
// }

// var sock = io('/' + getCookie('gameName'));

var sock = io();
var room;

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
sock.on("chatMessage", onChat);
sock.on("end", centerMessage);
sock.on("assign", assignPlayer);
sock.on("update", getUpdate);
sock.on("openGame", openGame);
sock.on("closeGame", closeGame);
sock.on("firstPlayer", onFirst);
sock.on("start", onStart);

$("#chat").submit(function() {
  sock.emit("chat", { room: room, message: user.name + ": " + $("#message").val() });
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

function assignPlayer(info) {
  user = info.player;
  room = info.room;
}

function onMessage(text) {
  typeWord($("#status"), ">>  " + text, "li");
}

function openGame() {
  $("#play").removeClass("disabled");
  $("#play").addClass("enabled");
  $("#play").text("LAUNCH");
}

function closeGame() {
  $("#play").addClass("disabled");
  $("#play").removeClass("enabled");
  $("#play").text("STANDBY");
}

function onChat(text) {
  $("#status").prepend( "<li class='playerMessage'> >>  " + text + "<li>");
}

function onFirst() {
  let $play = $("<button>", {id: "play", text: "STANDBY", class: "disabled"});
  $("#room").append($play);
  $play.on("click", function() {
    if($(this).hasClass("enabled")) {
      sock.emit("startGame", {room: room});
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

function centerMessage(text) {
  disableSelect();
  let $message = $("<h1>", {id: "centerMessage", text: text})
  $("body").append($message);
  $message.hide();
  $message.fadeIn(800);
}
