const gameName = "Starfire";
let sessionName;
const validSession = "test1";
const $setup = $("#setup");
const $newSessionNameInput = $("#newSessionName");
const $joinSessionNameInput = $("#joinSessionName");
const $createGameName = $("#createGameName");
const $enterGameName = $("#enterGameName");
const $newGame = $("#newGame");
const $joinGame = $("#joinGame");

const $greet = $("#greet");
const $transition1 = $("#transition1");
const $startGame = $("#startGame");
const $newSession = $("#newSession");
const $joinSession = $("#joinSession");
const $playArea = $("#playArea");

$playArea.hide();
$transition1.hide();
$startGame.hide();
$newSession.hide();
$joinSession.hide();
$greet.prepend("<h3>Welcome to the " + gameName + " playtest module</h3>");
const $play = $("#play");

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
