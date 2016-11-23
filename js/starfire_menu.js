randomIndex = function() {
    var randomNumber = Math.floor(Math.random() * 6);
    return randomNumber;
}

var gameName = "Starfire";
var sessionName;
var validSession = "test1";
var $setup = $("#setup");
var $newSessionNameInput = $("#newSessionName");
var $joinSessionNameInput = $("#joinSessionName");
var $createGameName = $("#createGameName");
var $enterGameName = $("#enterGameName");
var $newGame = $("#newGame");
var $joinGame = $("#joinGame");

var $greet = $("#greet");
var $transition1 = $("#transition1");
var $startGame = $("#startGame");
var $newSession = $("#newSession");
var $joinSession = $("#joinSession");
var $playArea = $("#playArea");

$playArea.hide();
$transition1.hide();
$startGame.hide();
$newSession.hide();
$joinSession.hide();
$greet.prepend("<h3>Welcome to the " + gameName + " playtest module</h3>");
var $play = $("#play");

$play.click(function() {
  $greet.hide();
  $startGame.fadeIn();
});

$newGame.click(function() {
  $startGame.hide();
  $newSession.fadeIn();
});

$joinGame.click(function() {
  $startGame.hide();
  $joinSession.fadeIn();
  $("#notActive").hide();
});

$newSessionNameInput.on("keyup change", function() {
  sessionName = this.value;
});
$joinSessionNameInput.on("keyup change", function() {
  $("#notActive").hide();
  sessionName = this.value;
});

$createGameName.click(function() {
  if (sessionName) {
    $newSession.hide();
    $("#title").hide();
    $playArea.fadeIn();
  }
})

$enterGameName.click(function() {
  if (sessionName === validSession) {
    $joinSession.hide();
    $("#title").hide();
    $playArea.fadeIn();
  } else {
    $("#notActive").show();
  }
})
