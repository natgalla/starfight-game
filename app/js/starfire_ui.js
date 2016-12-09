let user = Player1;
let action;
let buttonPressed;

//the controlling player's hand
const hand = document.getElementById("playerHand");

//establish buttons for card use
let $buttons = $("#buttons");
let $overlay = $("<div>", {
  id: "overlay"
});
$("body").append($overlay);
$overlay.hide();

let $useButton = $("<button>", {
  id: "use",
  title: "Use the selected card",
  text: "Use"
});
let $discardButton = $("<button>", {
  id: "discard",
  title: "Discard the selected card",
  text: "Discard"
});
let $cancelButton = $("<button>", {
  id: "cancel",
  title: "Cancel this action",
  text: "Cancel"
});
let $fireButton = $("<button>", {
  id: "fire",
  title: "Fire at a valid target",
  text: "Fire"
});
let $evadeButton = $("<button>", {
  id: "Evade",
  title: "Attempt to evade a pursuer",
  text: "Evade"
});
let $cicButton = $("<button>", {
  id: "cic",
  title: "View advanced tactics",
  text: "Contact CIC"
});
let $confirmTargetButton = $("<button>", {
  id: "confirmTarget",
  title: "Confirm target",
  text: "Confirm Target"
});
let $confirmAdvButton = $("<button>", {
  id: "confirmAdvTactic",
  title: "Confirm choice",
  text: "Confirm choice"
});

$buttons.append($useButton);
$buttons.append($discardButton);
$buttons.append($fireButton);
$buttons.append($evadeButton);
$buttons.append($cicButton);
$buttons.append($confirmTargetButton);
$buttons.append($confirmAdvButton);
$buttons.append($cancelButton);

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
  $buttons.children().hide();
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
    summary = "#wingmen ." + player.id;
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
  const refreshPursuerList = function(location, friendly) {
    location.empty();
    location.removeClass();
    location.addClass(friendly.id);
    for (let i = 0; i < friendly.pursuers.length; i++) {
      let eCard = friendly.pursuers[i];
      if (eCard.cssClass === "emptySpace" || eCard.cssClass === "destroyed") {
        location.append("<li class='enemy " + eCard.cssClass + "'>"
                  + "<h3>" + eCard.name + "</h3>"
                  + "</li>")
      } else {
        location.append("<li class='enemy " + eCard.cssClass + "'>"
                + "<h3>" + eCard.name + "</h3>"
                + "<p>ARM: " + (eCard.armor - friendly.pursuerDamage[i])
                + "/" + eCard.armor + "</p>"
                + "<p>PWR: " + eCard.power + "</p>"
                + "<p>TGT: " + eCard.targeting + "</p>"
                + "<p>MRT: " + eCard.merit + "</p>"
                + "</li>")
      }
    }
  }
  let wingman = 1;
  const $playerPursuers = $("#playerPursuers");
  const $basePursuers = $("#basePursuers");
  game.friendlies.forEach( function(friendly) {
    if (friendly === FriendlyBase) {
      refreshPursuerList($basePursuers, friendly);
    } else if (friendly === user) {
      refreshPursuerList($playerPursuers, friendly);
    } else {
      let $wingmanPursuers = $("#wingman" + wingman + "-pursuers");
      refreshPursuerList($wingmanPursuers, friendly);
      wingman++;
    }
  });
}

const update = function() {
  // update entire play area
  clearButtons();
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
  $(".target").removeClass("target");
  $(".assist").removeClass("assist");
  $(".invalidTarget").removeClass("invalidTarget");
  $(".targeted").removeClass("targeted");
}

const targetCard = function() {
  // assign "selected" class only to the clicked card
  $(".target").removeClass("target");
  clearButtons();
  this.classList.toggle("targeted");
  $confirmTargetButton.show();
  $cancelButton.show();
  // addTurnListener("use");
}

const getCardIndex = function(className) {
  // get the index of the targetted card in its list
  let card = document.querySelector(className);
  if (card) {
    let list = card.parentElement;
    let index = Array.from(list.children).indexOf(card);
    return index;
  } else {
    return undefined;
  }
}

const getCardFunction = function(className) {
  let card = document.querySelector(className);
  return card.classList()[1];
}

const getFriendly = function(className) {
  // determine which Friendly holds the selected card
  let $card = $(className);
  let friendly = undefined;
  if ($card) {
    $friendly = $card.parent();
  }
  if ($card.hasClass("Player1") || $friendly.hasClass("Player1")) {
    return Player1;
  } else if ($card.hasClass("Player2") || $friendly.hasClass("Player2")) {
    return Player2;
  } else if ($card.hasClass("Player3") || $friendly.hasClass("Player3")) {
    return Player3;
  } else if ($card.hasClass("Player4") || $friendly.hasClass("Player4")) {
    return Player4;
  } else if ($card.hasClass("friendlyBase") || $friendly.hasClass("friendlyBase")) {
    return FriendlyBase;
  } else if ($card.attr("id") === "enemyBase") {
    return enemyBase;
  } else {
    return undefined;
  }
}

/********************
CARD BINDING
********************/


const enableSelect = function() {
  $(".disabled").removeClass("disabled");
  $("#playerHand li").on("click", function() {
    deselect();
    $(this).addClass("selected");
    let $selected = $(".selected");
    if ($selected.hasClass("feint")) {
      if (user.lastCardUsed) {
        $selected.html("<h3>Feint</h3><p>" + user.lastCardUsed.description + "</p>");
        $useButton.show();
      } else {
        $useButton.hide();
        $selected.html("<h3>Feint</h3><p>" + feint.description + "<br><br>Nothing to feint</p>");
      }
    } else {
      $useButton.show();
    }
    $discardButton.show();
  });
}

const selectEnemyStandard = function() {
  $(".pursuers").children.enableSelect();
}

const disableSelect = function() {
  //disable clicking other cards while an action is being taken
  $("#playerHand li").not(".selected").addClass("disabled");
  $(".tactical").off("click");
}

const selectAlly = function(scope) {
  if (scope === "all") {
    $(".playerSummary").addClass("assist");
  } else {
    $(".playerSummary").not($("." + user.id)).addClass("assist");
  }
  $("#friendlyBase").addClass("assist");
  $(".assist").on("click", function() {
    detarget();
    clearButtons();
    $(this).toggleClass("targeted");
    $confirmTargetButton.show();
    $cancelButton.show();
  });
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
    } else {
      enemy.className += " invalidTarget";
    }
  });
}

const showTargets = function(action) {
  if (action === "feint") {
    action = user.lastCardUsed.cssClass;
  }
  if (["fire", "missile", "heatSeeker", "bomb", "scatterShot"].includes(action)) {
    if (user.effects.freeOfPursuers) {
      selectTargets("basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers",
        "enemyBase");
    } else {
      selectTargets("basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers");
    }
  }
  if (["snapshot"].includes(action)) {
    selectTargets("basePursuers", "playerPursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers",
      "enemyBase");
  }
  if (["drawFire", "emp"].includes(action)) {
    selectTargets("basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers");
  }
  if (["immelman", "evade", "barrelRoll"].includes(action)) {
    selectTargets("playerPursuers");
  }
  if (["repairDrone"].includes(action)) {
    selectAlly("all");
  }
}

/********************
BUTTON FUNCTIONS
********************/

$useButton.on("click", function() {
  clearButtons();
  $cancelButton.show();
  disableSelect();
  action = $(".selected")[0].classList[1];
  buttonPressed = "use";
  showTargets(action);
})

$discardButton.on("click", function() {
  clearButtons();
  $fireButton.show();
  $evadeButton.show();
  $cicButton.show();
  $cancelButton.show();
  disableSelect();
});

$fireButton.on("click", function() {
  clearButtons();
  $cancelButton.show();
  disableSelect();
  action = "fire";
  buttonPressed = "fire";
  showTargets(action);
});

$evadeButton.on("click", function() {
  clearButtons();
  $cancelButton.show();
  disableSelect();
  action = "evade";
  buttonPressed = "evade";
  showTargets(action);
});

$cancelButton.on("click", function() {
  if ($overlay) {
    $overlay.slideUp(400);
  }
  clearButtons();
  deselect();
  detarget();
  action = "";
  enableSelect();
});

$cicButton.on("click", function() {
  action = "useAdvTactic";
  clearButtons();
  $cancelButton.show();
  $overlay.empty();
  let $marketList = $("<ul>");
  $overlay.append(typeWord($overlay[0], "Incoming transmition from " + game.name + " command...", "p", undefined, 30));
  $overlay.append($marketList)
  FriendlyBase.market.forEach( function(card) {
    let advCard = card.generateCard(user);
    $marketList.append(advCard);
  });
  $("body").append($overlay);
  $($overlay).hide();
  $($overlay).slideDown(500);
  $(".purchasable").on("click", function() {
      $(this).siblings().removeClass("purchasing");
      $(this).addClass("purchasing");
      action = $(this)[0].classList[1];
      if(["heatSeeker", "bomb", "scatterShot", "snapshot", "emp", "repairDrone"].includes(action)) {
        $confirmAdvButton.hide();
        showTargets(action);
      } else {
        detarget();
        $confirmAdvButton.show();
      }
  })
});

$confirmTargetButton.on("click", function() {
  let cardIndex = getCardIndex(".selected");
  let friendly = getFriendly(".targeted");
  let pursuerIndex = getCardIndex(".targeted");
  if (buttonPressed === "use") {
    user.useTactic(cardIndex, friendly, pursuerIndex);
  } else {
    let purchaseIndex = getCardIndex(".purchasing");
    user.discard(cardIndex, action, friendly, pursuerIndex, purchaseIndex);
  }
  $overlay.slideUp(400);
  detarget();
  clearButtons();
  update();
});

$confirmAdvButton.on("click", function() {
  let cardIndex = getCardIndex(".selected");
  let friendly = getFriendly(".targeted");
  let pursuerIndex = getCardIndex(".targeted");
  let purchaseIndex = getCardIndex(".purchasing");
  user.discard(cardIndex, "useAdvTactic", friendly, pursuerIndex, purchaseIndex);
  $overlay.slideUp(400);
  detarget();
  clearButtons();
  update();
});

update();
