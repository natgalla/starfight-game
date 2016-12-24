const Tactical = function(name, cssClass, description) {
  this.name = name;
  this.cssClass = cssClass;
  this.description = description;
  this.type = "basic";
  this.card = "<li class='tactical " + this.cssClass + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "</li>";
}

const AdvTactical = function(name, cssClass, description, cost) {
  Tactical.call(this, name, cssClass, description);
  this.cost = cost;
  this.type = "advanced";
  this.card = "<li class='advTactical " + this.cssClass + "'>"
              + "<h3>" + this.name + "</h3>"
              + "<p>" + this.description + "</p>"
              + "<p class='cost'>Merit cost: " + this.cost + "</p>"
              + "</li>"
}
AdvTactical.prototype = Object.create(Tactical.prototype);

AdvTactical.prototype.generateCard = function(player) {
  if (player.merit >= this.cost) {
    return "<li class='advTactical " + this.cssClass + " purchasable'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "<p class='cost'> Merit cost: " + this.cost + "</p>"
            + "</li>";
  } else {
    return "<li class='advTactical " + this.cssClass + " unavailable'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "<p class='cost'> Merit cost: " + this.cost + "</p>"
            + "</li>";
  }
}

//temporarily declared as var for safari
// Tactical cards
var repairDrone = new Tactical("Repair drone", "repairDrone", "Remove 3 damage from a friendly (any)");
var missile = new Tactical("Missile", "missile", "Choose a target and roll 5 combat dice");
var drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly (other) and bring it to you");
var feint = new Tactical("Feint", "feint", "Reuse the last tactical card you used this round");
var barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself. It now pursues the friendly base");
var scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 2 damage to a single target, and 1 damage to the target on either side of it");
var immelman = new Tactical("Immelmann", "immelman", "Missile an enemy pursuing you");

// Advanced tactics
// var medalOfHonor = new AdvTactical("Medal of Honor", "medalOfHonor", "Every enemy destroyed is worth 1 extra merit", 10);
// var daredevil = new AdvTactical("Daredevil", "daredevel", "Allows you to attack the EB with 1 pursuer", 10);
// var medic = new AdvTactical("Medic", "medic", "Restore 1 armor to a friendly of your choice each round", 10);
// var sharpShooter = new AdvTactical("Sharp Shooter", "sharpshooter", "Improve player accuracy rolls/add an extra die", 10);
var repairDrone = new AdvTactical("Repair drone", "repairDrone", "Remove 3 damage from a friendly (any)", 3);
var bomb = new AdvTactical("Bomb", "bomb", "Deal 6 damage to a single target, and 2 damage to the target on either side of it", 8);
var heatSeeker = new AdvTactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy", 5);
var healthPack = new AdvTactical("Health Pack", "healthPack", "Remove 5 damage from a friendly (all)", 4);
var jammer = new AdvTactical("Jammer", "jammer", "Do not draw an enemy base card next round", 6);
var intercept = new AdvTactical("Intercept", "intercept", "Draw one less enemy into play next round", 6);
var emp = new AdvTactical("EMP", "emp", "Choose a friendly (other). Their pursuers cannot damage them this round", 5);
var countermeasures = new AdvTactical("Countermeasures", "countermeasures", "Ignore x damage where x is the result of a standard combat roll", 2);
var divertShields = new AdvTactical("Divert Shields", "divertShields", "Keep this card. It absorbs the next 5 damage you take", 3);
var jump = new AdvTactical("Jump", "jump", "Shake all your pursuers this round to discard", 15);
var hardSix = new AdvTactical("Roll the hard six", "hardSix", "If pursued, missile the enemy base and take damage of a standard combat roll", 6);
var snapshot = new AdvTactical("Snapshot", "snapshot", "Remove an enemy from play (no merit awarded)", 7);
var guidedMissile = new AdvTactical("Guided Missile", "guidedMissile", "Deal 6 damage to the enemy base regardless of pursuers", 10);
var incinerate = new AdvTactical("Incinerate", "incinerate", "Destroy the first enemy drawn to you next round", 7);

// IF MIGRATED TO SERVER SIDE
// module.exports.Tactical = Tactical;

const EnemyBase = function() {
  this.name = "Enemy Base";
  this.maxArmor = 30;
  this.currentArmor = 30;
  this.enemyBaseDeck = {
    name: "Enemy Base Deck",
    cards: [],
    discard: [],
  };
  this.enemyBaseCardsPerTurn = 1;
  this.currentEnemyBaseCard = [];
  this.enemyDeck = {
    name: "Enemy Deck",
    cards: [],
    discard: []
  };
  this.enemiesActive = [];
  this.enemiesPerTurn;
  this.effects = {
    jammed: false,
    intercepted: false,
    deploy: false
  }
  this.summary = "<h3>" + this.name + "</h3>"
          + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
          + "<p>Launch rate: " + this.enemiesPerTurn + "</p>";
}

EnemyBase.prototype.updateSummary = function() {
  if (game.roundNumber === 1) {
    this.summary = "<h3>" + this.name + "</h3>"
                    + "<p>Armor: " + this.currentArmor + "/"
                    + this.maxArmor + "</p>"
                    + "<p>Launch rate: " + this.enemiesPerTurn + "</p>";
  } else if (this.currentEnemyBaseCard.length === 0 && game.roundNumber > 1) {
    this.summary = "<h3>" + this.name + "</h3>"
                    + "<p>Armor: " + this.currentArmor + "/"
                    + this.maxArmor + "</p>"
                    + "<p>Launch rate: " + this.enemiesPerTurn + "</p>"
                    + "<div class='enemyBaseCard'><h3>Jammed</h3></div>";
  } else {
    this.summary = "<h3>" + this.name + "</h3>"
                    + "<p>Armor: " + this.currentArmor + "/"
                    + this.maxArmor + "</p>"
                    + "<p>Launch rate: " + this.enemiesPerTurn + "</p>"
                    + this.currentEnemyBaseCard[0].card;
  }
}

EnemyBase.prototype.takeDamage = function(damage) {
  this.currentArmor -= damage;
  if (this.currentArmor < 0) {
    this.currentArmor = 0;
  }
  if (this.currentArmor === 0) {
    console.log(this.name + " destroyed! Players win.");
  }
  this.updateSummary();
}

EnemyBase.prototype.addEnemy = function() {
  game.checkDeck(this.enemyDeck);
  this.enemiesActive.push(this.enemyDeck.cards.pop());
}

EnemyBase.prototype.replaceEnemyBaseCard = function() {
  if (this.effects.jammed === true) {
    this.enemyBaseDeck.discard.push(this.currentEnemyBaseCard.pop());
    this.effects.jammed = false;
  } else {
    game.replaceCards(this.enemyBaseCardsPerTurn, this.enemyBaseDeck,
                      this.currentEnemyBaseCard);
    let ebCard = this.currentEnemyBaseCard[0];
    this[ebCard.cssClass]();
  }
}


/************************
ENEMY BASE CARD FUNCTIONS
*************************/

EnemyBase.prototype.reinforce = function() {
  console.log(this.name + " will launch one extra enemy card into play each round.");
  this.enemiesPerTurn += 1;
}

EnemyBase.prototype.repair = function() {
  this.currentArmor += 5;
  if (this.currentArmor > this.maxArmor) {
    this.currentArmor = this.maxArmor;
  }
  console.log(this.name + " Repairs 5 damage. Current armor: "
              + this.currentArmor + "/" + this.maxArmor);
}

EnemyBase.prototype.fireHeavy = function() {
  console.log(this.name + " fires heavy weapons.");
  FriendlyBase.takeDamage(5);
}

EnemyBase.prototype.fireLight = function() {
  console.log(this.name + " fires light weapons.");
  FriendlyBase.takeDamage(3);
}

EnemyBase.prototype.deploy = function() {
  console.log(this.name + " launches an extra fighter.");
  this.effects.deploy = true;
}

const Enemy = function(name, cssClass, armor, power, targeting, merit) {
  this.name = name;
  this.cssClass = cssClass;
  this.armor = armor;
  this.currentArmor = this.armor;
  this.power = power;
  this.targeting = targeting;
  this.merit = merit;
  if (this.cssClass === "emptySpace" || this.cssClass === "destroyed") {
    this.card = "<li class='enemy " + this.cssClass + "'>";
              + "<h3>" + this.name + "</h3>"
              + "</li>";
  } else {
    this.card = "<li class='enemy " + this.cssClass + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>ARM: " + this.currentArmor + "/" + this.armor + "</p>"
            + "<p>PWR: " + this.power + "</p>"
            + "<p>TGT: " + this.targeting + "</p>"
            + "<p>MRT: " + this.merit + "</p>"
            + "</li>";
  }
}

// Enemy.prototype.updateCard = function(currentArmor) {
//   if (this.cssClass === "emptySpace" || this.cssClass === "destroyed") {
//     this.card = "<li class='enemy " + this.cssClass + "'>";
//               + "<h3>" + this.name + "</h3>"
//               + "</li>";
//   } else {
//     this.card = "<li class='enemy " + this.cssClass + "'>"
//             + "<h3>" + this.name + "</h3>"
//             + "<p>ARM: " + currentArmor + "/" + this.armor + "</p>"
//             + "<p>PWR: " + this.power + "</p>"
//             + "<p>TGT: " + this.targeting + "</p>"
//             + "<p>MRT: " + this.merit + "</p>"
//             + "</li>";
//   }
// }

Enemy.prototype.takeDamage = function(damage) {
  this.currentArmor -= damage;
  if (this.currentArmor < 0) {
    this.currentArmor = 0;
  }
  this.updateCard();
}

Enemy.prototype.resetArmor = function() {
  this.currentArmor = this.armor;
}

const EnemyBaseCard = function(name, cssClass, description) {
  this.name = name;
  this.cssClass = cssClass;
  this.description = description;
  this.card = "<p id='enemyBaseCard'>" + this.description + "</p>";
}

//temporarily declared as var for safari
// define enemy types
var ace = new Enemy("Ace","ace",6,4,5,4);
var heavy = new Enemy("Heavy","heavy",5,3,3,3);
var medium = new Enemy("Medium","medium",4,2,4,2);
var light = new Enemy("Light","light",3,2,4,1);
var empty = new Enemy("Empty space","emptySpace",0,0,0,0);
var placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);

// define enemy base cards
var fireLight = new EnemyBaseCard("Fire light weapons", "fireLight", "Friendly base takes 3 damage");
var fireHeavy = new EnemyBaseCard("Fire heavy weapons", "fireHeavy", "Friendly base takes 5 damage");
var deploy = new EnemyBaseCard("Deploy", "deploy", "Draw an extra enemy card into play in the next round");
var repair = new EnemyBaseCard("Repairs", "repair", "Enemy base repairs 5 armor.");
var reinforce = new EnemyBaseCard("Reinforcements", "reinforce", "Increase the amount enemies that enter the fray each turn by 1");


var enemyBase = new EnemyBase();
// IF MIGRATED TO SERVER SIDE
// module.exports.EnemyBase = EnemyBase;
// module.exports.Enemy = Enemy;

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

// let friendlies = require("./friendlies");
// let tactical = require("./tactical");
// let enemies = require("./enemies");

const Game = function() {
  this.name = "Starfire";
  this.difficulty = 3;
  this.roundNumber = 0;
  this.friendlies = [FriendlyBase, Player1, Player2, Player3];
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

//temporarily declared as var for safari
var game = new Game();


//build tactical deck
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
// game.addToDeck(FriendlyBase.advTactics, medalOfHonor, 1);
// game.addToDeck(FriendlyBase.advTactics, daredevil, 1);
// game.addToDeck(FriendlyBase.advTactics, medic, 1);
// game.addToDeck(FriendlyBase.advTactics, sharpShooter, 1);
game.addToDeck(FriendlyBase.advTactics, healthPack, 5);
game.addToDeck(FriendlyBase.advTactics, heatSeeker, 6);
// game.addToDeck(FriendlyBase.advTactics, repairDrone, 7);
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
// game.addToDeck(enemyBase.enemyBaseDeck, fireLight, 3);
// game.addToDeck(enemyBase.enemyBaseDeck, fireHeavy, 2);
// game.addToDeck(enemyBase.enemyBaseDeck, deploy, 2);
// game.addToDeck(enemyBase.enemyBaseDeck, repair, 3);
// game.addToDeck(enemyBase.enemyBaseDeck, reinforce, game.difficulty);

enemyBase.enemyBaseDeck.size = enemyBase.enemyBaseDeck.cards.length;

// game.shuffle(enemyBase.enemyBaseDeck);

enemyBase.startingEnemies = game.friendlies.length * 2;
enemyBase.enemiesPerTurn = game.friendlies.length;
//IF MIGRATED TO SERVER SIDE
// module.exports.Game = Game;


let root = __dirname;
let port = 8080;
let http = require('http');
let express = require('express');
let socketio = require('socket.io');
// let game = require("./game");

let app = express();
let server = http.createServer(app);
let io = socketio(server);

let waitingPlayer1;
let waitingPlayer2;
let waitingPlayer3;

let packet = {
  game: game,
  FriendlyBase: FriendlyBase,
  Player1: Player1,
  Player2: Player2,
  enemyBase: enemyBase
}

io.on("connect", onConnection);

app.use(express.static(root + "/.."));

server.listen(port, () => console.log("Ready. Listening at http://localhost:" + port));

app.post("/", function(req, res) {
  console.log("POST request to home page");
  let body = "";
  req.on("data", function(data) {
    body += data;
  });
  req.on("end", function() {
    if (body === "start") {
      //build tactical deck
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
      // game.addToDeck(FriendlyBase.advTactics, medalOfHonor, 1);
      // game.addToDeck(FriendlyBase.advTactics, daredevil, 1);
      // game.addToDeck(FriendlyBase.advTactics, medic, 1);
      // game.addToDeck(FriendlyBase.advTactics, sharpShooter, 1);
      game.addToDeck(FriendlyBase.advTactics, healthPack, 5);
      game.addToDeck(FriendlyBase.advTactics, heatSeeker, 6);
      // game.addToDeck(FriendlyBase.advTactics, repairDrone, 7);
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
      // game.addToDeck(enemyBase.enemyBaseDeck, fireLight, 3);
      // game.addToDeck(enemyBase.enemyBaseDeck, fireHeavy, 2);
      // game.addToDeck(enemyBase.enemyBaseDeck, deploy, 2);
      // game.addToDeck(enemyBase.enemyBaseDeck, repair, 3);
      // game.addToDeck(enemyBase.enemyBaseDeck, reinforce, game.difficulty);

      enemyBase.enemyBaseDeck.size = enemyBase.enemyBaseDeck.cards.length;

      // game.shuffle(enemyBase.enemyBaseDeck);

      enemyBase.startingEnemies = game.friendlies.length * 2;
      enemyBase.enemiesPerTurn = game.friendlies.length;
      //IF MIGRATED TO SERVER SIDE
      // module.exports.Game = Game;
      game.round();
      res.send("Game started.");
      updateObjects();
    }
  });
});

function onConnection(socket) {
  socket.emit("msg", "Connection established.");
  if(waitingPlayer3) {
    waitingPlayer4 = socket;
    game.friendlies.push(Player4);
    socket.emit("assign", Player4);
    socket.on("turn", turn);
    io.sockets.emit("msg", Player4.name + " joined game as " + Player4.id);
    waitingPlayer1 = null;
    waitingPlayer2 = null;
    waitingPlayer3 = null;
  } else if (waitingPlayer2) {
    waitingPlayer3 = socket;
    game.friendlies.push(Player3);
    socket.emit("assign", Player3);
    socket.on("turn", turn);
    io.sockets.emit("msg", Player3.name + " joined game as " + Player3.id);
  } else if(waitingPlayer1) {
    waitingPlayer2 = socket;
    socket.emit("assign", Player2);
    socket.on("turn", turn);
    io.sockets.emit("msg", Player2.name + " joined game as " + Player2.id);
    io.sockets.emit("msg", "Game ready");
    // waitingPlayer = null;
  } else {
    waitingPlayer1 = socket;
    socket.emit("msg", "Waiting for second player...");
    socket.emit("assign", Player1)
    socket.on("turn", turn);
  }
}

function notifyGameReady(...sockets) {
  sockets.forEach((socket) => {
    socket.emit("msg", "Game Ready");
  });
}

function updateObjects(vars) {
  game.update();
  let packet = {
    game: game,
    FriendlyBase: FriendlyBase,
    Player1: Player1,
    Player2: Player2,
    enemyBase: enemyBase
  }
  io.sockets.emit("update", packet);
}

function turn(data) {
  console.log("Confirm receipt of turn info");
  let specs = JSON.parse(data);
  let getPlayer = function(id) {
    if (id === "Player1") {
      return Player1;
    } else if (id === "Player2") {
      return Player2;
    } else if (id === "FriendlyBase") {
      return FriendlyBase;
    } else if (id === "enemyBase") {
      return enemyBase;
    }
  }
  let player = getPlayer(specs.player.id);
  let friendly = getPlayer(specs.friendly.id);
  if (specs.button === "use") {
    player.useTactic(specs.cardIndex, friendly, specs.pursuerIndex);
  } else {
    player.discard(specs.cardIndex, specs.button, friendly,
                                          specs.pursuerIndex,
                                          specs.purchaseIndex);
  }
  let cardsLeft;
  game.friendlies.forEach((friendly) => {
    if (friendly === FriendlyBase) {
      return;
    } else {
      cardsLeft += friendly.hand.length;
    }
  });
  if (cardsLeft === 0) {
    game.postRound();
    game.round();
  }
  updateObjects();
}

//# sourceMappingURL=server.js.map
