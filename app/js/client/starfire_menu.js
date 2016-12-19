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

let gameName = "Starfire";
let sessionName;
let validSession = "test1";
let $setup = $("<div>", {id: "setup"});
let $server = $("<ul>", {id: "server"});
let $newSessionNameInput = $("<input>", {type: "text", id: "newSessionName"});
let $joinSessionNameInput = $("<input>", {type: "text", id: "joinSessionName"});
let $play = $("<button>", {id: "play", text: "Play"});
let $createGameName = $("<button>", {id: "createGameName", text: "Create"});
let $enterGameName = $("<button>", {id: "enterGameName", text: "Enter"});
let $newGame = $("<button>", {id: "newGame", text: "Create"});
let $joinGame = $("<button>", {id: "joinGame", text: "Join"});
let $notActive = $("<p>", {id: "notActive", text: "Not an active session"})

let $greet = $("<div>", {id: "greet"});
let $startGame = $("<div>", {id: "startGame"});
let $newSession = $("<div>", {id: "setup"});
let $joinSession = $("<div>", {id: "joinSession"});
let $playArea = $("#playArea");

$playArea.hide();
$("#menu").prepend($setup);
$setup.append($greet);
// $setup.append("<h3> Welcome to " + gameName + "<h3>");
typeWord($greet, "Welcome to " + gameName, "h3");
$greet.append($play);
$setup.append($server);
// $startGame.append("<h3>Create a new game or join an existing one?</h3>");
$startGame.append($newGame);
$startGame.append($joinGame);
// $newSession.append("<h3>Please enter a name for your session.</h3>");
$newSession.append($newSessionNameInput);
$newSession.append($createGameName);
// $joinSession.append("<h3>Please enter the name of the session you would like to join</h3>");
$joinSession.append($joinSessionNameInput);
$joinSession.append($enterGameName);
$joinSession.append($notActive);
$notActive.hide();

$play.on("click", function() {
  $greet.hide();
  $setup.append($startGame);
  $startGame.hide();
  $startGame.fadeIn();
  typeWord($startGame, "Create a new game or join an existing one?", "h3");
});

$newGame.on("click", function() {
  $startGame.hide();
  $setup.append($newSession);
  $newSession.hide();
  $newSession.fadeIn();
  typeWord($newSession, "Please enter a name for your session.", "h3");
});

$joinGame.on("click", function() {
  $startGame.hide();
  $setup.append($joinSession);
  $joinSession.hide();
  $joinSession.fadeIn();
  typeWord($joinSession, "Please enter the name of the session you would like to join", "h3");
  $("#notActive").hide();
});

$newSessionNameInput.on("keyup change", function() {
  sessionName = $(this).val();
});
$joinSessionNameInput.on("keyup change", function() {
  $notActive.hide();
  sessionName = $(this).val();
});

$createGameName.on("click", function() {
  if (sessionName) {
    $newSession.hide();
    $("#title").hide();
    $("#info").hide();
    $playArea.fadeIn();
  }
});

$enterGameName.click(function() {
  if (sessionName === validSession) {
    $joinSession.hide();
    $("#title").hide();
    $("#info").hide();
    $playArea.fadeIn();
  } else {
    $notActive.fadeIn(400, function() {
      $notActive.fadeOut(300, function() {
        $notActive.fadeIn(400)
      })
    })
  }
});


//Quick start
// $("#playArea").hide();
// $("#title").hide();
// $("#info").hide();
// $("#playArea").fadeIn();
