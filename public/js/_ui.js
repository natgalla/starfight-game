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
let $commsExpertButton = $("<button>", {
  id: "commsExpert",
  title: "Use the comms expert ability",
  text: "COM"
});
let $medicButton = $("<button>", {
  id: "medic",
  title: "Use the medic ability",
  text: "MDC"
});
let $useButton = $("<button>", {
  id: "use",
  title: "Use the selected card",
  text: "USE"
});
let $discardButton = $("<button>", {
  id: "discard",
  title: "Discard the selected card",
  text: "DSC"
});
let $cancelButton = $("<button>", {
  id: "cancel",
  title: "Cancel this action",
  text: "ESC"
});
let $fireButton = $("<button>", {
  id: "fire",
  title: "Fire at a valid target",
  text: "ATK"
});
let $evadeButton = $("<button>", {
  id: "Evade",
  title: "Attempt to evade a pursuer",
  text: "EVD"
});
let $cicButton = $("<button>", {
  id: "cic",
  title: "View advanced tactics",
  text: "CIC"
});
let $confirmButton = $("<button>", {
  id: "confirmTarget",
  title: "Confirm target",
  text: "CFM"
});

$buttons.append($medicButton);
$buttons.append($useButton);
$buttons.append($discardButton);
$buttons.append($fireButton);
$buttons.append($evadeButton);
$buttons.append($cicButton);
$buttons.append($commsExpertButton);
$buttons.append($confirmButton);
$buttons.append($cancelButton);



/********************
UPDATE FUNCTIONS
********************/

const clearButtons = function() {
  //clear all action buttons
  $buttons.children().hide();
}

const updateSummaries = function() {
  $("#enemyBase").html(game.enemyBase.summary);
  let wingman = 1;
  const showSummary = function(player) {
    // show player summary
    let summaryField;
    if (player.id === user.id) {
      summaryField = "#userSummary";
    } else {
      summaryField = "#wingman" + wingman + "-summary";
    }
    let $summary = $(summaryField);
    $summary.html(player.summary).removeClass().addClass("playerSummary").addClass(player.id);
  }
  for (let i = 0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly.id === FriendlyBase.id) {
      $("#friendlyBaseSummary").html(FriendlyBase.summary);
    } else if (friendly.id === user.id) {
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
    if (player.id === FriendlyBase.id) {
      continue;
    } else if (player.id === user.id) {
      $("#playerHand").empty();
      for (let i = 0; i < player.hand.length; i++) {
        let tCard = player.hand[i];
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
  let $basePursuers = $("#basePursuers");
  for(let i=0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly.id === FriendlyBase.id) {
      refreshPursuerList($basePursuers, friendly);
    } else if (friendly.id === user.id) {
      refreshPursuerList($("#playerPursuers"), friendly);
    } else {
      let $wingmanPursuers = $("#wingman" + wingman + "-pursuers");
      refreshPursuerList($wingmanPursuers, friendly);
      let offset = -120 + (-25*friendly.pursuers.length);
      $wingmanPursuers.css({'left': offset});
      wingman++;
    }
  }
}

const clearOverlay = function() {
  $overlay.slideUp(400, function() {
    $("#userSummary").css({"margin-left": "10px"});
  });
}

const addWingmen = function(friendlies) {
  $("#wingmen").empty();
  let toAdd = friendlies - 2;
  for (let i = 0; i < toAdd; i++) {
    let wingmanNumber = i+1;
    let prefix = "wingman" + wingmanNumber;
    let $wingman = $("<div>", {
      class: "wingman",
      id: prefix
    });
    let $hand = $("<ul>", {
      class: "wingmanHand",
      id: prefix + "-hand"
    });
    let $summary = $("<div>", {
      class: "wingmanSummary",
      id: prefix + "-summary"
    });
    let $pursuers = $("<ul>", {
      class: "wingmanPursuers",
      id: prefix + "-pursuers"
    });
    $wingman.append($hand);
    $wingman.append($summary);
    $wingman.append($pursuers);
    $('#wingmen').append($wingman);
  }
}

const update = function() {
  // update entire play area
  clearButtons();
  detarget();
  addWingmen(game.friendlies.length);
  updateEnemyCards();
  updateTacticalCards();
  updateSummaries();
  if (game.friendlies[game.currentTurn].id === user.id) {
    enableSelect();
  } else {
    disableSelect();
  }
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
  $(".target").off("click");
  $(".enemy").off("click");
  $(".assist").removeClass("assist");
  $(".assist").off("click");
  $(".playerSummary").off("click");
  $(".FriendlyBase").off("click");
  $(".invalidTarget").removeClass("invalidTarget");
  $(".targeted").removeClass("targeted");
  $(".targeted").off("click");
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
    return game.enemyBase;
  } else {
    return undefined;
  }
}



/********************
CARD BINDING
********************/

const enableSelect = function() {
  $(".disabled").removeClass("disabled");
  if (getUser().effects.medicActive) {
    $medicButton.show();
  }
  $("#playerHand .tactical").on("click", function() {
    deselect();
    $medicButton.hide();
    $(this).addClass("selected");
    let $selected = $(".selected");
    if ($selected.hasClass("feint")) {
      if (getPlayer().lastCardUsed) {
        $selected.html("<h3>Feint</h3><p>" + getPlayer().lastCardUsed.description + "</p>");
        $useButton.show();
      } else {
        $useButton.hide();
        $selected.html("<h3>Feint</h3><p>Nothing to feint</p>");
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
    $(this).addClass("targeted");
    $confirmButton.show();
    $cancelButton.show();
  });
}

const getUser = function() {
  for (let i=0; i < game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly.id === user.id) {
      return friendly;
    }
  }
}

const getPlayer = function() {
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
      } else {
        enemy.className += " invalidTarget";
      }
    });
    $(".target").on("click", function() {
      clearButtons();
      $(this).addClass("targeted")
      $(".targeted").not($(this)).removeClass("targeted");
      $confirmButton.show();
      $cancelButton.show();
    });
  }
  if (action === "feint") {
    action = player.lastCardUsed.cssClass;
  }
  if (["jammer", "incinerate", "intercept", "divertShields", "countermeasures", "jump", "hardsix", "guidedMissile"].includes(action)) {
    clearButtons();
    $confirmButton.show();
    $cancelButton.show();
  }
  let daredevilCondition = false;
  if (player.effects.daredevil) {
    let enemyCount = 0;
    for (let i=0; i < player.pursuers.length; i++) {
      let enemy = player.pursuers[i];
      if (enemy.cssClass !== "emptySpace" && enemy.cssClass !== "destroyed") {
        enemyCount += 1;
      }
    }
    if (enemyCount <= 1) {
      daredevilCondition = true;
    }
  }
  if (["fire", "missile", "heatSeeker", "bomb", "scatterShot"].includes(action)) {
    if (player.effects.status == "Free" || daredevilCondition) {
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
  if (["repairDrone", "healthPack"].includes(action)) {
    selectAlly("all");
  }
}



/********************
BUTTON FUNCTIONS
********************/

$medicButton.on("click", function() {
  clearButtons();
  buttonPressed = "medic";
  action = "medic";
  $cancelButton.show();
  selectAlly("all");
});

$commsExpertButton.on("click", function() {
  buttonPressed = "commsExpert";
  action = "useAdvTactic";
  let bump = 190 - ($('#playerHand').children().length-1)*50;
  $("#userSummary").css({"margin-left": bump});
  clearButtons();
  $cancelButton.show();
  $overlay.empty();
  let $marketList = $("<ul>");
  $overlay.append(typeWord($overlay, "Incoming transmition from " + game.name + " command...", "p", undefined, 30));
  $overlay.append($marketList);
  game.market.forEach( function(card) {
    let advCard = "<li class='advTactical " + card.cssClass + " purchasable'>"
            + "<h3>" + card.name + "</h3>"
            + "<p>" + card.description + "</p>"
            + "<p class='cost'> Merit cost: Free</p>"
            + "</li>";
    $marketList.append(advCard);
  });
  $overlay.slideDown(600);
  $marketList.hide().fadeIn(1000);
  $(".purchasable").on("click", function() {
    clearButtons();
    $cancelButton.show();
    detarget();
    $(this).siblings().removeClass("purchasing");
    $(this).addClass("purchasing");
    action = $(this)[0].classList[1]; // $(this).attr("class").split(" ")[1]
    if(["heatSeeker", "bomb", "scatterShot", "snapshot", "emp", "repairDrone", "healthPack"].includes(action)) {
      $confirmButton.hide();
      showTargets(action);
    } else {
      detarget();
      $confirmButton.show();
    }
  });
})

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
  if (getUser().effects.commsExpert) {
    $commsExpertButton.show();
  }
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

function cancel() {
  clearOverlay();
  clearButtons();
  deselect();
  detarget();
  action = "";
  enableSelect();
}

$cancelButton.on("click", cancel);

$(document).keyup(function(e) {
  if (e.keyCode == 27) {
    cancel();
  }
})

$cicButton.on("click", function() {
  action = "useAdvTactic";
  buttonPressed = "useAdvTactic";
  let bump = 190 - ($('#playerHand').children().length-1)*50;
  $("#userSummary").css({"margin-left": bump});
  clearButtons();
  $cancelButton.show();
  $overlay.empty();
  let $marketList = $("<ul>");
  $overlay.append(typeWord($overlay, "Incoming transmition from " + game.name + " command...", "p", undefined, 30));
  $overlay.append($marketList);
  game.market.forEach( function(card) {
    let advCard;
    let cost = card.cost;
    if (user.effects.negotiator) {
      cost -= 1;
    }
    if (getPlayer().merit >= cost) {
      advCard = "<li class='advTactical " + card.cssClass + " purchasable'>"
              + "<h3>" + card.name + "</h3>"
              + "<p>" + card.description + "</p>"
              + "<p class='cost'> Merit cost: " + cost + "</p>"
              + "</li>";
    } else {
      advCard = "<li class='advTactical " + card.cssClass + " unavailable'>"
              + "<h3>" + card.name + "</h3>"
              + "<p>" + card.description + "</p>"
              + "<p class='cost'> Merit cost: " + cost + "</p>"
              + "</li>";
    }
    $marketList.append(advCard);
  });
  $overlay.slideDown(600);
  $marketList.hide().fadeIn(1000);
  $(".purchasable").on("click", function() {
      clearButtons();
      $cancelButton.show();
      detarget();
      $(this).siblings().removeClass("purchasing");
      $(this).addClass("purchasing");
      action = $(this)[0].classList[1]; // $(this).attr("class").split(" ")[1]
      if(["heatSeeker", "bomb", "scatterShot", "snapshot", "emp", "repairDrone", "healthPack"].includes(action)) {
        $confirmButton.hide();
        showTargets(action);
      } else {
        detarget();
        $confirmButton.show();
      }
  });
});

$confirmButton.on("click", function() {
  let turnInfo = {
    player: getUser(),
    button: buttonPressed,
    cardIndex: $(".selected").index(),
    friendly: getFriendly(".targeted"),
    pursuerIndex: $(".targeted").index(),
    purchaseIndex: $(".purchasing").index(),
  }
  console.log(turnInfo);
  sock.emit("turn", { room: room, turnInfo: turnInfo });
  clearOverlay();
  detarget();
  clearButtons();
  update();
});
