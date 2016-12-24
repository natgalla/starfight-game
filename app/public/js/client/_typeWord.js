let typeWord = function($location, text, element, begEnd, interval, cursor) {
  if (element === undefined) {
    element = "p";
  }
  if (begEnd === undefined) {
    begEnd = "prepend";
  }
  if (interval === undefined) {
    interval = 40;
  }
  if (cursor === undefined) {
    cursor = "|";
  }
  let newText = document.createElement(element);
  if (begEnd === "prepend") {
    $location.prepend(newText);
  } else {
    $location.append(newText);
  }
  let i=0;
  let testInterval = setInterval(typeOut, interval);
  function typeOut() {
    if (i === text.length+1) {
      clearInterval(testInterval);
    } else {
      if (i === 0) {
        newText.textContent += text[i] + cursor;
        i++;
      } else if (i === text.length) {
        newText.textContent = newText.textContent.slice(0, -1);
        i++;
      } else {
        newText.textContent = newText.textContent.slice(0, -1);
        newText.textContent += text[i] + cursor;
        i++;
      }
    }
  }
}
