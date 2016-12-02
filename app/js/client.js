var sock = io();

sock.on("msg", onMessage);

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
