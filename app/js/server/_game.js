// let friendlies = require("./friendlies");
// let tactical = require("./tactical");
// let enemies = require("./enemies");

const Game = function(id, difficulty) {
  this.name = "Starfighter";
  this.difficulty = difficulty;
  this.roundNumber = 0;
  this.friendlies = [];
  this.tacticalDeck = new Deck("Tactical Deck");
  this.advTactics = new Deck("Advanced tactics");
  this.enemyBaseDeck = new Deck("Enemy Base Deck");
  this.enemyDeck = new Deck("Enemy Deck");
  this.market = [];
  this.marketSize = 4;
  this.enemyBaseCardsPerTurn = 1;
  this.enemiesActive = [];
  this.enemiesPerTurn;
  this.currentEnemyBaseCard = [];
  this.gameID = id;
  this.win = false;
  this.lose = false;
}

Game.prototype.addEnemy = function() {
  this.checkDeck(this.enemyDeck);
  this.enemiesActive.push(this.enemyDeck.cards.pop());
}

Game.prototype.removeAdvTactic = function(index) {
  this.moveCard(index, this.market, this.tacticalDeck.discard);
}

Game.prototype.addAdvTactic = function() {
  let addToMarket = this.marketSize - this.market.length;
  for (let i = 0; i < addToMarket; i++) {
    this.checkDeck(this.advTactics);
    this.market.push(this.advTactics.cards.pop());
  }
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
    deck.shuffles += 1;
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
      if (friendly.effects.dead) {
        continue;
      } else {
        if (source.length > 0 && friendly.effects.incinerator) {
          friendly.pursuers.push(source.pop());
          io.to(currentGame).emit("msg", friendly.name + " incinerates " + friendly.pursuers[friendly.pursuers.length-1].name);
          this.enemyDeck.discard.push(friendly.pursuers.pop());
          friendly.effects.incinerator = false;
        } else if (source.length > 0) {
          friendly.pursuers.push(source.pop());
        } else {
          break;
        }
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
  this.enemyBaseDeck = new Deck("Enemy Base Deck");
  this.addToDeck(game.enemyBaseDeck, fireLight, 3);
  this.addToDeck(game.enemyBaseDeck, fireHeavy, 2);
  this.addToDeck(game.enemyBaseDeck, deploy, 2);
  this.addToDeck(game.enemyBaseDeck, repair, 3);
  let deckSize = game.enemyBaseDeck.cards.length;
  let subDeckSize = Math.floor(deckSize/this.difficulty);
  let splitDecks = {};
  for (let i = 0; i < this.difficulty; i++) {
    let key = "d" + i;
    if (game.enemyBaseDeck.cards.length > subDeckSize + 1) {
      splitDecks[key] = game.enemyBaseDeck.cards.splice(0, subDeckSize);
    } else {
      splitDecks[key] = game.enemyBaseDeck.cards;
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
  game.enemyBaseDeck.cards = deckAssembled;
}

Game.prototype.replaceEnemyBaseCard = function() {
  if (this.effects.jammed === true) {
    this.enemyBaseDeck.discard.push(this.currentEnemyBaseCard.pop());
    enemyBase.effects.jammed = false;
  } else {
    this.replaceCards(this.enemyBaseCardsPerTurn, this.enemyBaseDeck,
                      this.currentEnemyBaseCard);
    let ebCard = this.currentEnemyBaseCard[0];
    this[ebCard.cssClass]();
  }
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
  console.log("Round: " + this.gameID + "." + this.roundNumber);
  // add enemies and game.advTactics tactics into play
  if (this.roundNumber === 1) {
    this.replaceCards(this.startingEnemies, this.enemyDeck,
                      this.enemiesActive);
    this.replaceCards(this.marketSize, this.advTactics,
                      this.market);
  } else {
    let newEnemies = enemyBase.enemiesPerTurn;
    if (enemyBase.effects.intercepted === true) {
      newEnemies -= 1;
      enemyBase.effects.intercepted = false;
    }
    for (let i = 0; i < newEnemies; i++) {
      this.addEnemy();
    }
    if (enemyBase.effects.deploy === true) {
      this.addEnemy();
      enemyBase.effects.deploy = false;
    }
    this.addAdvTactic();
  }

  this.sortByMerit();

  this.distributeEnemies(this.enemiesActive);
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    friendly.adjustPursuerDamage();
  }

  // replace tactical cards from last turn
  this.friendlies.forEach( function(player) {
    if (player === FriendlyBase || player.effects.dead) {
      return;
    } else {
      player.resetCardsUsed();
      game.replaceCards(player.tacticalCardsPerTurn,
                        game.tacticalDeck, player.hand);
    }
  });
  // refresh play area
}

Game.prototype.postRound = function() {
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
        this.moveCard(x, friendly.pursuers, this.enemyDeck.discard);
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
  this.replaceEnemyBaseCard();
  // enemyBase.updateSummary();
}

Game.prototype.newRound = function() {
  this.postRound();
  this.round();
}

Game.prototype.buildDecks = function() {
  // build tactical deck
  this.tacticalDeck = new Deck("Tactical Deck");
  this.addToDeck(this.tacticalDeck, missile, 6);
  this.addToDeck(this.tacticalDeck, scatterShot, 4);
  this.addToDeck(this.tacticalDeck, drawFire, 3);
  this.addToDeck(this.tacticalDeck, feint, 4);
  this.addToDeck(this.tacticalDeck, barrelRoll, 2);
  this.addToDeck(this.tacticalDeck, immelman, 3);
  this.addToDeck(this.tacticalDeck, repairDrone, 2);

  this.tacticalDeck.size = this.tacticalDeck.cards.length;

  this.shuffle(this.tacticalDeck);

  // build advanced tactical deck
  this.advTactics = new Deck("Advanced Tactics");
  this.addToDeck(this.advTactics, healthPack, 5);
  this.addToDeck(this.advTactics, heatSeeker, 6);
  this.addToDeck(this.advTactics, bomb, 3);
  this.addToDeck(this.advTactics, snapshot, 3);
  this.addToDeck(this.advTactics, guidedMissile, 3);
  this.addToDeck(this.advTactics, incinerate, 3);
  this.addToDeck(this.advTactics, jammer, 6);
  this.addToDeck(this.advTactics, intercept, 3);
  this.addToDeck(this.advTactics, emp, 2);
  this.addToDeck(this.advTactics, countermeasures, 3);
  this.addToDeck(this.advTactics, divertShields, 2);
  this.addToDeck(this.advTactics, jump, 1);
  this.addToDeck(this.advTactics, hardSix, 4);

  this.advTactics.size = this.advTactics.cards.length;

  this.shuffle(this.advTactics);

  // build enemy deck
  this.enemyDeck = new Deck("Enemy Deck");
  this.addToDeck(this.enemyDeck, ace, 4);
  this.addToDeck(this.enemyDeck, heavy, 9);
  this.addToDeck(this.enemyDeck, medium, 12);
  this.addToDeck(this.enemyDeck, light, 15);
  this.addToDeck(this.enemyDeck, empty, this.setEmpties(8, 4, 0));

  this.enemyDeck.size = this.enemyDeck.cards.length;

  this.shuffle(this.enemyDeck);

  // build enemy base deck
  this.buildEnemyBaseDeck();

  this.enemyBaseDeck.size = this.enemyBaseDeck.cards.length;

  // set rules dependent on amount of players
  this.startingEnemies = this.friendlies.length * 2;
  this.enemiesPerTurn = this.friendlies.length;
}
