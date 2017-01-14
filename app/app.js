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

const Deck = function(name) {
  this.name = name;
  this.cards = [];
  this.discard = [];
  this.shuffles = 0;
}

const EnemyBase = function() {
  this.id = "enemyBase";
  this.name = "Enemy Base";
  this.maxArmor = 30;
  this.currentArmor = 30;
  this.effects = {
    jammed: false,
    intercepted: false,
    deploy: false
  }
  this.summary = "<h3>" + this.name + "</h3>"
          + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>"
}

EnemyBase.prototype.updateSummary = function() {
  if (game.roundNumber === 1) {
    this.summary = "<h3>" + this.name + "</h3>"
                    + "<p>Armor: " + this.currentArmor + "/"
                    + this.maxArmor + "</p>"
                    + "<p>Launch rate: " + game.enemiesPerTurn + "</p>";
  } else if (game.currentEnemyBaseCard.length === 0 && game.roundNumber > 1) {
    this.summary = "<h3>" + this.name + "</h3>"
                    + "<p>Armor: " + this.currentArmor + "/"
                    + this.maxArmor + "</p>"
                    + "<p>Launch rate: " + game.enemiesPerTurn + "</p>"
                    + "<div class='enemyBaseCard'><h3>Jammed</h3></div>";
  } else {
    this.summary = "<h3>" + this.name + "</h3>"
                    + "<p>Armor: " + this.currentArmor + "/"
                    + this.maxArmor + "</p>"
                    + "<p>Launch rate: " + this.enemiesPerTurn + "</p>"
                    + game.currentEnemyBaseCard[0].card;
  }
}

EnemyBase.prototype.takeDamage = function(damage) {
  this.currentArmor -= damage;
  if (this.currentArmor < 0) {
    this.currentArmor = 0;
  }
  if (this.currentArmor === 0) {
    io.to(currentGame).emit("msg", this.name + " destroyed! Players win.");
    game.win = true;
  }
  this.updateSummary();
}


/************************
ENEMY BASE CARD FUNCTIONS
*************************/

EnemyBase.prototype.reinforce = function() {
  io.to(currentGame).emit("msg", this.name + " will launch one extra enemy card into play each round.");
  this.enemiesPerTurn += 1;
}

EnemyBase.prototype.repair = function() {
  this.currentArmor += 5;
  if (this.currentArmor > this.maxArmor) {
    this.currentArmor = this.maxArmor;
  }
  io.to(currentGame).emit("msg", this.name + " Repairs 5 damage. Current armor: "
              + this.currentArmor + "/" + this.maxArmor);
}

EnemyBase.prototype.fireHeavy = function() {
  io.to(currentGame).emit("msg", this.name + " fires heavy weapons.");
  FriendlyBase.takeDamage(5);
}

EnemyBase.prototype.fireLight = function() {
  io.to(currentGame).emit("msg", this.name + " fires light weapons.");
  FriendlyBase.takeDamage(3);
}

EnemyBase.prototype.deploy = function() {
  io.to(currentGame).emit("msg", this.name + " launches an extra fighter.");
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
    dead: false,
    medalOfHonor: false,
    medic: false,
    daredevil: false,
    sharpShooter: false,
    emp: false,
    countermeasures: false,
    divertShields: 0,
    status: "Pursued"
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
    io.to(currentGame).emit("msg", this.name + "'s shields reduce damage to "
                + damage);
  }
  return damage;
}

Friendly.prototype.checkDamageNegation = function(damage) {
  if (this.effects.emp) {
    io.to(currentGame).emit("msg", this.name + " is protected by EMP.");
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
      io.to(currentGame).emit("msg", this.name + " has been destroyed. Players lose.");
      this.effects.dead = true;
      game.lose = true;
    } else {
      io.to(currentGame).emit("msg", this.name + " takes " + damage + " damage. Current armor: "
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
    dead: false,
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
  this.summary = "<h3>" + this.name + "</h3>";
  if (!this.effects.dead) {
    this.effects.status = "Free";
    this.summary += "<p>Armor: " + this.currentArmor
                  + "/" + this.maxArmor + "</p>"
                  + "<p>Merit: " + this.merit + "</p>";
    for (let i=0; i<this.pursuers.length; i++) {
      let enemy = this.pursuers[i];
      if (enemy.merit > 0) {
        this.effects.status = "Pursued";
      }
    }
  }
  if (this.effects.status === "Pursued" || this.effects.status === "KIA") {
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
  io.to(currentGame).emit("msg", this.name + " receives " + merit + " merit.");
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

Player.prototype.checkDamageNegation = function(damage) {
  if (damage > 0) {
    if (this.effects.emp) {
      io.to(currentGame).emit("msg", this.name + " is protected by EMP.");
      this.effects.emp = false;
      return 0;
    } else {
      damage = this.checkShields(damage);
      if (this.effects.countermeasures) {
        let counterDamage = this.calcDamage(4);
        io.to(currentGame).emit("msg", this.name + " deploys countermeasures to avoid "
                    + counterDamage + " damage.");
        damage -= counterDamage;
        this.effects.countermeasures = false;
      }
      if (damage < 0) {
        damage = 0;
        io.to(currentGame).emit("msg", "All damage to " + this.name + " negated.");
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
    if (this.currentArmor <= 0) {
      this.currentArmor = 0;
      this.effects.dead = true;
      this.effects.status = "KIA";
      io.to(currentGame).emit("msg", this.name + " takes " + damage + " damage. " + this.name + " has been destroyed.");
      while (this.hand.length > 0) {
        game.moveCard(0, this.hand, game.tacticalDeck.discard);
      }
      let pursuers = this.pursuers;
      game.distributeEnemies(pursuers);
      this.pursuers = [];
      let alldead = true;
      for (let i = 0; i < game.friendlies.length; i++) {
        let friendly = game.friendlies[i];
        if (friendly.id === "FriendlyBase") {
          continue;
        } else {
          if (!friendly.effects.dead) {
            alldead = false;
          }
        }
      }
      if (alldead) {
        io.to(currentGame).emit("msg", "All pilots destroyed. Players lose.");
        game.lose = true;
      }
    } else {
      io.to(currentGame).emit("msg", this.name + " takes " + damage + " damage. Current armor: "
                  + this.currentArmor + "/" + this.maxArmor);
    }
  }
}

Player.prototype.checkKill = function(friendly, index) {
  // if kill: award merit, insert placeholder
  if (friendly.pursuerDamage[index] >= friendly.pursuers[index].armor) {
    io.to(currentGame).emit("msg", friendly.pursuers[index].name + " pursuing " + friendly.name
                + " destroyed.")
    this.increaseMerit(friendly.pursuers[index].merit);
    game.moveCard(index, friendly.pursuers, game.enemyDeck.discard);
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
    if (damage > 0) {
      enemyBase.takeDamage(damage);
      io.to(currentGame).emit("msg", this.name + " deals " + damage + " damage to enemy base.");
      this.increaseMerit(1);
    } else {
      io.to(currentGame).emit("msg", "No damage to enemy base");
    }
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
        io.to(currentGame).emit("msg", this.name + " deals " + damage + " damage to "
                    + friendly.pursuers[index].name + " pursuing "
                    + friendly.name + ". Current armor: "
                    + enemyArmor
                    + "/" + friendly.pursuers[index].armor);
        this.checkKill(friendly, index);
      } else {
        io.to(currentGame).emit("msg", "No damage to target.");
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
    io.to(currentGame).emit("msg", this.name + " shakes " + pursuer.name + " to friendly base.");
    game.moveCard(pursuerIndex, this.pursuers, FriendlyBase.pursuers);
    game.moveCard(pursuerIndex, this.pursuerDamage, FriendlyBase.pursuerDamage);
    this.insertPlaceholder(pursuerIndex);
    this.adjustPursuerDamage();
    FriendlyBase.adjustPursuerDamage();
  } else {
    io.to(currentGame).emit("msg", this.name + " can't shake 'em!")
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
    if (friendly.id === enemyBase.id) {
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
    io.to(currentGame).emit("msg", this.name + " repairs " + repairPoints + " damage on "
                + friendly.name + ". Current armor: "
                + friendly.currentArmor + "/" + friendly.maxArmor)
  } else {
    console.error(friendly.name + " is already at maximum armor.");
  }
}

Player.prototype.drawFire = function(friendly, index) {
  // choose an ally's pursuer and bring it to you
  io.to(currentGame).emit("msg", friendly.pursuers[index].name + " moves from " + friendly.name
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
    io.to(currentGame).emit("msg", this.name + " uses feint to play " + card.name)
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
  io.to(currentGame).emit("msg", this.name + " does a barrel roll! " + this.pursuers[pursuerIndex].name + " now pursues "
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
  io.to(currentGame).emit("msg", this.name + " will now receive +1 merit any time they are awarded merit.");
}

Player.prototype.daredevil = function() {
  // allow player to attack enemy base if they have one or no pursuers
  this.effects.daredevil = true;
  io.to(currentGame).emit("msg", this.name + " can now attack the enemy base with one pursuer.");
}

Player.prototype.medic = function() {
  this.effects.medic = true;
  io.to(currentGame).emit("msg", this.name + " can now repair 1 damage on a chosen ally each round.");
}

Player.prototype.sharpShooter = function() {
  this.effects.sharpShooter = true;
  io.to(currentGame).emit("msg", this.name + " is now better at hurting things.");
}

Player.prototype.healthPack = function(friendly, index) {
  if (index === undefined) {
    index = 0;
  }
  this.repairDrone(friendly, index, 5, 0);
}

Player.prototype.intercept = function() {
  enemyBase.effects.intercepted = true;
  io.to(currentGame).emit("msg", intercept.description);
}

Player.prototype.jammer = function() {
  enemyBase.effects.jammed = true;
  io.to(currentGame).emit("msg", jammer.description);
}

Player.prototype.emp = function(friendly) {
  friendly.effects.emp = true;
  io.to(currentGame).emit("msg", this.name + " blasts " + friendly.name + "'s pursuers with an EMP. "
              + friendly.name + " will not be damaged this round.");
}

Player.prototype.countermeasures = function() {
  this.effects.countermeasures = true;
  io.to(currentGame).emit("msg", this.name + " prepares countermeasures...")
}

Player.prototype.divertShields = function() {
  this.effects.divertShields = 5;
  io.to(currentGame).emit("msg", this.name + " powers up shields. Next 5 damage will be negated.")
}

Player.prototype.jump = function() {
  // shake all pursuers
  io.to(currentGame).emit("msg", this.name + " shakes " + this.pursuers.length
              + " pursuers to the friendly base.");
  for (let i = 0; i = this.pursuers.length; i++) {
    game.enemyDeck.discard.push(this.pursuers.pop());
  }
}

Player.prototype.hardSix = function() {
  io.to(currentGame).emit("msg", "Sometimes you gotta roll the hard six.");
  this.missile(enemyBase, undefined);
  this.takeDamage(this.calcDamage(4));
}

Player.prototype.snapshot = function(friendly, pursuerIndex) {
  io.to(currentGame).emit("msg", this.name + " destroys " + friendly.pursuers[pursuerIndex].name
              + " pursuing " + friendly.name);
  game.moveCard(pursuerIndex, friendly.pursuers, game.enemyDeck.discard);
  this.insertPlaceholder(pursuerIndex);
}

Player.prototype.guidedMissile = function() {
  io.to(currentGame).emit("msg", this.name + " fires a guided missile at " + enemyBase.name);
  enemyBase.takeDamage(6);
}

Player.prototype.incinerate = function() {
  io.to(currentGame).emit("msg", this.name + " prepares afterburner...");
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
  let choice = game.market[advTactic];
  this.lastCardUsed = choice;
  let action = choice.cssClass;
  if (this.merit >= choice.cost) {
    this.merit -= choice.cost;
    this[action](friendly, pursuerIndex);
    game.removeAdvTactic(advTactic);
  } else {
    io.to(currentGame).emit("msg", this.name + " does not have enough merit.");
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
  io.to(currentGame).emit("msg", this.name + " uses " + card.name)
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
  game.update();
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
  game.update();
}

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
  if (enemyBase.effects.jammed === true) { // throwing error: can't read property 'jammed' of undefined
    this.enemyBaseDeck.discard.push(this.currentEnemyBaseCard.pop());
    enemyBase.effects.jammed = false;
  } else {
    this.replaceCards(this.enemyBaseCardsPerTurn, this.enemyBaseDeck,
                      this.currentEnemyBaseCard);
    let ebCard = this.currentEnemyBaseCard[0];
    enemyBase[ebCard.cssClass]();
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
    let newEnemies = this.enemiesPerTurn;
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

// Tactical cards
let repairDrone = new Tactical("Repair drone", "repairDrone", "Remove 3 damage from a friendly (any)");
let missile = new Tactical("Missile", "missile", "Choose a target and roll 5 combat dice");
let drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly (other) and bring it to you");
let feint = new Tactical("Feint", "feint", "Reuse the last tactical card you used this round");
let barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself. It now pursues the friendly base");
let scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 2 damage to a single target, and 1 damage to the target on either side of it");
let immelman = new Tactical("Immelman", "immelman", "Missile an enemy pursuing you");

// Advanced tactics
// let medalOfHonor = new AdvTactical("Medal of Honor", "medalOfHonor", "Every enemy destroyed is worth 1 extra merit", 10);
// let daredevil = new AdvTactical("Daredevil", "daredevel", "Allows you to attack the EB with 1 pursuer", 10);
// let medic = new AdvTactical("Medic", "medic", "Restore 1 armor to a friendly of your choice each round", 10);
// let sharpShooter = new AdvTactical("Sharp Shooter", "sharpshooter", "Improve player accuracy rolls/add an extra die", 10);
let bomb = new AdvTactical("Bomb", "bomb", "Deal 6 damage to a single target, and 2 damage to the target on either side of it", 8);
let heatSeeker = new AdvTactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy", 5);
let healthPack = new AdvTactical("Health Pack", "healthPack", "Remove 5 damage from a friendly (any)", 4);
let jammer = new AdvTactical("Jammer", "jammer", "Do not draw an enemy base card next round", 6);
let intercept = new AdvTactical("Intercept", "intercept", "Draw one less enemy into play next round", 6);
let emp = new AdvTactical("EMP", "emp", "Choose a friendly (other). Their pursuers cannot damage them this round", 5);
let countermeasures = new AdvTactical("CNTRmeasures", "countermeasures", "Ignore x damage where x is the result of a standard combat roll", 2);
let divertShields = new AdvTactical("Divert Shields", "divertShields", "Keep this card. It absorbs the next 5 damage you take", 3);
let jump = new AdvTactical("Jump", "jump", "Shake all your pursuers this round to discard", 15);
let hardSix = new AdvTactical("Roll the hard six", "hardSix", "If pursued, missile the enemy base and take damage of a standard combat roll", 6);
let snapshot = new AdvTactical("Snapshot", "snapshot", "Remove an enemy from play (no merit awarded)", 7);
let guidedMissile = new AdvTactical("Guided Missile", "guidedMissile", "Deal 6 damage to the enemy base regardless of pursuers", 10);
let incinerate = new AdvTactical("Incinerate", "incinerate", "Destroy the first enemy drawn to you next round", 7);


// define enemy types
let ace = new Enemy("Ace","ace",6,4,5,4);
let heavy = new Enemy("Heavy","heavy",5,3,3,3);
let medium = new Enemy("Medium","medium",4,2,4,2);
let light = new Enemy("Light","light",3,2,4,1);
let empty = new Enemy("Empty space","emptySpace",0,0,0,0);
let placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);

// define enemy base cards
let fireLight = new EnemyBaseCard("Fire light weapons", "fireLight", "Friendly base takes 3 damage");
let fireHeavy = new EnemyBaseCard("Fire heavy weapons", "fireHeavy", "Friendly base takes 5 damage");
let deploy = new EnemyBaseCard("Deploy", "deploy", "Draw an extra enemy card into play in the next round");
let repair = new EnemyBaseCard("Repairs", "repair", "Enemy base repairs 5 armor.");
let reinforce = new EnemyBaseCard("Reinforcements", "reinforce", "Increase the amount enemies that enter the fray each turn by 1");

let enemyBase = new EnemyBase();

// define friendlies
let FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
let Player1;
let Player2;
let Player3;
let Player4;

let game = new Game();

let reset = function() {
  FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
  Player1 = null;
  Player2 = null;
  Player3 = null;
  Player4 = null;

  game = new Game();
}

let launchGame = function() {
  game.round();
}

let root = __dirname;
let port = process.env.PORT || 8080;
let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let app = express();
let server = http.createServer(app);
let socketio = require('socket.io');
let io = socketio(server);
let User = require('./js/models/user');
let GameSession = require('./js/models/game');
let MongoStore = require('connect-mongo')(session);
let gameTitle = "Contact!";
let currentUser;
let currentGame;

// mongodb connection
mongoose.connect('mongodb://localhost:27017/starfire');
let db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
  secret: 'Do a barrel roll!',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID available in app and templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  res.locals.currentGame = req.session.gameId;
  currentUser = req.session.userId;
  currentGame = req.session.gameId;
  next();
})

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from root
app.use(express.static(root));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
let routes = require('./js/routes/index');
app.use('/', routes);

// 404 handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (currentUser) {
    let backUrl = req.header('Referer') || '/login';
    res.status(err.status || 500);
    res.render('error', {
      gameTitle: gameTitle,
      statusMessage: err.message || 'There was en error processing your request',
      error: {},
      backPrompt: 'Go back',
      backUrl: backUrl
    });
  } else {
    res.status(err.status || 500);
    res.render('error', {
      statusMessage: err.message || 'There was en error processing your request',
      error: {},
      backPrompt: 'Go to login',
      backUrl: '/login'
    });
  }

});

server.listen(port, () => console.log('Ready. Listening at http://localhost:' + port));

// let nsps = [];
// getGameSessions(function(err, gameSessions) {
//   if (err) {
//     console.error(err);
//   }
//   gameSessions.forEach(function(gameSession) {
//     if (!gameSessions.includes(gameSession) && gameSession._id != gameSession.gameName) {
//       nsps.push(gameSession._id);
//     }
//   })
//   console.log(nsps);
//   nsps.forEach(function(nsp) {
//     io.of('/' + nsp).on('connection', onConnection);
//   });
// });

// game logic
io.on('connect', onConnection);

function getUser(userId, callback) {
  User.findById(userId, function(error, user) {
    if (error) {
      callback(err, null);
    } else {
      callback(null, user);
    }
  });
}

function getGameSession(gameId, callback) {
  GameSession.findById(gameId, function(error, game) {
    if (error) {
      callback(err, null);
    } else {
      callback(null, game);
    }
  });
}

function getGameSessions(callback) {
  GameSession.find({}, function(error, gameSessions) {
    if (error) {
      callback(err, null);
    } else {
      callback(null, gameSessions);
    }
  });
}

function loadGameState(gameId, callback) {
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    let game = new Game();
    let FriendlyBase = new Friendly();
    let Player1 = new Player();
    let Player2 = new Player();
    let Player3 = new Player();
    let Player4 = new Player();
    let enemyBase = new EnemyBase();
    let gameState = gameSession.state.game[0];
    let updatePlayer = function(player, friendly) {
      player.name = friendly.name;
      player.currentArmor = friendly.currentArmor;
      player.lastCardUsed = friendly.lastCardUsed;
      player.hand = friendly.hand;
      player.pursuers = friendly.pursuers;
      player.pursuerDamage = friendly.pursuerDamage;
      player.merit = friendly.merit;
      player.effects = friendly.effects;
    }
    for (let i = 0; i < gameState.friendlies.length; i++) {
      let friendly = gameState.friendlies[i];
      if (friendly.id === FriendlyBase.id) {
        FriendlyBase.pursuers = friendly.pursuers;
        FriendlyBase.pursuerDamage = friendly.pursuerDamage;
        FriendlyBase.effects = friendly.effects.
        FriendlyBase.currentArmor = friendly.currentArmor;
        gameSession.friendlies.push(friendly);
      } else if (friendly.id === Player1.id) {
        updatePlayer(Player1, friendly);
      } else if (friendly.id === Player2.id) {
        updatePlayer(Player2, friendly);
      } else if (friendly.id === Player3.id) {
        updatePlayer(Player3, friendly);
      } else if (friendly.id === Player4.id) {
        updatePlayer(Player4, friendly);
      }
    }
    game.roundNumber = gameState.roundNumber;
    game.tacticalDeck = gameState.tacticalDeck;
    game.advTactics = gameState.advTactics;
    game.enemyBaseDeck = gameState.enemyBaseDeck;
    game.enemyDeck = gameState.enemyDeck;
    game.market = gameState.market;
    game.enemiesActive = gameState.enemiesActive;
    game.enemiesPerTurn = gameState.enemiesPerTurn;
    game.currentEnemyBaseCard = gameState.currentEnemyBaseCard;
    game.gameID = gameState.gameID;
    game.win = gameState.win;
    game.lose = gameState.lose;
    game.enemiesPerTurn = gameState.enemiesPerTurn;

    let ebState = gameSession.state.enemyBase[0];
    enemyBase.currentArmor = ebState.currentArmor;
    enemyBase.effects = ebState.effects;

    game.update();

    if(callback) {
      callback(gameSession);
    }
  });
}

function saveGameState(gameId, game, enemyBase, currentTurn) {
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    if (currentTurn === undefined) {
      currentTurn = 1;
    }
    game.update();
    gameSession.state.currentTurn = currentTurn;

    gameSession.state.game[0].roundNumber = game.roundNumber;
    gameSession.state.game[0].friendlies = game.friendlies;
    gameSession.state.game[0].tacticalDeck = game.tacticalDeck;
    gameSession.state.game[0].advTactics = game.advTactics;
    gameSession.state.game[0].enemyBaseDeck = game.enemyBaseDeck;
    gameSession.state.game[0].enemyDeck = game.enemyDeck;
    gameSession.state.game[0].market = game.market;
    gameSession.state.game[0].enemiesActive = game.enemiesActive;
    gameSession.state.game[0].enemiesPerTurn = game.enemiesPerTurn;
    gameSession.state.game[0].currentEnemyBaseCard = game.currentEnemyBaseCard;
    gameSession.state.game[0].gameID = game.gameID;
    gameSession.state.game[0].win = game.win;
    gameSession.state.game[0].lose = game.lose;
    gameSession.state.game[0].enemiesPerTurn = game.enemiesPerTurn;

    gameSession.state.enemyBase[0].currentArmor = enemyBase.currentArmor;
    gameSession.state.enemyBase[0].effects = enemyBase.effects;
    gameSession.state.enemyBase[0].summary = enemyBase.summary;

    gameSession.save(function(err) {
      if (err) {
        console.error(err);
      } else {
        updateObjects(gameId, gameSession);
      }
    });
  });
}

function onConnection(socket) {
  console.log(socket.nsp.name);
  // let nsp = io.of('/' + socket.nsp.name);
  let gameId = currentGame;
  let userId = currentUser;
  let join = function(player) {
    if(gameId) {
      gameId
      socket.join(gameId);
      console.log('A user joined room ' + gameId);
    }
    if (userId) {
      userId = currentUser;
      getUser(userId, function(err, user) {
        if (err) {
          console.error(err);
        }
        player.name = user.callsign;
        console.log('Game: ' + gameId + ' Assigning ' + user.callsign + ' to ' + player.id);
        socket.emit('assign', { player: player, room: gameId } );
        socket.on('turn', turn);
        socket.on('chat', function(data) {
          io.to(data.room).emit('chatMessage', data.message);
        });
        io.to(gameId).emit('msg', player.name + ' joined the game.');
        socket.on('disconnect', function() {
          GameSession.findById(gameId, function(err, gameSession) {
            if (err) {
              console.error(err);
            }
            if (gameSession.locked) {
              player.effects.dead = true;
              saveGameState(gameId, game, enemyBase);
            } else {
              io.to(gameId).emit('msg', player.name + ' left.');
            }
            for (person in gameSession.users) {
              if (gameSession.users[person] === user.callsign) {
                gameSession.users[person] = undefined;
                gameSession.players -= 1;
              }
            }
            if (gameSession.players === 1) {
              io.to(gameId).emit('closeGame');
              io.to(gameId).emit('msg', 'Waiting for second player...')
            } else if (gameSession.players === 0) {
              gameSession.gameName = gameSession._id;
              gameSession.state.game = [];
              gameSession.meta.aborted = true;
              console.log('Game id:' + gameSession._id + ' aborted');
            }
            gameSession.save(function(err) {
              if (err) {
                console.error(err);
              } else {
                console.log('user removed');
              }
            });
          });
          socket.leave(userId)
          console.log('user disconnected');
        });
      });
    }
  }
  let addPlayer = function(gameId, userId) {
    getGameSession(gameId, function(err, gameSession) {
      if (err) {
        console.error(err);
      }
      getUser(userId, function(err, user) {
        if (err) {
          console.error(err);
        }
        if (gameSession.users.user1 === user.callsign) {
          Player1 = new Player('Player1');
          join(Player1);
        } else if (gameSession.users.user2 === user.callsign) {
          Player2 = new Player('Player2');
          join(Player2);
        } else if (gameSession.users.user3 === user.callsign) {
          Player3 = new Player('Player3');
          join(Player3);
        } else if (gameSession.users.user4 === user.callsign) {
          Player4 = new Player('Player4');
          join(Player4);
        }
      });
    });
  }
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    }
    if (gameSession.players === 4) {
      addPlayer(gameId, userId);
      io.to(gameId).emit('msg', 'Game full');
    } else if (gameSession.players === 3) {
      addPlayer(gameId, userId);
    } else if (gameSession.players === 2) {
      addPlayer(gameId, userId);
      io.to(gameId).emit('msg', 'Game ready');
      io.to(gameId).emit('openGame');
    } else {
      Player1 = new Player('Player1');
      join(Player1);
      socket.emit('msg', 'Waiting for second player...');
      socket.emit('firstPlayer');
      socket.on('startGame', function(data) {
        let gameId = data.room;
        getGameSession(gameId, function(err, gameSession) {
          if (err) {
            console.error(err);
          }
          if (gameSession.players >= 2) {
            let update = { 'meta.locked': true, 'meta.startTime': new Date(), 'meta.endTime': new Date() };
            GameSession.update(gameSession, update, function() {
              io.to(gameId).emit('start');
              game = new Game(gameSession._id, gameSession.difficulty);
              enemyBase = new EnemyBase();
              game.friendlies = [FriendlyBase]
              if (gameSession.users.user1) {
                Player2 = new Player('Player2', gameSession.users.user2);
                game.friendlies.push(Player1);
              }
              if (gameSession.users.user2) {
                Player2 = new Player('Player2', gameSession.users.user2);
                game.friendlies.push(Player2);
              }
              if (gameSession.users.user3) {
                Player3 = new Player('Player3', gameSession.users.user3);
                game.friendlies.push(Player3);
              }
              if (gameSession.users.user4) {
                Player4 = new Player('Player4', gameSession.users.user4);
                game.friendlies.push(Player4);
              }
              game.buildDecks();
              game.round();
              gameSession.state.game.push(game);
              gameSession.state.enemyBase.push(enemyBase);
              gameSession.save(function(err) {
                if (err) {
                  console.error(err)
                }
                saveGameState(gameId, game, enemyBase);
              });
            });
          } else {
            console.log('Error launching game.');
          }
        });
      });
    }
  });
}

function updateObjects(gameId, gameSession) {
  let gameData = {
    turn: gameSession.state.currentTurn,
    game: gameSession.state.game[0],
    enemyBase: gameSession.state.enemyBase[0]
  }
  for (let i = 0; i < gameSession.state.game[0].friendlies.length; i++) {
    let friendly = gameSession.state.game[0].friendlies[i];
    if (friendly.id === "FriendlyBase") {
      gameData.FriendlyBase = friendly;
    } else if (friendly.id === "Player1") {
      gameData.Player1 = friendly;
    } else if (friendly.id === "Player2") {
      gameData.Player2 = friendly;
    } else if (friendly.id === "Player3") {
      gameData.Player3 = friendly;
    } else if (friendly.id === "Player4") {
      gameData.Player4 = friendly;
    }
  }
  io.to(gameId).emit('update', gameData);
}

function turn(data) {
  let gameId = data.room;
  let specs = data.turnInfo;
  loadGameState(gameId, function(gameSession) {
    let getPlayer = function(id) {
      if (id === 'Player1') {
        return Player1;
      } else if (id === 'Player2') {
        return Player2;
      } else if (id === 'Player3') {
        return Player3;
      } else if (id === 'Player4') {
        return Player4;
      } else if (id === 'FriendlyBase') {
        return FriendlyBase;
      } else if (id === 'enemyBase') {
        return enemyBase;
      }
    }
    let friendly = undefined;
    let player = getPlayer(specs.player.id);
    if (specs.friendly !== undefined) {
      friendly = getPlayer(specs.friendly.id);
    }
    if (specs.button === 'use') {
      player.useTactic(specs.cardIndex, friendly, specs.pursuerIndex);
    } else {
      player.discard(specs.cardIndex, specs.button, friendly,
                                            specs.pursuerIndex,
                                            specs.purchaseIndex);
    }
    let cardsLeft = 0;
    game.friendlies.forEach((friendly) => {
      if (friendly === FriendlyBase) {
        cardsLeft += 0;
      } else {
        cardsLeft += friendly.hand.length;
      }
    });
    let currentTurn = gameSession.state.currentTurn;
    if (cardsLeft === 0) {
      game.postRound();
      game.round();
      currentTurn = 0;
    } else {
      currentTurn += 1;
    }
    let resetTurns = function() {
      if (currentTurn >= game.friendlies.length
          || (currentTurn === game.friendlies.length-1
          && game.friendlies[currentTurn].id === 'FriendlyBase')
          || (currentTurn === game.friendlies.length-1
          && game.friendlies[currentTurn].effects.dead)) {
        currentTurn = 0;
      }
    }
    resetTurns();
    while (game.friendlies[currentTurn].id === 'FriendlyBase'
        || game.friendlies[currentTurn].effects.dead) {
      currentTurn += 1;
      resetTurns();
    }
    if (game.win) {
      saveGameState(gameId, game, enemyBase, currentTurn);
      io.to(gameId).emit('end', 'Victory!');
      getGameSession(gameId, function(err, gameSession) {
        if (err) {
          console.error(err);
        }
        let endTime = new Date();
        let ms = endTime - gameSession.meta.startTime;
        let min = Math.round(ms/1000/60);
        gameSession.state.currentTurn = currentTurn;
        gameSession.gameName = gameSession._id;
        gameSession.meta.rounds = gameSession.state.game.roundNumber;
        gameSession.meta.won = true;
        gameSession.meta.endTime = endTime;
        gameSession.meta.elapsedTime = min;
        gameSession.save(function(err, updated) {
          if (err) {
            console.error(err);
          }
          for (let i = 1; i < 5; i++) {
            let user = 'user' + i;
            if (gameSession.users[user]) {
              let query = { callsign: gameSession.users[user] };
              User.find(query, function(err, player) {
                if (err) {
                  console.error(err);
                }
                let wins = player.meta.wins + 1;
                player.meta.wins = wins;
                if (wins = 21) {
                  player.meta.rank = 'Admiral';
                } else if (wins = 18) {
                  player.meta.rank = 'Commander';
                } else if (wins = 15) {
                  player.meta.rank = 'Colonel';
                } else if (wins = 12) {
                  player.meta.rank = 'Lt. Colonel';
                } else if (wins = 9) {
                  player.meta.rank = 'Major';
                } else if (wins = 6) {
                  player.meta.rank = 'Captain';
                } else if (wins = 3) {
                  player.meta.rank = 'Lieutenant';
                }
                player.save(function(err, updated) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(gameSession.users[user] + " updated");
                    if (updated.meta.wins < 22 && updated.meta.wins%3 === 0) {
                      console.log(updated.callsign + " promoted to " + updated.meta.rank);
                    }
                  }
                });
              });
            } else {
              continue;
            }
          }
        });
      });
    } else if (game.lose) {
      saveGameState(gameId, game, enemyBase, currentTurn);
      io.to(gameId).emit('end', 'Defeat!');
      reset();
      getGameSession(gameId, function(err, gameSession) {
        if (err) {
          console.error(err);
        }
        let endTime = new Date();
        let ms = endTime - gameSession.meta.startTime;
        let min = Math.round(ms/1000/60);
        gameSession.gameName = gameSession._id;
        gameSession.meta.rounds = game.roundNumber;
        gameSession.meta.lost = true;
        gameSession.meta.endTime = endTime;
        gameSession.meta.elapsedTime = min;
        gameSession.save(function(err, updated) {
          if (err) {
            console.error(err);
          }
          for (let i = 1; i < 5; i++) {
            let user = 'user' + i;
            if (gameSession.users[user]) {
              let query = { callsign: gameSession.users[user] };
              let update = { $inc: { 'meta.losses': 1 }};
              User.update(query, update, function() {
                console.log(gameSession.users[user] + " updated");
              });
            } else {
              continue;
            }
          }
        });
      });
    } else {
      saveGameState(gameId, game, enemyBase, currentTurn);
    }
  });
}

//# sourceMappingURL=app.js.map
