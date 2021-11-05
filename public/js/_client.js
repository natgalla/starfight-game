var room = getCookie('gameId');
var userId = getCookie('userId');
var sock = io('/', { query: "room=" + room + "&user=" + userId });

var user;
var userTurn = false;

var game;
var Player1;
var Player2;
var Player3;
var Player4;
var FriendlyBase;

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

sock.on("msg", onMessage);
sock.on("chatMessage", onChat);
sock.on("end", onEnd);
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
  game = packet.game;
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly.id === 'FriendlyBase') {
      FriendlyBase = friendly;
    } else if (friendly.id === 'Player1') {
      Player1 = friendly;
    } else if (friendly.id === 'Player2') {
      Player2 = friendly;
    } else if (friendly.id === 'Player3') {
      Player3 = friendly;
    } else if (friendly.id === 'Player4') {
      Player4 = friendly;
    }
  }
  update();
}

function assignPlayer(info) {
  user = info.player;
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
  $('#play').remove();
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
  $(".nameReminder").remove();
  $("h3").hide();
  $("#info").addClass("messages");
  $("#playArea").fadeIn();
}

function centerMessage(text) {
  disableSelect();
  let $holder = $("<div>", {id: "centerMessage"});
  let $message = $("<h1>", {text: text});
  $holder.append($message);
  $("body").append($holder);
  $holder.hide();
  $holder.slideDown(800);
}

function onEnd(text) {
  centerMessage(text);
  $('#centerMessage').append("<p class='link'><a href='/profile'>View profile</a></p>")
  $(window).off("beforeunload");
}

$(window).on("beforeunload", function() {
  return "Leaving or refreshing this page will remove your pilot from the game.";
});
