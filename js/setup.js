var difficulty = 3;
var enemyDeckTotalCards;
var tacticalDeckTotalCards;
var enemyBaseDeckTotalCards;
var gameID;
var roundNumber;
var turn;

var logRound = function() {
  console.log(gameID + "." + roundNumber);
  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    console.log(Player.summary);
  }
}

var randomIndex = function(number) {
    var randomNumber = Math.floor(Math.random() * number);
    return randomNumber;
}

var shuffle = function(deck) {
    var randIndex, x, i;
    for (i = deck.length; i; i--) {
        randIndex = Math.floor(Math.random() * i);
        x = deck[i - 1];
        deck[i - 1] = deck[randIndex];
        deck[randIndex] = x;
    }
}

var checkDeck = function(deck, discard) {
  // if deck is empty, replace with discard and shuffle
  if (deck.length === 0) {
    while (discard.length > 0) {
      deck.push(discard.pop());
      shuffle(deck);
    }
  }
}

var sortByMerit = function() {
  // procedure to sort player order based on merit
  var friendlySort = [];
  var highestMerit = 0;
  var firstFriendlyIndex;
  var baseIndex;
  var friendly;
  var friendyIndex;
  // find the friendly base and set baseIndex to its location
  // determine who has the highest merit. If highest merit is tied, return to default order
  for (var i = 0; i < friendlies.length; i++) {
    friendly = friendlies[i];
    if (friendly === FriendlyBase) {
      baseIndex = i;
    } else if (friendly.merit > highestMerit) {
      highestMerit = friendly.merit;
      firstFriendlyIndex = i;
    } else if (friendly.merit === highestMerit) {
      firstFriendlyIndex = baseIndex;
    }
  }
  // reorder the friendly list so that the player with highest merit is first, but turn order is maintained
  if (firstFriendlyIndex > 0) {
    friendlySort.push(friendlies.pop(firstFriendlyIndex));
    while (friendlies.length > 0) {
      if (firstFriendlyIndex < friendlies.length) {
        friendlySort.push(friendlies.pop(firstFriendlyIndex));
      } else {
        friendlySort.push(friendlies.shift());
      }
    }
    friendlies = friendlySort;
  }
  // return friendlies;
}

var addToDeck = function(deck, type, amount) {
  // procedure that adds cards to a given deck
  while (amount > 0) {
    deck.push(type);
    amount--;
  }
  return deck;
}

var replace = function(amount, deck, discard, active) {
  // prodecure for replacing active cards
  discarding = amount
  for (var i = discarding; i > 0; i--) {
    if (active.length > 0) {
      discard.push(active.pop());
    }
    discarding--;
  }
  for (var i = discarding; i < amount; i++) {
    checkDeck(deck, discard);
    active.push(deck.pop());
    discarding++;
  }
}

var turn = function() {
  while (true) {
    // calculate amount of tactical cards left
    var tacticalCards = 0;
    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      if (player === friendlyBase) {
        continue;
      } else {
        tacticalCards += player.hand.length;
      }
    }
    // break loop if there are no tactical cards left
    if (tacticalCards === 0) {
      break;
    }
    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      if (player === friendlyBase) {
        continue;
      } else {
        var cardChoiceIndex; // get index of .selected card;
        var cardChoice = player.hand.splice(cardChoiceIndex);
        // run the chosen card's function
        tacticalDiscard.push(cardChoice[0]);
      }
    }
  }
}

var round = function() {
  gameRound++;
  logRound();
  var turnNumber = 0;
  if (roundNumber === 1) {
    replace(enemyBase.startingEnemies, enemyBase.enemyDeck, enemyBase.enemyDiscard, enemyBase.enemiesActive);
  }

  // sort player order by merit
  sortByMerit();

  // distribute new enemies
  if (roundNumber === 1) {
    for (var i = 0; i > friendlies.length; i++) {
      var friendly = friendlies[i];
      for (var p = 0; p > friendly.pursuers.length; p++) {
        friendly.pursuerDamage.push(0);
      }
    }
  }

  // replace tactical cards from last turn
  for (var i = 0; i > friendlies.length; i++) {
    var player = friendlies[i];
    if (player === friendlyBase) {
      continue;
    } else {
      replace(player.tacticalCardsPerTurn, tacticalDeck, tacticalDiscard, player.hand);
    }
  }

  // ensure pursuer list and pursuer damage lists are the same length
  for (var i = 0; i > friendlies.length; i++) {
    var friendly = friendlies[i];
    while (friendly.pursuerDamage.length != friendly.pursuers.length) {
      if (friendly.pursuerDamage.length > friendly.pursuers.length) {
        friendly.pursuerDamage.pop();
      } else if (friendly.pursuerDamage.length) < friendly.pursuers.length) {
        friendly.pursuerDamage.push(0);
      }
    }
  }

  // refresh play area

  turn();

}

//build enemy deck
addToDeck(enemyBase.enemyDeck, ace, 4);
addToDeck(enemyBase.enemyDeck, heavy, 9);
addToDeck(enemyBase.enemyDeck, medium, 12);
addToDeck(enemyBase.enemyDeck, light, 15);
addToDeck(enemyBase.enemyDeck, empty, 12);

enemyDeckTotalCards = enemyBase.enemyDeck.length;

shuffle(enemyBase.enemyDeck);

//build tactical deck
addToDeck(tacticalDeck, missile, 8);
addToDeck(tacticalDeck, repairDrone, 3);
addToDeck(tacticalDeck, assist, 3);
addToDeck(tacticalDeck, drawFire, 4);
addToDeck(tacticalDeck, heatSeeker, 2);
addToDeck(tacticalDeck, bomb, 3);
addToDeck(tacticalDeck, feint, 2);
addToDeck(tacticalDeck, barrelRoll, 3);
addToDeck(tacticalDeck, scatterShot, 3);
addToDeck(tacticalDeck, immelman, 3);
addToDeck(tacticalDeck, jammer, 2);

tacticalDeckTotalCards = tacticalDeck.length;

shuffle(tacticalDeck);

//build enemy base deck
addToDeck(enemyBase.enemyBaseDeck, enemyBase.fireLight, 3);
addToDeck(enemyBase.enemyBaseDeck, enemyBase.fireHeavy, 2);
addToDeck(enemyBase.enemyBaseDeck, enemyBase.deploy, 2);
addToDeck(enemyBase.enemyBaseDeck, enemyBase.repair, 3);
addToDeck(enemyBase.enemyBaseDeck, enemyBase.reinforce, difficulty);

enemyBaseDeckTotalCards = enemyBase.enemyBaseDeck.length;

shuffle(enemyBase.enemyBaseDeck);
