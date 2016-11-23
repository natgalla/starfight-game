//the controlling player's hand
var hand = document.getElementById("playerHand");

//establish buttons for card use
var buttons = document.getElementById("buttons");
var useButton = document.createElement("button");
var discardButton = document.createElement("button");
var cancelButton = document.createElement("button");
var fireButton = document.createElement("button");
var evadeButton = document.createElement("button");

var choosing = true;

//add text to the buttons
useButton.innerText = "Use";
discardButton.innerText = "Discard";
cancelButton.innerText = "Cancel";
fireButton.innerText = "Fire";
evadeButton.innerText = "Evade";

// for demonstration purposes
Player1.name = "Nathan";
Player1.pursuers = [light, medium];
Player1.hand = [missile, heatSeeker, drawFire];
Player2.name = "Rudi";
Player2.pursuers = [empty, ace];
Player2.hand = [immelman, jammer, scatterShot];
Player3.name = "Ruth";
Player3.pursuers = [heavy, light];
Player3.hand = [assist, missile, bomb];
Player4.name = "Alan";
Player4.pursuers = [medium, medium];
Player4.hand = [bomb, missile, missile];
var players = [Player1, Player2, Player3, Player4];
// end demonstration settings

var refreshBases = function() {
  $("#friendlyBase").html(FriendlyBase.summary());
  $("#enemyBase").html(enemyBase.summary());
}

var distrTacticalCards = function() {
  var wingman = 1;
  for (var i = 0; i < players.length; i++) {
    var $wingmanHand = $("#wingman" + wingman + "-hand");
    var player = players[i];
    if (player === Player1) {
      checkCards();
    } else {
      $wingmanHand.after(player.summary());
      for (var x = 0; x < 3; x++) {
        var tCard = player.hand[x];
        $wingmanHand.append(tCard.card);
      }
      wingman += 1
    }
  }
}

var distrEnemyCards = function() {
  var wingman = 1;
  var $playerPursuers = $("#playerPursuers");
  for (var i = 0; i < players.length; i++) {
    var $wingmanPursuers = $("#wingman" + wingman + "-pursuers");
    var player = players[i];
    if (player === Player1) {
      for (var x = 0; x < player.pursuers.length; x++) {
        var eCard = player.pursuers[x];
        $playerPursuers.append(eCard.card);
      }
    } else {
      for (var x = 0; x < player.pursuers.length; x++) {
        var eCard = player.pursuers[x];
        $wingmanPursuers.append(eCard.card);
      }
      wingman += 1
    }
  }
}

/********************
UTILITY FUNCTIONS
********************/

//clear all action buttons
var clearButtons = function() {
  buttons.innerHTML = "";
}

//remove the selected card from play
var removeCard = function() {
  clearButtons();
  $(".selected").remove();
}

//if no cards are left, deal new cards
checkCards = function() {
  if (hand.children.length === 0 ) {
    $("#playerHand").before(Player1.summary());
    for (var i = 0; i < 3; i++) {
      var tCard = Player1.hand[i];
      $("#playerHand").append(tCard.card);
    }
  }
}


/********************
CARD SELECTION
********************/

// remove "selected" class from all cards when a card is clicked
var deselect = function() {
  $(".selected").removeClass("selected");
}

// assign "selected" class only to the clicked card
var selectCard = function() {
  deselect();
  console.log("Card selected");
  this.classList.toggle("selected");
  buttons.append(useButton);
  buttons.append(discardButton);
}


/********************
CARD BINDING
********************/

//bind click event handler to each card
var enableSelect = function() {
  for (i=0; i<hand.children.length; i++) {
    var card = hand.children[i];
    card.onclick = selectCard;
  }
  $(".disabled").removeClass("disabled");
}

//disable clicking other cards while an action is being taken
var disableSelect = function() {
  for (i=0; i<hand.children.length; i++) {
    var card = hand.children[i];
    card.onclick = false;
  }
}



/********************
BUTTON FUNCTIONS
********************/

var use = function() {
  clearButtons();
  disableSelect();
  //run card function
  removeCard();
  checkCards();
  enableSelect();
}

var discard = function() {
  clearButtons();
  buttons.append(fireButton);
  buttons.append(evadeButton);
  buttons.append(cancelButton);
  for (i=0; i<hand.children.length; i++) {
    var card = hand.children[i];
    var cardSelected = card.classList.contains("selected");
    if(!cardSelected) {
      card.className = "tactical disabled";
    }
  }
  disableSelect();
}

var fire = function() {
  clearButtons();
  disableSelect();
  //run fire function
  removeCard();
  checkCards();
  enableSelect();
}

var evade = function() {
  clearButtons();
  disableSelect();
  //run evade function
  removeCard();
  checkCards();
  enableSelect();
}

var cancel = function() {
  clearButtons();
  deselect();
  enableSelect();
}

useButton.onclick = use;
discardButton.onclick = discard;
fireButton.onclick = fire;
evadeButton.onclick = evade;
cancelButton.onclick = cancel;

refreshBases();
distrEnemyCards();
distrTacticalCards();
enableSelect();
