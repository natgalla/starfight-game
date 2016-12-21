// let friendlies = require("./friendlies");
// let tactical = require("./tactical");
// let enemies = require("./enemies");

const Game = function() {
  this.name = "Starfire";
  this.difficulty = 3;
  this.roundNumber = 0;
  this.friendlies = [FriendlyBase, Player1, Player2];
  this.tacticalDeck = {
    name: "Tactical deck",
    cards: [],
    discard: []
  };
  this.gameID = 1;
}

Game.prototype.moveCard = function(index, origin, destination) {
  let removed = origin.splice(index, 1);
  destination.push(removed[0]);
  origin.join();
}

Game.prototype.randomIndex = function(number) {
   let random = Math.floor(Math.random() * number);
   return random;
 }

Game.prototype.shuffle = function(deck) {
    let randIndex, x, i;
    let length, list;
    if (deck.cards === undefined) {
      length = deck.length;
      list = deck;
    } else {
      length = deck.cards.length;
      list = deck.cards;
    }
    for (i = length; i; i--) {
        randIndex = Math.floor(Math.random() * i);
        x = list[i - 1];
        list[i - 1] = list[randIndex];
        list[randIndex] = x;
    }
}

Game.prototype.checkDeck = function(deck) {
  // if deck is empty, replace with discard and shuffle
  if (deck.cards.length === 0) {
    while (deck.discard.length > 0) {
      deck.cards.push(deck.discard.pop());
    }
    this.shuffle(deck);
    console.log(deck.name + " shuffled.");
  }
}

Game.prototype.setEmpties = function(twoP, threeP, fourP) {
  if (this.friendlies.length === 3) {
    return twoP;
  } else if (this.friendlies.length === 4) {
    return threeP;
  } else {
    return fourP;
  }
}

Game.prototype.sortByMerit = function() {
  // procedure to sort player order based on merit
  let friendlySort = [];
  let highestMerit = 0;
  let firstFriendlyIndex;
  let baseIndex;
  let friendyIndex;

  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    // 1. Find the friendly base and set baseIndex to its location.
    if (friendly === FriendlyBase) {
      baseIndex = i;
    // 2. Determine who has the highest merit.
    } else if (friendly.merit > highestMerit) {
      highestMerit = friendly.merit;
      firstFriendlyIndex = i;
    // 3. If highest merit is tied, return to default order.
    } else if (friendly.merit === highestMerit) {
      firstFriendlyIndex = baseIndex;
    }
  }
  // Reorder the friendly list so that the player with highest merit is first
  // Original turn order is always maintained.
  if (firstFriendlyIndex > 0) {
    let firstPlayer = this.friendlies.splice(firstFriendlyIndex, 1);
    friendlySort.push(firstPlayer[0]);
    this.friendlies.join();
    while (this.friendlies.length > 0) {
      if (firstFriendlyIndex < this.friendlies.length) {
        let firstPlayer = this.friendlies.splice(firstFriendlyIndex, 1);
        friendlySort.push(firstPlayer[0]);
        this.friendlies.join();
      } else {
        friendlySort.push(this.friendlies.shift());
      }
    }
    this.friendlies = friendlySort;
  }
  // return friendlies;
}

Game.prototype.addToDeck = function(deck, type, amount) {
  // procedure that adds cards to a given deck
  while (amount > 0) {
    deck.cards.push(type);
    amount--;
  }
  return deck;
}

Game.prototype.replaceCards = function(amount, deck, active) {
  // prodecure for replacing active cards
  let discarding = amount;
  for (var i = amount; i > 0; i--) {
    if (active.length > 0) {
      deck.discard.push(active.pop());
    }
  }
  for (var i = 0; i < amount; i++) {
    this.checkDeck(deck);
    active.push(deck.cards.pop());
    discarding++;
  }
}

Game.prototype.distributeEnemies = function(source) {
  while (source.length > 0) {
    for (let i = 0; i < this.friendlies.length; i++) {
      let friendly = this.friendlies[i];
      if (source.length > 0 && friendly.effects.incinerator) {
        friendly.pursuers.push(source.pop());
        console.log(friendly.name + " incinerates " + friendly.pursuers[friendly.pursuers.length-1].name);
        enemyBase.enemyDeck.discard.push(friendly.pursuers.pop());
        friendly.incinerator = false;
      } else if (source.length > 0) {
        friendly.pursuers.push(source.pop());
      } else {
        break;
      }
    }
  }
}

Game.prototype.turns = function() {
  this.turnNumber = 1;
  while (true) {
    // calculate amount of tactical cards left
    let tacticalCards = 0;
    for (let i = 0; i < this.friendlies.length; i++) {
      let player = this.friendlies[i];
      console.log(this.gameID + "." + this.roundNumber + "." + this.turnNumber
                  + ": " + player.name);
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
    for (let i = 0; i < this.friendlies.length; i++) {
      let player = this.friendlies[i];
      if (player === FriendlyBase) {
        continue;
      } else {
        let cardChoiceIndex = $("#playerHand").children().index($(".selected"));
        let cardChoice = player.hand(cardChoiceIndex);
      }
    }
    this.turnNumber ++;
  }
}

//build enemy base deck
Game.prototype.buildEnemyBaseDeck = function() {
  this.addToDeck(enemyBase.enemyBaseDeck, fireLight, 3);
  this.addToDeck(enemyBase.enemyBaseDeck, fireHeavy, 2);
  this.addToDeck(enemyBase.enemyBaseDeck, deploy, 2);
  this.addToDeck(enemyBase.enemyBaseDeck, repair, 3);
  let deckSize = enemyBase.enemyBaseDeck.cards.length;
  let subDeckSize = Math.floor(deckSize/this.difficulty);
  let splitDecks = {};
  for (let i = 0; i < this.difficulty; i++) {
    let key = "d" + i;
    if (enemyBase.enemyBaseDeck.cards.length > subDeckSize + 1) {
      splitDecks[key] = enemyBase.enemyBaseDeck.cards.splice(0, subDeckSize);
    } else {
      splitDecks[key] = enemyBase.enemyBaseDeck.cards;
    }
  }
  let deckAssembled = [];
  for (deck in splitDecks) {
    splitDecks[deck].push(reinforce);
    this.shuffle(splitDecks[deck]);
    while (splitDecks[deck].length > 0) {
      deckAssembled.push(splitDecks[deck].pop());
    }
  }
  enemyBase.enemyBaseDeck.cards = deckAssembled;
}

Game.prototype.update = function() {
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    friendly.updateSummary();
  }
  enemyBase.updateSummary();
}

Game.prototype.round = function() {
  this.roundNumber++;
  console.log("Round: " + this.gameID + "." + this.roundNumber + " begin.");
  // add enemies and advanced tactics into play
  if (this.roundNumber === 1) {
    this.replaceCards(enemyBase.startingEnemies, enemyBase.enemyDeck,
                      enemyBase.enemiesActive);
    this.replaceCards(FriendlyBase.marketSize, FriendlyBase.advTactics,
                      FriendlyBase.market);
  } else {
    let newEnemies = enemyBase.enemiesPerTurn;
    if (enemyBase.effects.intercepted === true) {
      newEnemies -= 1;
      enemyBase.effects.intercepted = false;
    }
    for (let i = 0; i < newEnemies; i++) {
      enemyBase.addEnemy();
    }
    if (enemyBase.effects.deploy === true) {
      enemyBase.addEnemy();
      enemyBase.effects.deploy = false;
    }
    FriendlyBase.addAdvTactic();
  }

  this.sortByMerit();

  this.distributeEnemies(enemyBase.enemiesActive);
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    friendly.adjustPursuerDamage();
  }

  // replace tactical cards from last turn
  this.friendlies.forEach( function(player) {
    if (player === FriendlyBase) {
      return;
    } else {
      player.resetCardsUsed();
      game.replaceCards(player.tacticalCardsPerTurn,
                        game.tacticalDeck, player.hand);
    }
  });
  // refresh play area
}

Game.prototype.postRound = function() { //strange behavior removing placeholders
  console.log("Round: " + this.gameID + "." + this.roundNumber + " end.");

  // discard empty space cards and remove place holders
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    for (let x = 0; x < friendly.pursuers.length; x++) {
      let enemy = friendly.pursuers[x];
      if (enemy === placeHolder) {
        let removedCard = friendly.pursuers.splice(x, 1);
        friendly.pursuers.join();
        let removedTracker = friendly.pursuerDamage.splice(x, 1);
        friendly.pursuerDamage.join();
      } else if (enemy === empty) {
        this.moveCard(x, friendly.pursuers, enemyBase.enemyDeck.discard);
        let removedTracker = friendly.pursuerDamage.splice(x, 1);
        friendly.pursuerDamage.join();
      }
    }
  }

  // deal pursuer damage to friendlies, handle cases for damage negation
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    let damage = 0;
    for (let x = 0; x < friendly.pursuers.length; x++) {
      let enemy = friendly.pursuers[x];
      damage += enemy.power;
    }
    friendly.takeDamage(friendly.checkDamageNegation(damage));
  }
  // replace the active enemy base card & run the new card's function
  enemyBase.replaceEnemyBaseCard();
  enemyBase.updateSummary();
}

Game.prototype.newRound = function() {
  this.postRound();
  this.round();
}

let game = new Game();

let startGame = function(game) {
  game.addToDeck(game.tacticalDeck, missile, 6);
  game.addToDeck(game.tacticalDeck, scatterShot, 4);
  game.addToDeck(game.tacticalDeck, drawFire, 3);
  game.addToDeck(game.tacticalDeck, feint, 4);
  game.addToDeck(game.tacticalDeck, barrelRoll, 2);
  game.addToDeck(game.tacticalDeck, immelman, 3);
  game.addToDeck(game.tacticalDeck, repairDrone, 2);

  game.tacticalDeck.size = game.tacticalDeck.cards.length;

  game.shuffle(game.tacticalDeck);

  //build advanced tactical deck
  game.addToDeck(FriendlyBase.advTactics, healthPack, 5);
  game.addToDeck(FriendlyBase.advTactics, heatSeeker, 6);
  game.addToDeck(FriendlyBase.advTactics, bomb, 3);
  game.addToDeck(FriendlyBase.advTactics, snapshot, 3);
  game.addToDeck(FriendlyBase.advTactics, guidedMissile, 3);
  game.addToDeck(FriendlyBase.advTactics, incinerate, 3);
  game.addToDeck(FriendlyBase.advTactics, jammer, 6);
  game.addToDeck(FriendlyBase.advTactics, intercept, 3);
  game.addToDeck(FriendlyBase.advTactics, emp, 2);
  game.addToDeck(FriendlyBase.advTactics, countermeasures, 3);
  game.addToDeck(FriendlyBase.advTactics, divertShields, 2);
  game.addToDeck(FriendlyBase.advTactics, jump, 1);
  game.addToDeck(FriendlyBase.advTactics, hardSix, 4);

  FriendlyBase.advTactics.size = FriendlyBase.advTactics.cards.length;

  game.shuffle(FriendlyBase.advTactics);

  //build enemy deck
  game.addToDeck(enemyBase.enemyDeck, ace, 4);
  game.addToDeck(enemyBase.enemyDeck, heavy, 9);
  game.addToDeck(enemyBase.enemyDeck, medium, 12);
  game.addToDeck(enemyBase.enemyDeck, light, 15);
  game.addToDeck(enemyBase.enemyDeck, empty, game.setEmpties(8, 4, 0));

  enemyBase.enemyDeck.size = enemyBase.enemyDeck.cards.length;

  game.shuffle(enemyBase.enemyDeck);

  game.buildEnemyBaseDeck();

  enemyBase.enemyBaseDeck.size = enemyBase.enemyBaseDeck.cards.length;

  enemyBase.startingEnemies = game.friendlies.length * 2;
  enemyBase.enemiesPerTurn = game.friendlies.length;

  game.round();
}
