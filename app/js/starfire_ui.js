//the controlling player's hand
const hand = document.getElementById("playerHand");

//establish buttons for card use
let buttons = document.getElementById("buttons");
let useButton = document.createElement("button");
let discardButton = document.createElement("button");
let cancelButton = document.createElement("button");
let fireButton = document.createElement("button");
let evadeButton = document.createElement("button");
let $overlay;

//add text to the buttons
useButton.innerText = "Use";
discardButton.innerText = "Discard";
cancelButton.innerText = "Cancel";
fireButton.innerText = "Fire";
evadeButton.innerText = "Evade";

useButton.id = "use";
discardButton.id = "discard";
cancelButton.id = "cancel";
fireButton.id = "fire";
evadeButton.id = "evade";

// for demonstration purposes
Player1.name = "Nathan";
Player2.name = "Rudi";
Player3.name = "Ruth";
Player4.name = "Alan";



/********************
UTILITY FUNCTIONS
********************/


const clearButtons = function() {
  //clear all action buttons
  buttons.innerHTML = "";
}

const removeCard = function() {
  //remove the selected card from play
  clearButtons();
  $(".selected").remove();
}

const checkCards = function() {
  //show current player hand
  showSummary(Player1, "#playerHand");
  $("#playerHand").html("");
  for (let i = 0; i < 3; i++) {
    let tCard = Player1.hand[i];
    $("#playerHand").append(tCard.card);
  }
}

const refreshBases = function() {
  // update base summaries
  FriendlyBase.updateSummary();
  $("#friendlyBase").html(FriendlyBase.summary);
  enemyBase.updateSummary();
  $("#enemyBase").html(enemyBase.summary);
}

const showSummary = function(player, hand) {
  // show player summary
  let $playerHand = $(hand);
  let summary;
  if (player === Player1) {
    summary = "#player .playerSummary";
  } else {
    summary = "#wingmen ." + player.name;
  }
  let $summary = $(summary);
  if ($summary.length === 0) {
    $playerHand.after(player.summary);
  } else {
    $summary.replaceWith(player.summary);
  }
}

const updateSummaries = function() {
  // update and show all player summaries
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    friendly.updateSummary();
  }
  let wingman = 1;
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly === FriendlyBase) {
      refreshBases();
    } else if (friendly === Player1) {
      showSummary(friendly, "#playerHand")
    } else {
      showSummary(friendly, "#wingman" + wingman + "-hand");
      wingman++
    }
  }
}

const updateTacticalCards = function() {
  // update and show all tactical hands
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
      $wingmanHand.html("");
      for (let i = 0; i < 3; i++) {
        let tCard = player.hand[i];
        if (tCard) {
          $wingmanHand.append(tCard.card);
        }
      }
      wingman += 1
    }
  }
  updateSummaries();
}

const updateEnemyCards = function() {
  // update and show current pursuers
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
      $basePursuers.html("");
      dealEnemies($basePursuers, friendly);
    } else if (friendly === Player1) {
      $playerPursuers.html("");
      dealEnemies($playerPursuers, friendly);
    } else {
      let $wingmanPursuers = $("#wingman" + wingman + "-pursuers");
      $wingmanPursuers.html("");
      dealEnemies($wingmanPursuers, friendly);
      wingman++
    }
  }
}

const update = function() {
  // update entire play area
  updateEnemyCards();
  updateTacticalCards();
  updateSummaries();
}


/********************
CARD SELECTION
********************/


const deselect = function() {
  // remove "selected" class from all cards when a card is clicked
  $(".selected").removeClass("selected");
}

const selectCard = function() {
  // assign "selected" class only to the clicked card
  deselect();
  console.log(this.classList + " card selected");
  this.classList.toggle("selected");
  buttons.append(useButton);
  buttons.append(discardButton);
  addTurnListener("use");
}


/********************
CARD BINDING
********************/


const enableSelect = function() {
  //bind click event handler to each card
  for (i=0; i < hand.children.length; i++) {
    let card = hand.children[i];
    card.onclick = selectCard;
  }
  $(".disabled").removeClass("disabled");
}

const selectEnemyStandard = function() {
  $(".pursuers").children.enableSelect();
}

const disableSelect = function() {
  //disable clicking other cards while an action is being taken
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
  ["fire", "evade"].forEach(addTurnListener);
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
// ["use", "fire", "evade"].forEach(addTurnListener);

update();
enableSelect();

$("#market").on("click", function() {
  $overlay = $('<ul id="overlay"></ul>');
  $overlay.append("<p>Incoming transmition from " + game.name + " command...</p>");
  for (let i=0; i < FriendlyBase.market.length; i++) {
    let advCard = FriendlyBase.market[i].card;
    $overlay.append(advCard);
  }
  // $overlay.append("<button id='exit'>Exit</button>")
  $("body").append($overlay);
  $overlay.click(function() {
    $(this).hide();
  });
  // $(".advTactical").on("click", function() {
  //   // run advanced tactical function
  //   $overlay.hide();
  // })
  // $("#exit").on("click", function(){
  //   $overlay.hide();
  // });
});
