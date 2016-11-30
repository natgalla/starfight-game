const Game = function() {
  this.difficulty = 3;
  this.roundNumber = 0;
  this.friendlies = [FriendlyBase, Player1, Player2, Player3, Player4];
  this.tacticalDeck = [];
  this.tacticalDiscard = [];
}

Game.prototype.logRound = function() {
  console.log(gameID + "." + this.roundNumber);
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    console.log(player.summary);
  }
}

Game.prototype.randomIndex = function(number) {
   let random = Math.floor(Math.random() * number);
   return random;
 }

Game.prototype.shuffle = function(deck) {
    let randIndex, x, i;
    for (i = deck.length; i; i--) {
        randIndex = Math.floor(Math.random() * i);
        x = deck[i - 1];
        deck[i - 1] = deck[randIndex];
        deck[randIndex] = x;
    }
}

Game.prototype.checkDeck = function(deck, discard) {
  // if deck is empty, replace with discard and shuffle
  if (deck.length === 0) {
    while (discard.length > 0) {
      deck.push(discard.pop());
    }
    this.shuffle(deck);
  }
}

Game.prototype.sortByMerit = function() {
  // procedure to sort player order based on merit
  let friendlySort = [];
  let highestMerit = 0;
  let firstFriendlyIndex;
  let baseIndex;
  let friendly;
  let friendyIndex;
  // find the friendly base and set baseIndex to its location
  // determine who has the highest merit. If highest merit is tied, return to default order
  for (let i = 0; i < this.friendlies.length; i++) {
    friendly = this.friendlies[i];
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
    friendlySort.push(this.friendlies.pop(firstFriendlyIndex));
    while (this.friendlies.length > 0) {
      if (firstFriendlyIndex < this.friendlies.length) {
        friendlySort.push(this.friendlies.pop(firstFriendlyIndex));
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
    deck.push(type);
    amount--;
  }
  return deck;
}

Game.prototype.replace = function(amount, deck, discard, active) {
  // prodecure for replacing active cards
  let discarding = amount;
  for (let i = discarding; i > 0; i--) {
    if (active.length > 0) {
      discard.push(active.pop());
    }
    discarding--;
  }
  for (let i = discarding; i < amount; i++) {
    this.checkDeck(deck, discard);
    active.push(deck.pop());
    discarding++;
  }
}

Game.prototype.turns = function() {
  this.turnNumber = 1;
  while (true) {
    // calculate amount of tactical cards left
    let tacticalCards = 0;
    for (let i = 0; i < this.friendlies.length; i++) {
      let player = this.friendlies[i];
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
        let cardChoiceIndex; // get index of .selected card;
        let cardChoice = player.hand.splice(cardChoiceIndex);
        let tCard = cardChoice[0];
        // run the chosen card's function player.tCard();
        tacticalDiscard.push(tCard);
      }
    }
    this.turnNumber ++;
  }
}

Game.prototype.round = function() {
  this.roundNumber++;
  this.logRound();
  if (this.roundNumber === 1) {
    replace(enemyBase.startingEnemies, enemyBase.enemyDeck, enemyBase.enemyDiscard, enemyBase.enemiesActive);
  }

  // sort player order by merit
  this.sortByMerit();

  // distribute new enemies
  if (this.roundNumber === 1) {
    for (let i = 0; i > this.friendlies.length; i++) {
      let friendly = this.friendlies[i];
      for (let p = 0; p > friendly.pursuers.length; p++) {
        friendly.pursuerDamage.push(0);
      }
    }
  }

  // replace tactical cards from last turn
  for (let i = 0; i > this.friendlies.length; i++) {
    let player = this.friendlies[i];
    if (player === FriendlyBase) {
      continue;
    } else {
      this.replace(player.tacticalCardsPerTurn, this.tacticalDeck, this.tacticalDiscard, player.hand);
    }
  }

  // ensure pursuer list and pursuer damage lists are the same length
  for (let i = 0; i > friendlies.length; i++) {
    let friendly = this.friendlies[i];
    while (friendly.pursuerDamage.length != friendly.pursuers.length) {
      if (friendly.pursuerDamage.length > friendly.pursuers.length) {
        friendly.pursuerDamage.pop();
      } else if (friendly.pursuerDamage.length < friendly.pursuers.length) {
        friendly.pursuerDamage.push(0);
      }
    }
  }

  // refresh play area

  this.turns();

  // deal pursuer damage to friendlies
  // check if any friendlies died

  // replace the active enemy base card
  // show the new enemy base
  // run the enemy base card's function
  // check if the friendly base was destroyed

  // discard empty space cards and remove destroyed place holders
}

const game = new Game();
//build enemy deck
game.addToDeck(enemyBase.enemyDeck, ace, 4);
game.addToDeck(enemyBase.enemyDeck, heavy, 9);
game.addToDeck(enemyBase.enemyDeck, medium, 12);
game.addToDeck(enemyBase.enemyDeck, light, 15);
game.addToDeck(enemyBase.enemyDeck, empty, 12);

game.enemyDeckTotalCards = enemyBase.enemyDeck.length;

game.shuffle(enemyBase.enemyDeck);

//build tactical deck
game.addToDeck(game.tacticalDeck, missile, 8);
game.addToDeck(game.tacticalDeck, repairDrone, 3);
game.addToDeck(game.tacticalDeck, assist, 3);
game.addToDeck(game.tacticalDeck, drawFire, 4);
game.addToDeck(game.tacticalDeck, heatSeeker, 2);
game.addToDeck(game.tacticalDeck, bomb, 3);
game.addToDeck(game.tacticalDeck, feint, 2);
game.addToDeck(game.tacticalDeck, barrelRoll, 3);
game.addToDeck(game.tacticalDeck, scatterShot, 3);
game.addToDeck(game.tacticalDeck, immelman, 3);
game.addToDeck(game.tacticalDeck, jammer, 2);

game.tacticalDeckTotalCards = tacticalDeck.length;

game.shuffle(game.tacticalDeck);

//build enemy base deck
game.addToDeck(enemyBase.enemyBaseDeck, enemyBase.fireLight, 3);
game.addToDeck(enemyBase.enemyBaseDeck, enemyBase.fireHeavy, 2);
game.addToDeck(enemyBase.enemyBaseDeck, enemyBase.deploy, 2);
game.addToDeck(enemyBase.enemyBaseDeck, enemyBase.repair, 3);
game.addToDeck(enemyBase.enemyBaseDeck, enemyBase.reinforce, game.difficulty);

game.enemyBaseDeckTotalCards = enemyBase.enemyBaseDeck.length;

game.shuffle(enemyBase.enemyBaseDeck);
