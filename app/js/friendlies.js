//IF MIGRATED TO SERVER SIDE
// let enemies = require("./enemies");
// let tactical = require("./tactical");

const Friendly = function(name, maxArmor) {
  this.name = name;
  this.maxArmor = maxArmor;
  this.pursuers = [];
  this.market = [];
  this.marketSize = 3;
  this.advTactics = {
    name: "Advanced tactics",
    cards: [],
    discard: []
  };
  this.currentArmor = maxArmor;
  this.summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
            + "<div id='market'><h3>Market</h3></div>";
}

Friendly.prototype.useAdvTactical = function(index) {
  let choice = this.market.splice(index, 1);
  this.advTactics.discard.push(choice[0]);
  this.market.join();
}

Friendly.prototype.updateSummary = function() {
  this.summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
            + "<div id='market'><h3>Market</h3></div>";
}

Friendly.prototype.addAdvTactic = function() {
  let addToMarket = this.marketSize - this.market.length;
  for (let i = 0; i < addToMarket; i++) {
    game.checkDeck(this.advTactics);
    this.market.push(this.advTactics.cards.pop());
  }
}

Friendly.prototype.takeDamage = function(damage) {
  // take damage
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor < 0) {
      this.currentArmor = 0;
    }
    console.log(this.name + " takes " + damage + " damage. Current armor: "
                + this.currentArmor + "/" + this.maxArmor);
  }
  if (this.currentArmor === 0) {
    console.log(this.name + " has been destroyed. Players lose.")
    //end game;
  }
}

const Player = function(name) {
  this.name = name;
  this.maxArmor = 10;
  this.currentArmor = this.maxArmor;
  this.tacticalCardsPerTurn = 3;
  this.cardsUsed = [];
  this.hand = [];
  this.pursuers = [];
  this.merit = 0;
  this.combatDie = [0,0,0,1,1,2];
  this.improvedDie = [0,0,1,1,1,2];
  this.amtImproved = 0;
  this.effects = {
    medalOfHonor: false,
    medic: false,
    daredevil: false,
    sharpShooter: false,
    emp: false,
    countermeasures: false,
    divertShields: 0,
  };
  this.summary = "<div class='playerSummary " + this.name + "'>"
                + "<h3>" + this.name + "</h3>"
                + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
                + "<p>Merit: " + this.merit + "</p>"
                + "</div>";
}

Player.prototype.updateSummary = function() {
  this.summary = "<div class='playerSummary " + this.name + "'>"
                  + "<h3>" + this.name + "</h3>"
                  + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
                  + "<p>Merit: " + this.merit + "</p>"
                  + "</div>";
}

Player.prototype.resetCardsUsed = function() {
  // returns list that keeps track of cards used this round to empty list
  this.cardsUsed = [];
}

Player.prototype.setAmtImproved = function() {
  // set interval for the amount of improved dice
  this.amtImproved = Math.floor(this.merit/5);
}

Player.prototype.insertPlaceholder = function(index) {
  //removes an enemy card from the fray and inserts a "destroyed" place holder
  let removed = this.pursuers.splice(index, 1);
  enemyBase.enemyDiscard.push(removed[0]);
  this.pursuers.splice(index, 0, placeHolder);
  this.pursuers.join();
}

Player.prototype.damageRoll = function(list) {
  // return a random value from a list
  return list[Math.floor(Math.random() * list.length)];
}

Player.prototype.increaseMerit = function(amount) {
  let merit = amount;
  if (this.upgrades.medalOfHonor === true) {
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
    game.friendlies.splice(game.friendlies.indexOf(this), 1);
    game.friendlies.join();
    if (game.friendlies.length === 0) {
      console.log("All pilots destroyed. Players lose.");
    }
  }
}

Player.prototype.takeDamage = function(damage) {
  // take damage
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor < 0) {
      this.currentArmor = 0;
    }
    console.log(this.name + " takes " + damage + " damage. Current armor: "
                + this.currentArmor + "/" + this.maxArmor);
    this.checkDeath();
  }
}

Player.prototype.checkKill = function(friendly, index) {
  // if kill: award merit, insert placeholder
  if (friendly.pursuers[index].currentArmor <= 0) {
    console.log(friendly.pursuers[index].name + " pursuing " + friendly.name
                + " destroyed.")
    this.increaseMerit(friendly.pursuers[index].merit);
    friendly.insertPlaceholder(index);
  }
}

Player.prototype.doDamage = function(friendly, index, damage) {
  if (index === undefined) {
    index = 0;
  }
  if (damage > 0) {
    if (friendly === enemyBase) {
        enemyBase.takeDamage(damage);
        console.log(this.name + " deals " + damage + " damage to "
                    + enemyBase.name + ". Current armor: "
                    + enemyBase.currentArmor + "/"
                    + enemyBase.maxArmor);
        this.increaseMerit(1);
    } else {
      // deal damage to a selected enemy, check for kill
      friendly.pursuers[index].takeDamage(damage);
      console.log(this.name + " deals " + damage + " damage to "
                  + friendly.pursuers[index].name + " pursuing "
                  + friendly.name + ". Current armor: "
                  + friendly.pursuers[index].currentArmor + "/"
                  + friendly.pursuers[index].armor)
      this.checkKill(friendly, index);
    }
  } else {
    console.log("No damage to target.");
  }
}

Player.prototype.chooseAlly = function() {
  for (let i=0; i > game.friendlies.length; i++) {
    let friendly = game.friendlies[i];
    if (friendly === this) {
      continue
    } else {
      // bind a click event to the friendly
    }
  }
}

Player.prototype.chooseEnemy = function() {
  // bind a click event to valid enemies
}

Player.prototype.fire = function(friendly, pursuerIndex) {
  // deal damage equal to 4 combat dice to target
  let damage = this.calcDamage(4);
  this.doDamage(friendly, pursuerIndex, damage);
}

Player.prototype.missile = function(friendly, pursuerIndex) {
  // deal damage equal to 5 combat dice to target
  let damage = this.calcDamage(5);
  this.doDamage(friendly, pursuerIndex, damage);
}

Player.prototype.heatSeeker = function(friendly, pursuerIndex) {
  // deal 5 damage to target
  let damage = 5;
  this.doDamage(friendly, pursuerIndex, damage);
}

Player.prototype.bomb = function(friendly, pursuerIndex) {
    // deal 6 damage to target and 2 damage to each adjacent targeting
    // if there is no adjacent target, collateral damage is applied to pursued ally
    if (pursuerIndex === undefined) {
      pursuerIndex = 0;
    }
    if (friendly === enemyBase) {
      this.doDamage(enemyBase, pursuerIndex, 10);
    } else {
      let damage = 6;
      let collateral = 2;
      let friendlyFire = 0;
      let adjacentLeft = pursuerIndex - 1;
      let adjacentRight = pursuerIndex + 1;
      if (adjacentRight < friendly.pursuers.length) {
          this.doDamage(friendly, adjacentRight, collateral);
      } else {
          friendlyFire += collateral;
      }
      this.doDamage(friendly, pursuerIndex, damage);
      if (adjacentLeft > -1) {
          this.doDamage(friendly, adjacentLeft, collateral);
      } else {
          friendlyFire += collateral;
      }
      friendly.takeDamage(friendlyFire);
    }
}

Player.prototype.repairDrone = function(friendly, repairPoints, meritReward) {
  // repair a selected ally, can choose self, award merit if not self
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
      console.log(this.name + " repairs " + repairPoints + " damage on "
                  + friendly.name + ". Current armor: "
                  + friendly.currentArmor + "/" + friendly.maxArmor)
    }
    if (this != friendly) {
      this.increaseMerit(meritReward);
    }
  } else {
    console.log(friendly.name + " is already at maximum armor.");
  }
}

Player.prototype.drawFire = function(friendly, index) {
  // choose an ally's pursuer and bring it to you
  console.log(friendly.pursuers[index].name + " moves from " + friendly.name
              + " to " + this.name + ".");
  this.increaseMerit(friendly.pursuers[index].merit);
  let selected = friendly.pursuers.splice(index, 1);
  this.pursuers.push(selected[0]);
  friendly.pursuers.join();
}

Player.prototype.assist = function() {
  // we still don't even know what this does
}

Player.prototype.feint = function() {
  // choose a tCard previously used this round and play it again
}

Player.prototype.barrelRoll = function(index) {
  // bind click events to the player's pursuers
  // have them choose a pursuer
  let enemy = this.pursuers.splice[index];
  console.log(this.name + " does a barrel roll! " + enemy.name + " now pursues "
              + FriendlyBase.name + ".");
  FriendlyBase.pursuers.push(enemy[0]);
  this.pursuers.join();
}

Player.prototype.scatterShot = function(friendly, pursuerIndex) {
  if (pursuerIndex === undefined) {
    pursuerIndex = 0;
  }
  if (friendly === enemyBase) {
    this.doDamage(enemyBase, undefined, 3);
  } else {
    let damage = 1;
    let friendlyFire = 0;
    let adjacentLeft = pursuerIndex - 1;
    let adjacentRight = pursuerIndex + 1;
    if (adjacentRight < friendly.pursuers.length) {
        this.doDamage(friendly, adjacentRight, damage);
    } else {
        friendlyFire += damage;
    }
    this.doDamage(friendly, pursuerIndex, damage);
    if (adjacentLeft > -1) {
        this.doDamage(friendly, adjacentLeft, damage);
    } else {
        friendlyFire += damage;
    }
    friendly.takeDamage(friendlyFire);
  }
}

Player.prototype.immelmann = function(index) {
  // bind click events to the player's pursuers
  // have them choose a pursuer
  this.missile(this, index);
}

Player.prototype.medalOfHonor = function() {
  this.effects.medalOfHonor = true;
}

Player.prototype.daredevil = function() {
  // allow player to attack enemy base if they have one or no pursuers
  this.effects.daredevil = true;
}

Player.prototype.medic = function() {
  this.effects.medic = true;
}

Player.prototype.sharpShooter = function() {
  this.effects.sharpShooter = true;
}

Player.prototype.healthPack = function(friendly) {
  this.repairDrone(friendly, 5, 3);
}

Player.prototype.intercept = function() {
  enemyBase.effects.intercepted = true;
}

Player.prototype.jammer = function() {
  enemyBase.effects.jammed = true;
}

Player.prototype.emp = function(friendly) {
  friendly.effects.emp = true;
  console.log(this.name + " blasts " + friendly.name + "'s pursuers with an EMP. "
              + friendly.name + " will not be damaged this round.");
}

Player.prototype.countermeasures = function() {
  friendly.effects.countermeasures = true;
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
    friendlyBase.pursuers.push(this.pursuers.pop());
  }
}

Player.prototype.hardSix = function() {
  console.log("Sometimes you gotta roll the hard six.");
  this.missile(enemyBase, undefined);
  this.takeDamage(this.calcDamage(4));
}

const FriendlyBase = new Friendly("Friendly Base", 30);
const Player1 = new Player();
const Player2 = new Player();
const Player3 = new Player();
const Player4 = new Player();

// IF MIGRATED TO SERVER SIDE
// module.exports.FriendlyBase = FriendlyBase;
// module.exports.Player = Player;
