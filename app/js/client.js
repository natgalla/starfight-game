var sock = io();
let user;

// let game;
// let Player1;
// let Player2;
// let Player3;
// let FriendlyBase;
// let enemyBase;

sock.on("msg", onMessage);
sock.on("assign", assignPlayer);
sock.on("update", getUpdate);

function getUpdate(packet) {
  console.log("Server sent an update");
  console.dir(packet);
  // game = packet.game;
  // Player1 = packet.Player1;
  // Player2 = packet.Player2;
  // Player3 = packet.Player3;
  // FriendlyBase = packet.FriendlyBase;
  // enemyBase = packet.enemyBase;
  update();
}

function assignPlayer(player) {
  if (player === "Player1") {
    user = Player1;
  } else if (player === "Player2") {
    user = Player2;
  }
  console.log(user.name + " joined game as " + user.id);
}

function onMessage(text) {
  var list = document.getElementById("status");
  var el = document.createElement("li");
  el.innerHTML = text;
  list.appendChild(el);
}

function addTurnListener(id) {
    let button = document.getElementById(id);
    button.addEventListener("click", () => {
      socket.emit("turn", id);
    });
}
