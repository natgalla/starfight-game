//IF MIGRATED TO SERVER SIDE
// let enemies = require("./enemies");
// let tactical = require("./tactical");


/**************************
FRIENDLY BASE CONSTRUCTOR
**************************/

const Friendly = function(id, name, maxArmor) {
  this.id = id;
  this.name = name;
  this.maxArmor = maxArmor;
  this.pursuers = [];
  this.pursuerDamage = [];
  this.effects = {
    medalOfHonor: false,
    medic: false,
    daredevil: false,
    sharpShooter: false,
    emp: false,
    countermeasures: false,
    divertShields: 0,
    status: "Pursued"
  };
  this.market = [];
  this.marketSize = 4;
  this.advTactics = {
    name: "Advanced tactics",
    cards: [],
    discard: []
  };
  this.currentArmor = maxArmor;
  this.summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
            + "<p class='pursued'>" + this.effects.status + "</p>";
}



/**************************
FRIENDLY BASE UTILITY METHODS
**************************/

Friendly.prototype.adjustPursuerDamage = function() { // Player should inherit
  while (this.pursuerDamage.length < this.pursuers.length) {
    this.pursuerDamage.push(0);
  }
  while (this.pursuerDamage.length > this.pursuers.length) {
    this.pursuerDamage.pop();
  }
}

Friendly.prototype.updateSummary = function() {
  this.effects.status = "Free";
  this.summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
  for (let i=0; i<this.pursuers.length; i++) {
    let enemy = this.pursuers[i];
    if (enemy.merit > 0) {
      this.effects.status = "Pursued";
    }
  }
  if (this.effects.status === "Pursued") {
    this.summary += "<p class='pursued'>" + this.effects.status + "</p>";
  } else {
    this.summary += "<p class='free'>" + this.effects.status + "</p>";
  }
}

Friendly.prototype.removeAdvTactic = function(index) {
  game.moveCard(index, this.market, game.tacticalDeck.discard);
}

Friendly.prototype.addAdvTactic = function() {
  let addToMarket = this.marketSize - this.market.length;
  for (let i = 0; i < addToMarket; i++) {
    game.checkDeck(this.advTactics);
    this.market.push(this.advTactics.cards.pop());
  }
}

Friendly.prototype.checkShields = function(damage) {
  if (this.effects.divertShields > 0) {
    let difference = this.effects.divertShields - damage;
    if (difference > 0) {
      this.effects.divertShields -= damage;
      damage = 0;
    } else if (difference < 0) {
      damage -= this.effects.divertShields;
      this.effects.divertShields = 0;
    } else {
      damage = 0;
      this.effects.divertShields = 0;
    }
    console.log(this.name + "'s shields reduce damage to "
                + damage);
  }
  return damage;
}

Friendly.prototype.checkDamageNegation = function(damage) {
  if (this.effects.emp) {
    console.log(this.name + " is protected by EMP.");
    this.effects.emp = false;
    return 0;
  } else {
    return damage;
  }
}

Friendly.prototype.takeDamage = function(damage) {
  // take damage
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor < 0) {
      this.currentArmor = 0;
    }
    if (this.currentArmor === 0) {
      console.log(this.name + " has been destroyed. Players lose.")
      //end game;
    } else {
      console.log(this.name + " takes " + damage + " damage. Current armor: "
                  + this.currentArmor + "/" + this.maxArmor);
    }
  }
}

Friendly.prototype.insertPlaceholder = function(index) { // Player should inherit
  //removes an enemy card from the fray and inserts a "destroyed" place holder
  this.pursuers.splice(index, 0, placeHolder);
  this.pursuers.join();
}



/**************************
PLAYER CONSTRUCTOR
**************************/

const Player = function(id, name) {
  this.id = id;
  this.name = name;
  this.maxArmor = 10;
  this.currentArmor = this.maxArmor;
  this.tacticalCardsPerTurn = 3;
  this.lastCardUsed = null;
  this.hand = [];
  this.pursuers = [];
  this.pursuerDamage = [];
  this.merit = 0;
  this.combatDie = [0,0,0,1,1,2];
  this.improvedDie = [0,0,1,1,1,2];
  this.missileDie = [0,0,1,1,2,2];
  this.amtImproved = 0;
  this.effects = {
    medalOfHonor: false,
    medic: false,
    daredevil: false,
    sharpShooter: false,
    emp: false,
    countermeasures: false,
    divertShields: 0,
    incinerator: false,
    status: "Pursued"
  };
  this.summary = "<h3>" + this.name + "</h3>"
                + "<p>Armor: " + this.currentArmor + "/"
                + this.maxArmor + "</p>"
                + "<p>Merit: " + this.merit + "</p>"
                + "<p class='pursued'>" + this.effects.status + "</p>";
}



/**************************
PLAYER UTILITY METHODS
**************************/



Player.prototype.insertPlaceholder = Friendly.prototype.insertPlaceholder;
Player.prototype.checkShields = Friendly.prototype.checkShields;
Player.prototype.adjustPursuerDamage = Friendly.prototype.adjustPursuerDamage;

Player.prototype.resetCardsUsed = function() {
  this.lastCardUsed = null;
}

Player.prototype.updateSummary = function() {
  this.effects.status = "Free";
  this.summary = "<h3>" + this.name + "</h3>"
                  + "<p>Armor: " + this.currentArmor
                  + "/" + this.maxArmor + "</p>"
                  + "<p>Merit: " + this.merit + "</p>";
  for (let i=0; i<this.pursuers.length; i++) {
    let enemy = this.pursuers[i];
    if (enemy.merit > 0) {
      this.effects.status = "Pursued";
    }
  }
  if (this.effects.status === "Pursued") {
    this.summary += "<p class='pursued'>" + this.effects.status + "</p>";
  } else {
    this.summary += "<p class='free'>" + this.effects.status + "</p>";
  }
}

Player.prototype.setAmtImproved = function() {
  // set interval for the amount of improved dice
  this.amtImproved = Math.floor(this.merit/5);
}

Player.prototype.damageRoll = function(list) {
  // return a random value from a list
  return list[Math.floor(Math.random() * list.length)];
}

Player.prototype.increaseMerit = function(amount) {
  let merit = amount;
  if (this.effects.medalOfHonor === true) {
    merit += 1;
  }
  this.merit += merit;
  console.log(this.name + " receives " + merit + " merit.");
}

// calculate damage // only returning 0
Player.prototype.calcDamage = function(dice) {
  // roll a combat die x times and add the rolls together
  let totalRolls = dice;
  let improvedRolls = this.amtImproved;
  let normalRolls = totalRolls - improvedRolls;
  let damage = 0;
  while (normalRolls > 0) {
      damage += this.damageRoll(this.combatDie);
      normalRolls--;
    }
  while (improvedRolls > 0) {
      damage += this.damageRoll(this.improvedDie);
      improvedRolls--;
    }
    return damage;
}

Player.prototype.checkDeath = function() {
  // see if player is dead
  if (this.currentArmor <= 0) {
    console.log(this.name + " has been destroyed.");
    game.distributeEnemies(this.pursuers);
    game.friendlies.splice(game.friendlies.indexOf(this), 1);
    game.friendlies.join();
    if (game.friendlies === [FriendlyBase]) {
      console.log("All pilots destroyed. Players lose.");
    }
  }
}

Player.prototype.checkDamageNegation = function(damage) {
  if (damage > 0) {
    if (this.effects.emp) {
      console.log(this.name + " is protected by EMP.");
      this.effects.emp = false;
      return 0;
    } else {
      damage = this.checkShields(damage);
      if (this.effects.countermeasures) {
        let counterDamage = this.calcDamage(4);
        console.log(this.name + " deploys countermeasures to avoid "
                    + counterDamage + " damage.");
        damage -= counterDamage;
        this.effects.countermeasures = false;
      }
      if (damage < 0) {
        damage = 0;
        console.log("All damage to " + this.name + " negated.");
      } else {
        return damage;
      }
    }
  } else {
    return damage;
  }
}

Player.prototype.takeDamage = function(damage) {
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor < 0) {
      this.currentArmor = 0;
    }
    console.log(this.name + " takes " + damage + " damage. Current armor: "
                + this.currentArmor + "/" + this.maxArmor);
  }
}

Player.prototype.checkKill = function(friendly, index) {
  // if kill: award merit, insert placeholder
  if (friendly.pursuerDamage[index] >= friendly.pursuers[index].armor) {
    console.log(friendly.pursuers[index].name + " pursuing " + friendly.name
                + " destroyed.")
    this.increaseMerit(friendly.pursuers[index].merit);
    game.moveCard(index, friendly.pursuers, enemyBase.enemyDeck.discard);
    friendly.insertPlaceholder(index);
  }
}

Player.prototype.doDamage = function(friendly, index, damage) {
  // if damage is more than 0, deal damage to a selected enemy, check for kill
  // does not allow damage to empty space or place holders
  if (friendly === undefined) {
    friendly = this;
  }
  if (index === undefined) {
    index = 0;
  }
  if (friendly === enemyBase) {
    enemyBase.takeDamage(damage);
    console.log(this.name + " deals " + damage + " damage to enemy base.");
    this.increaseMerit(1);
  } else {
    if (friendly.pursuers[index] === empty
      || friendly.pursuers[index] === placeHolder) {
      console.error("No enemy at index " + index);
    } else {
      if (damage > 0) {
        friendly.pursuerDamage[index] += damage;
        let enemyArmor = friendly.pursuers[index].armor - friendly.pursuerDamage[index];
        if (enemyArmor < 0) {
          enemyArmor = 0;
        }
        console.log(this.name + " deals " + damage + " damage to "
                    + friendly.pursuers[index].name + " pursuing "
                    + friendly.name + ". Current armor: "
                    + enemyArmor
                    + "/" + friendly.pursuers[index].armor);
        this.checkKill(friendly, index);
      } else {
        console.log("No damage to target.");
      }
    }
  }
}



/**************************
PLAYER TACTICAL FUNCTIONS
**************************/

Player.prototype.fire = function(friendly, pursuerIndex) {
  // deal damage equal to 4 combat dice to target
  let damage = this.calcDamage(4);
  this.doDamage(friendly, pursuerIndex, damage);
}

Player.prototype.evade = function(friendly, pursuerIndex) {
  if (friendly === undefined) {
    friendly = this;
  }
  // choose a target and attempt evade (D6 vs. enemy targeting)
  let evadeRoll = Math.floor(Math.random() * 6) + 1;
  let pursuer = this.pursuers[pursuerIndex];
  if (evadeRoll >= pursuer.targeting) {
    console.log(this.name + " shakes " + pursuer.name + " to friendly base.");
    game.moveCard(pursuerIndex, this.pursuers, FriendlyBase.pursuers);
    game.moveCard(pursuerIndex, this.pursuerDamage, FriendlyBase.pursuerDamage);
    this.insertPlaceholder(pursuerIndex);
    this.adjustPursuerDamage();
    FriendlyBase.adjustPursuerDamage();
  } else {
    console.log(this.name + " can't shake 'em!")
  }
}

Player.prototype.missile = function(friendly, pursuerIndex) {
  // deal damage equal to 5 combat dice to target
  let damage = this.calcDamage(4) + this.damageRoll(this.missileDie);
  this.doDamage(friendly, pursuerIndex, damage);
}

Player.prototype.heatSeeker = function(friendly, pursuerIndex) {
  // deal 5 damage to target
  this.doDamage(friendly, pursuerIndex, 5);
}

Player.prototype.bomb = function(friendly, pursuerIndex, damage, collateral) { // throwing error when attack enemyBase
    // deal 6 damage to target and 2 damage to each adjacent targeting
    // if there is no adjacent target, collateral damage is applied to pursued ally
    // flat 10 damage to enemyBase
    if (pursuerIndex === undefined) {
      pursuerIndex = 0;
    }
    if (damage === undefined) {
      damage = 6;
    }
    if (collateral === undefined) {
      collateral = 2;
    }
    let friendlyFire = 0;
    if (friendly === enemyBase) {
      baseDamage = damage+(collateral*2);
      this.doDamage(enemyBase, pursuerIndex, baseDamage);
    } else {
      let adjacentLeft = pursuerIndex - 1;
      let adjacentRight = pursuerIndex + 1;
      if (friendly.pursuers[adjacentLeft] === placeHolder) {
        while (friendly.pursuers[adjacentLeft] === placeHolder) {
          adjacentLeft -= 1;
        }
      }
      if (friendly.pursuers[adjacentRight] === placeHolder) {
        while (friendly.pursuers[adjacentRight] === placeHolder) {
          adjacentRight += 1;
        }
      }
      if (adjacentRight < friendly.pursuers.length &&
        friendly.pursuers[adjacentRight] != empty) {
          this.doDamage(friendly, adjacentRight, collateral);
      } else {
          friendlyFire += collateral;
      }
      this.doDamage(friendly, pursuerIndex, damage);
      if (adjacentLeft > -1 &&
        friendly.pursuers[adjacentLeft] != empty) {
          this.doDamage(friendly, adjacentLeft, collateral);
      } else {
          friendlyFire += collateral;
      }
      friendly.takeDamage(friendly.checkShields(friendlyFire));
    }
}

Player.prototype.repairDrone = function(friendly, index, repairPoints, meritReward) {
  // repair a selected ally, can choose self, award merit if not self
  if (index === undefined) {
    index = 0;
  }
  if (repairPoints === undefined) {
    repairPoints = 3;
  }
  if (meritReward === undefined) {
    meritReward = 2;
  }
  if (friendly.currentArmor < friendly.maxArmor) {
    friendly.currentArmor += repairPoints;
    if (friendly.currentArmor > friendly.maxArmor) {
      friendly.currentArmor = friendly.maxArmor;
    }
    if (this != friendly) {
      this.increaseMerit(meritReward);
    }
    console.log(this.name + " repairs " + repairPoints + " damage on "
                + friendly.name + ". Current armor: "
                + friendly.currentArmor + "/" + friendly.maxArmor)
  } else {
    console.error(friendly.name + " is already at maximum armor.");
  }
}

Player.prototype.drawFire = function(friendly, index) {
  // choose an ally's pursuer and bring it to you
  console.log(friendly.pursuers[index].name + " moves from " + friendly.name
              + " to " + this.name + ".");
  this.increaseMerit(friendly.pursuers[index].merit);
  game.moveCard(index, friendly.pursuers, this.pursuers);
  game.moveCard(index, friendly.pursuerDamage, this.pursuerDamage);
  friendly.insertPlaceholder(index);
  this.adjustPursuerDamage();
  friendly.adjustPursuerDamage();
}

Player.prototype.feint = function(friendly, pursuerIndex) {
  // choose a tCard previously used this round and play it again
  if (this.lastCardUsed) {
    let card = this.lastCardUsed;
    let action = this.lastCardUsed.cssClass;
    console.log(this.name + " uses feint to play " + card.name)
    this[action](friendly, pursuerIndex);
  } else {
    console.error("No action to feint");
  }
}

Player.prototype.barrelRoll = function(friendly, pursuerIndex) {
  if (friendly === undefined) {
    friendly = this;
  }
  // move pursuer at pursuerIndex to friendly base
  console.log(this.name + " does a barrel roll! " + this.pursuers[pursuerIndex].name + " now pursues "
              + FriendlyBase.name + ".");
  game.moveCard(pursuerIndex, this.pursuers, FriendlyBase.pursuers);
  game.moveCard(pursuerIndex, this.pursuerDamage, FriendlyBase.pursuerDamage);
  this.insertPlaceholder(pursuerIndex);
  this.adjustPursuerDamage();
  FriendlyBase.adjustPursuerDamage();
}

Player.prototype.scatterShot = function(friendly, pursuerIndex) {
  // deal a small amount of damage to 3 adjacent targets
  this.bomb(friendly, pursuerIndex, 2, 1)
}

Player.prototype.immelman = function(friendly, index) {
  // bind click events to the player's pursuers
  // have them choose a pursuer
  this.missile(this, index);
}



/**************************
PLAYER ADVANCED TACTICAL FUNCTIONS
**************************/

Player.prototype.medalOfHonor = function() {
  this.effects.medalOfHonor = true;
  console.log(this.name + " will now receive +1 merit any time they are awarded merit.");
}

Player.prototype.daredevil = function() {
  // allow player to attack enemy base if they have one or no pursuers
  this.effects.daredevil = true;
  console.log(this.name + " can now attack the enemy base with one pursuer.");
}

Player.prototype.medic = function() {
  this.effects.medic = true;
  console.log(this.name + " can now repair 1 damage on a chosen ally each round.");
}

Player.prototype.sharpShooter = function() {
  this.effects.sharpShooter = true;
  console.log(this.name + " is now better at hurting things.");
}

Player.prototype.healthPack = function(friendly, index) {
  if (index === undefined) {
    index = 0;
  }
  this.repairDrone(friendly, index, 5, 0);
}

Player.prototype.intercept = function() {
  enemyBase.effects.intercepted = true;
  console.log(intercept.description);
}

Player.prototype.jammer = function() {
  enemyBase.effects.jammed = true;
  console.log(jammer.description);
}

Player.prototype.emp = function(friendly) {
  friendly.effects.emp = true;
  console.log(this.name + " blasts " + friendly.name + "'s pursuers with an EMP. "
              + friendly.name + " will not be damaged this round.");
}

Player.prototype.countermeasures = function() {
  this.effects.countermeasures = true;
  console.log(this.name + " prepares countermeasures...")
}

Player.prototype.divertShields = function() {
  this.effects.divertShields = 5;
  console.log(this.name + " powers up shields. Next 5 damage will be negated.")
}

Player.prototype.jump = function() {
  // shake all pursuers
  console.log(this.name + " shakes " + this.pursuers.length
              + " pursuers to the friendly base.");
  for (let i = 0; i = this.pursuers.length; i++) {
    enemyBase.enemyDeck.discard.push(this.pursuers.pop());
  }
}

Player.prototype.hardSix = function() {
  console.log("Sometimes you gotta roll the hard six.");
  this.missile(enemyBase, undefined);
  this.takeDamage(this.calcDamage(4));
}

Player.prototype.snapshot = function(friendly, pursuerIndex) {
  console.log(this.name + " destroys " + friendly.pursuers[pursuerIndex].name
              + " pursuing " + friendly.name);
  game.moveCard(pursuerIndex, friendly.pursuers, enemyBase.enemyDeck.discard);
  this.insertPlaceholder(pursuerIndex);
}

Player.prototype.guidedMissile = function() {
  console.log(this.name + " fires a guided missile at " + enemyBase.name);
  enemyBase.takeDamage(6);
}

Player.prototype.incinerate = function() {
  console.log(this.name + " prepares afterburner...");
  this.effects.incinerator = true;
}


/**************************
GENERIC FUNCTIONS TO USE TACTICAL CARDS
**************************/

Player.prototype.useAdvTactic = function(advTactic, friendly, pursuerIndex) {
  // takes the index of a market card and uses that card if the player has enough merit
  // optional arguments 'friendly' and 'pursuerIndex' defines a target for the card
  if (friendly === undefined) {
    friendly = this;
  }
  let choice = FriendlyBase.market[advTactic];
  this.lastCardUsed = choice;
  let action = choice.cssClass;
  if (this.merit >= choice.cost) {
    this.merit -= choice.cost;
    this[action](friendly, pursuerIndex);
    FriendlyBase.removeAdvTactic(advTactic);
  } else {
    console.log(this.name + " does not have enough merit.");
  }
}

Player.prototype.useTactic = function(cardIndex, friendly, pursuerIndex) {
  // takes the index of a card in hand and uses that card
  // optional argument 'friendly' defines a player target for the card
  // optional argument 'pursuerIndex' defines an enemy target in friendly.hand
  if (friendly === undefined) {
    friendly = this;
  }
  if (pursuerIndex === undefined) {
    pursuerIndex = 0;
  }
  let card = this.hand[cardIndex];
  let action = card.cssClass;
  console.log(this.name + " uses " + card.name)
  this[action](friendly, pursuerIndex);
  if (action != "feint") {
    this.lastCardUsed = card;
  }
  game.moveCard(cardIndex, this.hand, game.tacticalDeck.discard)
  if (friendly === this) {
    this.updateSummary();
  } else {
    this.updateSummary();
    friendly.updateSummary();
  }
}

Player.prototype.discard = function(cardIndex, action, friendly, pursuerIndex, advIndex) {
  if (friendly === undefined) {
    friendly = this;
  }
  if (pursuerIndex === undefined) {
    pursuerIndex = 0;
  }
  if (action === "useAdvTactic") {
    this.useAdvTactic(advIndex, friendly, pursuerIndex);
  } else {
    this[action](friendly, pursuerIndex);
  }
  game.moveCard(cardIndex, this.hand, game.tacticalDeck.discard);
  if (friendly === this) {
    this.updateSummary();
  } else {
    this.updateSummary();
    friendly.updateSummary();
  }
}


//temporarily declared as var for Safari
var FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
var Player1 = new Player("Player1", "Player 1");
var Player2 = new Player("Player2", "Player 2");
var Player3 = new Player("Player3", "Player 3");
var Player4 = new Player("Player4", "Player 4");

// IF MIGRATED TO SERVER SIDE
// module.exports.FriendlyBase = FriendlyBase;
// module.exports.Player = Player;
