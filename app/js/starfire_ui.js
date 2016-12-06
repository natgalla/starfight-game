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
let action;
let $overlay;

let typeWord = function(location, text, interval) {
  let p = document.createElement("p");
  location.appendChild(p);
  let i=0;
  let testInterval = setInterval(type, interval);
  function type() {
    if (i === text.length+1) {
      clearInterval(testInterval);
    } else {
      if (i === 0) {
        p.textContent += text[i] + "|";
        i++;
      } else if (i === text.length) {
        p.textContent = p.textContent.slice(0, -1);
        i++;
      } else {
        p.textContent = p.textContent.slice(0, -1);
        p.textContent += text[i] + "|";
        i++;
      }
    }
  }
}

//the controlling player's hand
const hand = document.getElementById("playerHand");

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
  text: "Cancel"
});

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
  $buttons.html("");
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
  $(".target").removeClass("target");
  $(".targeted").removeClass("targeted");
}

const selectCard = function() {
  // assign "selected" class only to the clicked card
  deselect();
  this.classList.toggle("selected");
  $buttons.append($useButton);
  $buttons.append($discardButton);
  // addTurnListener("use");
}

const targetCard = function(condition) {
  // assign "selected" class only to the clicked card
  detarget();
  clearButtons();
  this.classList.toggle("targeted");
  $buttons.append($confirmTargetButton);
  $buttons.append($cancelButton);
  // addTurnListener("use");
}

const getCardIndex = function(className) {
  // get the index of the targetted card in its list
  let card = document.querySelector(className);
  let list = card.parentElement;
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
  $(".disabled").removeClass("disabled");
  $("#playerHand li").on("click", function() {
    deselect();
    $(this).addClass("selected");
    $buttons.append($useButton);
    $buttons.append($discardButton);
  });
}

const selectEnemyStandard = function() {
  $(".pursuers").children.enableSelect();
}

const disableSelect = function() {
  //disable clicking other cards while an action is being taken
  $("#playerHand li").not(".selected").addClass("disabled");
  $(".disabled").off("click");
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

$useButton.click(function() {
  clearButtons();
  $buttons.append($cancelButton);
  disableSelect();
  action = "use";
  selectTargets("wingman1-pursuers", "basePursuers", "playerPursuers", "enemyBase");

})

$discardButton.click(function() {
  clearButtons();
  $buttons.append($fireButton);
  $buttons.append($evadeButton);
  $buttons.append($cicButton);
  $buttons.append($cancelButton);
  disableSelect();
});

$fireButton.click(function() {
  clearButtons();
  $buttons.append($cancelButton);
  disableSelect();
  action = "fire";
  selectTargets("wingman1-pursuers", "basePursuers", "playerPursuers", "enemyBase");
});

$evadeButton.click(function() {
  clearButtons();
  $buttons.append($cancelButton);
  disableSelect();
  action = "evade";
  selectTargets("playerPursuers");
});

$cancelButton.click(function() {
  clearButtons();
  deselect();
  detarget();
  action = "";
  enableSelect();
});

$cicButton.click(function() {
  action = "useAdvTactic";
  $overlay = $('<ul id="overlay"></ul>');
  $overlay.append(typeWord($overlay[0], "Incoming transmition from " + game.name + " command...", 30));
  for (let i=0; i < FriendlyBase.market.length; i++) {
    let advCard = FriendlyBase.market[i].card;
    $overlay.append(advCard);
  }
  // $overlay.append("<button id='exit'>Exit</button>")
  $("body").append($overlay);
  $overlay.click(function() {
    $(this).hide();
  });
  $(".advTactical").on("click", function() {
      $(".advTactical").removeClass("purchasing");
      $(this).addClass("purchasing");
  })
  // $("#exit").on("click", function(){
  //   $overlay.hide();
  // });
});

$confirmTargetButton.click(function() {
  let cardIndex = getCardIndex(".selected");
  let friendly = getFriendly(".targeted");
  let pursuerIndex = getCardIndex(".targeted");
  if (action === "use") {
    user.useTactic(cardIndex, friendly, pursuerIndex);
  } else {
    user.discard(cardIndex, action, friendly, pursuerIndex);
  }
  // checkCards();
  detarget();
  clearButtons();
  update();
});

$confirmAdvButton.click(function() {
  let cardIndex = getCardIndex(".selected");
  let friendly = getFriendly(".targeted");
  let purchaseIndex = getCardIndex(".purchasing");
  user.discard(cardIndex, "useAdvTactic", friendly, purchaseIndex);
  detarget();
  clearButtons();
  update();
});

update();
