// var sock = io();
// let user;
//
// sock.on("msg", onMessage);
//
// sock.on("assign", assignPlayer);
//
// function assignPlayer(text) {
//   if (text === "Player1") {
//     user = Player1;
//   } else if (text === "Player2") {
//     user = Player2;
//   }
// }
//
// function onMessage(text) {
//   var list = document.getElementById("status");
//   var el = document.createElement("li");
//   el.innerHTML = text;
//   list.appendChild(el);
// }
//
// function addTurnListener(id) {
//     let button = document.getElementById(id);
//     button.addEventListener("click", () => {
//         socket.emit("turn", id);
//     });
// }
let user = Player1;

//the controlling player's hand
const hand = document.getElementById("playerHand");

//establish buttons for card use
let buttons = document.getElementById("buttons");
let useButton = document.createElement("button");
let discardButton = document.createElement("button");
let cancelButton = document.createElement("button");
let fireButton = document.createElement("button");
let evadeButton = document.createElement("button");
let cicButton = document.createElement("button");
let confirmButton = document.createElement("button");
let $overlay;

//add text to the buttons
useButton.innerText = "Use";
discardButton.innerText = "Discard";
cancelButton.innerText = "Cancel";
fireButton.innerText = "Fire";
evadeButton.innerText = "Evade";
cicButton.innerText = "Contact CIC";
confirmButton.innerText = "Confirm Target";

useButton.id = "use";
discardButton.id = "discard";
cancelButton.id = "cancel";
fireButton.id = "fire";
evadeButton.id = "evade";
cicButton.id = "cic";
confirmButton.id = "confirm";

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
  showSummary(user, "#playerHand");
  $("#playerHand").html("");
  for (let i = 0; i < user.hand.length; i++) {
    let tCard = user.hand[i];
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
  if (player === user) {
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
    } else if (friendly === user) {
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
    else if (player === user) {
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
      if (eCard.cssClass === "emptySpace" || eCard.cssClass === "destroyed") {
        location.append("<li class='enemy " + eCard.cssClass + "'>"
                  + "<h3>" + eCard.name + "</h3>"
                  + "</li>")
      } else {
        location.append("<li class='enemy " + eCard.cssClass + "'>"
                + "<h3>" + eCard.name + "</h3>"
                + "<p>ARM: " + (eCard.armor - friendly.pursuerDamage[i]) + "/" + eCard.armor + "</p>"
                + "<p>PWR: " + eCard.power + "</p>"
                + "<p>TGT: " + eCard.targeting + "</p>"
                + "<p>MRT: " + eCard.merit + "</p>"
                + "</li>")
      }
    }
  }
  const refreshPursuerList = function(location, friendly) {
    location.html("");
    location.removeClass();
    location.addClass(friendly.id);
    dealEnemies(location, friendly);
  }
  let wingman = 1;
  const $playerPursuers = $("#playerPursuers");
  const $basePursuers = $("#basePursuers");
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly === FriendlyBase) {
      refreshPursuerList($basePursuers, friendly);
    } else if (friendly === user) {
      refreshPursuerList($playerPursuers, friendly);
    } else {
      let $wingmanPursuers = $("#wingman" + wingman + "-pursuers");
      refreshPursuerList($wingmanPursuers, friendly);
      wingman++;
    }
  }
}

const update = function() {
  // update entire play area
  updateEnemyCards();
  updateTacticalCards();
  updateSummaries();
  enableSelect();
}


/********************
CARD SELECTION
********************/


const deselect = function() {
  // remove "selected" class from all cards when a card is clicked
  $(".selected").removeClass("selected");
}

const detarget = function() {
  $(".targeted").removeClass("targeted");
}

const selectCard = function() {
  // assign "selected" class only to the clicked card
  deselect();
  // console.log(this.classList + " card selected");
  this.classList.toggle("selected");
  buttons.append(useButton);
  buttons.append(discardButton);
  // addTurnListener("use");
}

const targetCard = function() {
  // assign "selected" class only to the clicked card
  detarget();
  clearButtons();
  // console.log(this.classList + " card selected");
  this.classList.toggle("targeted");
  buttons.append(confirmButton);
  buttons.append(cancelButton);
  // addTurnListener("use");
}

const getCardIndex = function(className) {
  // get the index of the targetted card in its list
  let card = document.querySelector(className);
  let list = card.parentElement
  let index = Array.from(list.children).indexOf(card);
  return index;
}

const getCardFunction = function(className) {
  let card = document.querySelector(className);
  return card.classList()[1];
}

const getFriendly = function(className) {
  // determine which Friendly holds the selected card
  let card = document.querySelector(className);
  let friendly = card.parentElement.className;
  if (friendly === "Player1") {
    return Player1;
  } else if (friendly === "Player2") {
    return Player2;
  } else if (friendly === "Player3") {
    return Player3;
  } else if (friendly === "Player4") {
    return Player4;
  } else if (friendly === "FriendlyBase") {
    return FriendlyBase;
  } else {
    return enemyBase;
  }
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

const selectAlly = function() {

}

const selectTargets = function(...ids) {
  let $enemies = Array.from($(".enemy"));
  $enemies.forEach((enemy) => {
    let classes = Array.from(enemy.classList);
    if (ids.includes(enemy.id) ||
    (ids.includes(enemy.parentElement.id) && !classes.includes("emptySpace")
        && !classes.includes("placeHolder"))) {
      enemy.className += " target";
      enemy.onclick = targetCard;
    }
  });
}


/********************
BUTTON FUNCTIONS
********************/

const use = function() {
  clearButtons();
  buttons.append(cancelButton);
  disableSelect();
  selectTargets("wingman1-pursuers", "basePursuers", "playerPursuers", "enemyBase");
  // 1. allow player to choose appropriate targets
  // 2. get the cardIndex of the selected card
  // 3. run the card function on the active player, passing in the cardIndex and friendly
  //
}

const discard = function() {
  clearButtons();
  buttons.append(fireButton);
  buttons.append(evadeButton);
  buttons.append(cicButton);
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
  detarget();
  $(".target").removeClass("target");
  enableSelect();
}

const market = function() {
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
}

const confirmTarget = function() {
  let cardIndex = getCardIndex(".selected");
  let friendly = getFriendly(".targeted");
  let pursuerIndex = getCardIndex(".targeted");
  user.useTactic(cardIndex, friendly, pursuerIndex);
  checkCards();
  detarget();
  $(".target").removeClass("target");
  clearButtons();
  update();
}

useButton.onclick = use;
discardButton.onclick = discard;
fireButton.onclick = fire;
evadeButton.onclick = evade;
cancelButton.onclick = cancel;
cicButton.onclick = market;
confirmButton.onclick = confirmTarget;

update();
