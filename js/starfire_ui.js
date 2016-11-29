//the controlling player's hand
const hand = document.getElementById("playerHand");

//establish buttons for card use
const buttons = document.getElementById("buttons");
const useButton = document.createElement("button");
const discardButton = document.createElement("button");
const cancelButton = document.createElement("button");
const fireButton = document.createElement("button");
const evadeButton = document.createElement("button");

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
FriendlyBase.pursuers = [light, light];
// end demonstration settings

const refreshBases = function() {
  $("#friendlyBase").html(FriendlyBase.summary());
  $("#enemyBase").html(enemyBase.summary());
}

const distrTacticalCards = function() {
  let wingman = 1;
  for (let i = 0; i < game.friendlies.length; i++) {
    let $wingmanHand = $("#wingman" + wingman + "-hand");
    let player = game.friendlies[i];
    if (player === FriendlyBase) {
      continue;
    }
    else if (player === Player1) {
      checkCards();
    } else {
      $wingmanHand.after(player.summary());
      for (let i = 0; i < 3; i++) {
        let tCard = player.hand[i];
        $wingmanHand.append(tCard.card);
      }
      wingman += 1
    }
  }
}

const distrEnemyCards = function() {
  const dealEnemies = function(location, friendly) {
    for (let i = 0; i < friendly.pursuers.length; i++) {
      let eCard = friendly.pursuers[i];
      location.append(eCard.card);
    }
  }
  let wingman = 1;
  const $playerPursuers = $("#playerPursuers");
  const $basePursuers = $("#basePursuers");
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly === FriendlyBase) {
      dealEnemies($basePursuers, friendly);
    } else if (friendly === Player1) {
      dealEnemies($playerPursuers, friendly);
    } else {
      let $wingmanPursuers = $("#wingman" + wingman + "-pursuers");
      dealEnemies($wingmanPursuers, friendly);
      wingman++
    }
  }
}

/********************
UTILITY FUNCTIONS
********************/

//clear all action buttons
const clearButtons = function() {
  buttons.innerHTML = "";
}

//remove the selected card from play
const removeCard = function() {
  clearButtons();
  $(".selected").remove();
}

//if no cards are left, deal new cards
const checkCards = function() {
  const $summary = $("#player .playerSummary");
  if ($summary.length == 0) {
    $("#playerHand").after(Player1.summary());
  } else {
    $summary.replaceWith(Player1.summary());
  }
  if (hand.children.length === 0 ) {
    for (let i = 0; i < 3; i++) {
      let tCard = Player1.hand[i];
      $("#playerHand").append(tCard.card);
    }
  }
}


/********************
CARD SELECTION
********************/

// remove "selected" class from all cards when a card is clicked
const deselect = function() {
  $(".selected").removeClass("selected");
}

// assign "selected" class only to the clicked card
const selectCard = function() {
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
const enableSelect = function() {
  for (i=0; i<hand.children.length; i++) {
    let card = hand.children[i];
    card.onclick = selectCard;
  }
  $(".disabled").removeClass("disabled");
}

//disable clicking other cards while an action is being taken
const disableSelect = function() {
  for (i=0; i<hand.children.length; i++) {
    let card = hand.children[i];
    card.onclick = false;
  }
}



/********************
BUTTON FUNCTIONS
********************/

const use = function() {
  clearButtons();
  disableSelect();
  //run card function
  removeCard();
  checkCards();
  enableSelect();
}

const discard = function() {
  clearButtons();
  buttons.append(fireButton);
  buttons.append(evadeButton);
  buttons.append(cancelButton);
  for (i=0; i<hand.children.length; i++) {
    let card = hand.children[i];
    let cardSelected = card.classList.contains("selected");
    if(!cardSelected) {
      card.className = "tactical disabled";
    }
  }
  disableSelect();
}

const fire = function() {
  clearButtons();
  disableSelect();
  //run fire function
  removeCard();
  checkCards();
  enableSelect();
}

const evade = function() {
  clearButtons();
  disableSelect();
  //run evade function
  removeCard();
  checkCards();
  enableSelect();
}

const cancel = function() {
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
