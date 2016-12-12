// whose cards will be shown & usable. Will be dynamically assigned by server
let user = Player1;

// globals changed throughout the game by player events, passed to back-end code
let action;
let buttonPressed;

// lightbox to display "market" cards
let $overlay = $("<div>", {
  id: "overlay"
});
$("body").append($overlay);
$overlay.hide();

//establish buttons for card use
let $buttons = $("#buttons");
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



/********************
UPDATE FUNCTIONS
********************/

const clearButtons = function() {
  //clear all action buttons
  $buttons.children().hide();
}



const updateSummaries = function() {
  enemyBase.updateSummary();
  $("#enemyBase").html(enemyBase.summary);
  let wingman = 1;
  const showSummary = function(player) {
    // show player summary
    player.updateSummary();
    let summaryField;
    if (player === user) {
      summaryField = "#userSummary";
    } else {
      summaryField = "#wingman" + wingman + "-summary";
    }
    let $summary = $(summaryField);
    $summary.html(player.summary).removeClass().addClass("playerSummary").addClass(player.id);
  }
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly === FriendlyBase) {
      friendly.updateSummary();
      $("#FriendlyBase").html(FriendlyBase.summary);
    } else if (friendly === user) {
      showSummary(friendly)
    } else {
      showSummary(friendly);
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
    if (player.id === "FriendlyBase") {
      continue;
    }
    else if (player === user) {
      $("#playerHand").empty();
      for (let i = 0; i < user.hand.length; i++) {
        let tCard = user.hand[i];
        $("#playerHand").append("<li class='tactical " + tCard.cssClass + "'>"
                  + "<h3>" + tCard.name + "</h3>"
                  + "<p>" + tCard.description + "</p>"
                  + "</li>");
      }
    } else {
      $wingmanHand.empty();
      for (let i = 0; i < player.hand.length; i++) {
        let tCard = player.hand[i];
        if (tCard) {
          $wingmanHand.append("<li class='tactical " + tCard.cssClass + "'>"
                    + "<h3>" + tCard.name + "</h3>"
                    + "<p>" + tCard.description + "</p>"
                    + "</li>");
        }
      }
      wingman += 1
    }
  }
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
  detarget();
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


const getCardFunction = function(className) {
  let card = document.querySelector(className);
  return card.classList()[1]; // classlist will be .tactical .[action] ...
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
  } else if ($card.hasClass("FriendlyBase") || $friendly.hasClass("FriendlyBase")) {
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
  $(".tactical").on("click", function() {
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


const disableSelect = function() {
  //disable clicking other cards while an action is being taken
  $(".tactical").not(".selected").addClass("disabled");
  $(".tactical").off("click");
}


const selectAlly = function(scope) {
  if (scope === "all") {
    $(".playerSummary").addClass("assist");
  } else {
    $(".playerSummary").not($("." + user.id)).addClass("assist");
  }
  $("#FriendlyBase").addClass("assist");
  $(".assist").on("click", function() {
    detarget();
    clearButtons();
    $(this).toggleClass("targeted");
    $confirmTargetButton.show();
    $cancelButton.show();
  });
}

const getPlayer = function() { // for local playable version only
  let $summary = $(".selected").parent().next();
  if ($summary.hasClass("Player1")) {
    return Player1;
  } else if ($summary.hasClass("Player2")) {
    return Player2;
  } else if ($summary.hasClass("Player3")) {
    return Player3;
  } else if ($summary.hasClass("Player1")) {
    return Player4;
  } else {
    return user;
  }
}

const showTargets = function(action) {
  let player = getPlayer();
  const selectTargets = function(...ids) {
    let enemies = Array.from($(".enemy"));
    enemies.forEach((enemy) => {
      let classes = Array.from(enemy.classList);
      if (ids.includes(enemy.id) ||
        (ids.includes(enemy.parentElement.id) && !classes.includes("emptySpace")
            && !classes.includes("destroyed"))) {
        enemy.className += " target";
        $(".target").on("click", function() {
          clearButtons();
          $(this).addClass("targeted")
          $(".targeted").not($(this)).removeClass("targeted");
          $confirmTargetButton.show();
          $cancelButton.show();
        });
      } else {
        enemy.className += " invalidTarget";
      }
    });
  }
  if (action === "feint") {
    action = player.lastCardUsed.cssClass;
  }
  // SERVER VERSION SELECTION LOGIC, DISABLED FOR LOCAL VERSION
  // if (["fire", "missile", "heatSeeker", "bomb", "scatterShot"].includes(action)) {
  //   if (player.effects.status == "Free") {
  //     selectTargets("basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers",
  //       "enemyBase");
  //   } else {
  //     selectTargets("basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers");
  //   }
  // }
  // if (["snapshot"].includes(action)) {
  //   selectTargets("basePursuers", "playerPursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers",
  //     "enemyBase");
  // }
  // if (["drawFire", "emp"].includes(action)) {
  //   selectTargets("basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers");
  // }
  // if (["immelman", "evade", "barrelRoll"].includes(action)) {
  //   selectTargets("playerPursuers");
  // }
  if (["repairDrone"].includes(action)) {
    selectAlly("all");
  } else { // for local playable version only
    selectTargets("playerPursuers", "basePursuers", "wingman1-pursuers", "wingman2-pursuers", "wingman3-pursuers",
      "enemyBase")
  }
}



/********************
BUTTON FUNCTIONS
********************/


$useButton.on("click", function() {
  clearButtons();
  buttonPressed = "use";
  $cancelButton.show();
  disableSelect();
  action = $(".selected")[0].classList[1];
  showTargets(action);
});


$discardButton.on("click", function() {
  clearButtons();
  buttonPressed = "discard";
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
  $overlay.slideUp(400);
  clearButtons();
  deselect();
  detarget();
  action = "";
  enableSelect();
});


$cicButton.on("click", function() {
  action = "useAdvTactic";
  buttonPressed = "useAdvTactic";
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
  $overlay.slideDown(500);
  $(".purchasable").on("click", function() {
      clearButtons();
      $cancelButton.show();
      detarget();
      $(this).siblings().removeClass("purchasing");
      $(this).addClass("purchasing");
      action = $(this)[0].classList[1]; // $(this).attr("class").split(" ")[1]
      if(["heatSeeker", "bomb", "scatterShot", "snapshot", "emp", "repairDrone"].includes(action)) {
        $confirmAdvButton.hide();
        showTargets(action);
      } else {
        detarget();
        $confirmAdvButton.show();
      }
  });
});


const sendPacket = function() { //for server version: modify to send packet to server
  let packet = {
    player: getPlayer(),
    button: buttonPressed,
    cardIndex: $(".selected").index(),
    friendly: getFriendly(".targeted"),
    pursuerIndex: $(".targeted").index(),
    purchaseIndex: $(".purchasing").index(),
    action: action
  }
  console.log(packet);
  //sock.emit("confirm", packet);
  if (buttonPressed === "use") {
    getPlayer().useTactic(packet.cardIndex, packet.friendly, packet.pursuerIndex); //server will run
  } else {
    getPlyaer().discard(packet.cardIndex, packet.button, packet.friendly, packet.pursuerIndex, packet.purchaseIndex); //server will run
  }
  $overlay.slideUp(400);
  detarget();
  clearButtons();
  update();
}


$confirmTargetButton.on("click", function() {
  sendPacket();
});


$confirmAdvButton.on("click", function() {
  sendPacket();
});


game.round();
update();
