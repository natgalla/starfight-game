const Friendly = function(name, maxArmor) {
  this.name = name;
  this.maxArmor = maxArmor;
  this.pursuers = [];
  this.pursuerDamage = [];
  this.currentArmor = maxArmor;
  this.summary = function() {
            let summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
            return summary;
            };
}

const Player = function(name) {
  this.name = name;
  this.maxArmor = 10;
  this.tacticalCardsPerTurn = 3;
  this.currentArmor = this.maxArmor;
  this.hand = [];
  this.pursuers = [];
  this.pursuerDamage = [];
  this.merit = 0;
  this.combatDie = [0,0,0,1,1,2];
  this.improvedDie = [0,0,1,1,1,2];
  this.amtImproved = 0;
  this.summary = function() {
                let summary = "<div class='playerSummary " + this.name + "'>"
                + "<h3>" + this.name + "</h3>"
                + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
                + "<p>Merit: " + this.merit + "</p>"
                + "</div>";
                return summary;
  };
}

Player.prototype.setAmtImproved = function() {
  this.amtImproved = Math.floor(this.merit/5);
}

Player.prototype.insertPlaceholder = function(index) {
  //removes an enemy card from the fray and inserts a "destroyed" place holder
  let removed = this.pursuers.splice(location);
  enemyBase.enemyDiscard.push(removed[0]);
  this.pursuers.splice(location, 0, placeHolder);
  this.pursuers.join();
}

Player.prototype.damageRoll = function(list) {
  return list[Math.floor(Math.random() * 6)];
}

// calculate damage // only returning 0
Player.prototype.calcDamage = function(dice) {
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

Player.prototype.checkKill = function(friendly, index) {
  if (friendly.pursuers[index].currentArmor <= 0) {
    console.log(friendly.pursuers[index].name + " pursuing " + friendly.name + " destroyed.");
    friendly.pursuers[index].resetArmor();
    friendly.insertPlaceholder(index);
  }
}

Player.prototype.takeDamage = function(damage) {
  // take a given amount damage
  this.currentArmor -= damage;
  console.log(
    this.name + " takes " + damage + " damage. Current armor: "
     + this.currentArmor + "/" + this.maxArmor)
}

Player.prototype.doDamage = function(friendly, index, damage) {
  // deal damage to the enemy at index in friendly.pursuers
  friendly.pursuers[index].takeDamage(damage);
  this.checkKill(friendly, index);
}



/***************************
choose ally and choose enemy
***************************/

Player.prototype.chooseAlly = function() {
  // bind click events to valid allies
}

Player.prototype.chooseEnemy = function() {
  // bind click events to valid targets
}



/********************
tactical card actions
********************/
Player.prototype.fire = function(friendly, index) {
  this.doDamage(friendly, index, this.calcDamage(4));
}

Player.prototype.missile = function(friendly, index) {
  this.doDamage(friendly, index, this.calcDamage(5));
}

Player.prototype.heatseeker = function(friendly, index) {
  this.doDamage(friendly, index, 5);
}

Player.prototype.bomb = function(friendly, index) {
  let damage = 6;
  let collateral = 2;
  let friendlyFire = 0;
  let adjacentLeft = index - 1;
  let adjacentRight = index + 1;
  if (adjacentRight < friendly.pursuers.length) {
      this.doDamage(friendly, adjacentRight, collateral);
  } else {
      friendlyFire += collateral;
  }
  this.doDamage(friendly, index, damage);
  if (adjacentLeft > -1) {
      this.doDamage(friendly, adjacentLeft, collateral);
  } else {
      friendlyFire += collateral;
  }
  friendly.takeDamage(friendlyFire);
}

Player.prototype.repairdrone = function(friendly) {
  // allow player to choose from all allies, including self
  friendly.currentArmor += 3;
  if (friendly.currentArmor >= friendly.maxArmor) {
    friendly.currentArmor = friendly.maxArmor;
  }
  console.log(
    friendly.name + " repaired 3 damage. Current armor: "
    + friendly.currentArmor + "/" + friendly.maxArmor
  );
}

Player.prototype.assist = function() {
  // we still don't know what this does
}

Player.prototype.assist = function() {
  // we still don't even know what this does
}

Player.prototype.feint = function() {
  // choose a tCard previously used this round and play it again
}

Player.prototype.barrelRoll = function() {
  // bind click events to the player's pursuers
  // have them choose a pursuer
  // move that pursuer from the player to the friendly base
}

Player.prototype.scatterShot = function() {
  // like a bomb, but deal small amount of damage
}

Player.prototype.immelmann = function() {
  // bind click events to the player's pursuers
  // have them choose a pursuer
  // use the missile function on that pursuer
}

const FriendlyBase = new Friendly("Friendly Base", 30);
const Player1 = new Player();
const Player2 = new Player();
const Player3 = new Player();
const Player4 = new Player();
