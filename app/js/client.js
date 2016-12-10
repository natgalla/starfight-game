var sock = io();
let user;

sock.on("msg", onMessage);
sock.on("assign", assignPlayer);
sock.on("update", getUpdate);

function getUpdate(packet) {
  console.log("Server sent an update")
  console.log(packet);
}

function assignPlayer(text) {
  if (text === "Player1") {
    user = Player1;
  } else if (text === "Player2") {
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
