function onMessage(text) {
  var list = document.getElementById("status");
  var el = document.createElement('li');
  el.innerHTML = text;
  list.appendChild(el);
}

onMessage('Hi');
onMessage('I am connected');
