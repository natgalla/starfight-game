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

EnemyBase.prototype.updateSummary = function(game) {
  this.summary = "<h3>" + this.name + "</h3>"
               + "<p>Armor: " + this.currentArmor + "/"
                               + this.maxArmor + "</p>"
               + "<p>Launch rate: " + game.enemiesPerTurn + "</p>";
  if (game.currentEnemyBaseCard.length === 0 && game.roundNumber > 1) {
    this.summary += "<div class='enemyBaseCard'><h3>Jammed</h3></div>";
  } else if (game.roundNumber > 1) {
    this.summary += game.currentEnemyBaseCard[0].card;
  }
}

EnemyBase.prototype.takeDamage = function(game, damage) {
  this.currentArmor -= damage;
  if (this.currentArmor < 0) {
    this.currentArmor = 0;
  }
  if (this.currentArmor === 0) {
    io.to(game.gameID).emit("msg", this.name + " destroyed! Players win.");
    game.win = true;
  }
  this.updateSummary(game);
}


/************************
ENEMY BASE CARD FUNCTIONS
*************************/

EnemyBase.prototype.reinforce = function(game) {
  io.to(game.gameID).emit("msg", this.name + " will launch one extra enemy card into play each round.");
  this.enemiesPerTurn += 1;
}

EnemyBase.prototype.repair = function(game) {
  this.currentArmor += 5;
  if (this.currentArmor > this.maxArmor) {
    this.currentArmor = this.maxArmor;
  }
  io.to(game.gameID).emit("msg", this.name + " Repairs 5 damage. Current armor: "
              + this.currentArmor + "/" + this.maxArmor);
}

EnemyBase.prototype.fireHeavy = function(game) {
  io.to(game.gameID).emit("msg", this.name + " fires heavy weapons.");
  FriendlyBase.takeDamage(5);
}

EnemyBase.prototype.fireLight = function(game) {
  io.to(game.gameID).emit("msg", this.name + " fires light weapons.");
  FriendlyBase.takeDamage(3);
}

EnemyBase.prototype.deploy = function(game) {
  io.to(game.gameID).emit("msg", this.name + " launches an extra fighter.");
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
  this.card = "<p id='enemyBaseCard'>Last action: " + this.description + "</p>";
}

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

Friendly.prototype.adjustPursuerDamage = function() {
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

Friendly.prototype.checkShields = function(game, damage) {
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
    io.to(game.gameID).emit("msg", this.name + "'s shields reduce damage to "
                + damage);
  }
  return damage;
}

Friendly.prototype.checkDamageNegation = function(game, damage) {
  if (this.effects.emp) {
    io.to(game.gameID).emit("msg", this.name + " is protected by EMP.");
    this.effects.emp = false;
    return 0;
  } else {
    return damage;
  }
}

Friendly.prototype.takeDamage = function(game, damage) {
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor <= 0) {
      this.currentArmor = 0;
      io.to(game.gameID).emit("msg", this.name + " has been destroyed. Players lose.");
      this.effects.dead = true;
      game.lose = true;
      console.log('Loss condition met: Friendly Base destroyed');
    } else {
      io.to(game.gameID).emit("msg", this.name + " takes " + damage + " damage. Current armor: "
                  + this.currentArmor + "/" + this.maxArmor);
    }
  }
}

Friendly.prototype.insertPlaceholder = function(index) {
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
  if (this.effects.status === "Pursued" || this.effects.status === "KIA" || this.effects.status === "MIA") {
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

Player.prototype.increaseMerit = function(game, amount) {
  let merit = amount;
  if (this.effects.medalOfHonor === true) {
    merit += 1;
  }
  this.merit += merit;
  io.to(game.gameID).emit("msg", this.name + " receives " + merit + " merit.");
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

Player.prototype.checkDamageNegation = function(game, damage) {
  if (damage > 0) {
    if (this.effects.emp) {
      io.to(game.gameID).emit("msg", this.name + " is protected by EMP.");
      this.effects.emp = false;
      return 0;
    } else {
      damage = this.checkShields(game, damage);
      if (this.effects.countermeasures) {
        let counterDamage = this.calcDamage(4);
        io.to(game.gameID).emit("msg", this.name + " deploys countermeasures to avoid "
                    + counterDamage + " damage.");
        damage -= counterDamage;
        this.effects.countermeasures = false;
      }
      if (damage < 0) {
        damage = 0;
        io.to(game.gameID).emit("msg", "All damage to " + this.name + " negated.");
      } else {
        return damage;
      }
    }
  } else {
    return damage;
  }
}

Player.prototype.destroyed = function(game, status) {
  this.effects.dead = true;
  this.effects.status = status;
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
    io.to(game.gameID).emit("msg", "All pilots destroyed. Players lose.");
    game.lose = true;
    console.log('Loss condition met: All pilots destroyed');
  }
}

Player.prototype.takeDamage = function(game, damage) {
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor <= 0) {
      this.currentArmor = 0;
      this.destroyed(game, 'KIA');
      io.to(game.gameID).emit("msg", this.name + " takes " + damage + " damage. " + this.name + " has been destroyed.");
    } else {
      io.to(game.gameID).emit("msg", this.name + " takes " + damage + " damage. Current armor: "
                  + this.currentArmor + "/" + this.maxArmor);
    }
  }
}

Player.prototype.checkKill = function(game, friendly, index) {
  // if kill: award merit, insert placeholder
  if (friendly.pursuerDamage[index] >= friendly.pursuers[index].armor) {
    io.to(game.gameID).emit("msg", friendly.pursuers[index].name + " pursuing " + friendly.name
                + " destroyed.")
    this.increaseMerit(game, friendly.pursuers[index].merit);
    game.moveCard(index, friendly.pursuers, game.enemyDeck.discard);
    friendly.insertPlaceholder(index);
  }
}

Player.prototype.doDamage = function(game, friendly, index, damage) {
  // if damage is more than 0, deal damage to a selected enemy, check for kill
  // does not allow damage to empty space or place holders
  if (friendly === undefined) {
    friendly = this;
  }
  if (index === undefined) {
    index = 0;
  }
  if (friendly.id === "enemyBase") {
    if (damage > 0) {
      game.enemyBase.takeDamage(game, damage);
      io.to(game.gameID).emit("msg", this.name + " deals " + damage + " damage to enemy base.");
      this.increaseMerit(game, 1);
    } else {
      io.to(game.gameID).emit("msg", "No damage to enemy base");
    }
  } else {
    if (friendly.pursuers[index].cssClass === "emptySpace" // throwing error when attacking fb pursuers: Cannot read property '0' of undefined
      || friendly.pursuers[index].cssClass === "destroyed") {
      console.error("No enemy at index " + index);
    } else {
      if (damage > 0) {
        friendly.pursuerDamage[index] += damage;
        let enemyArmor = friendly.pursuers[index].armor - friendly.pursuerDamage[index];
        if (enemyArmor < 0) {
          enemyArmor = 0;
        }
        io.to(game.gameID).emit("msg", this.name + " deals " + damage + " damage to "
                    + friendly.pursuers[index].name + " pursuing "
                    + friendly.name + ". Current armor: "
                    + enemyArmor
                    + "/" + friendly.pursuers[index].armor);
        this.checkKill(game, friendly, index);
      } else {
        io.to(game.gameID).emit("msg", "No damage to target.");
      }
    }
  }
}



/**************************
PLAYER TACTICAL FUNCTIONS
**************************/

Player.prototype.fire = function(game, friendly, pursuerIndex) {
  // deal damage equal to 4 combat dice to target
  let damage = this.calcDamage(4);
  this.doDamage(game, friendly, pursuerIndex, damage);
}

Player.prototype.evade = function(game, friendly, pursuerIndex) {
  if (friendly === undefined) {
    friendly = this;
  }
  // choose a target and attempt evade (D6 vs. enemy targeting)
  let evadeRoll = Math.floor(Math.random() * 6) + 1;
  let pursuer = this.pursuers[pursuerIndex];
  if (evadeRoll >= pursuer.targeting) {
    io.to(game.gameID).emit("msg", this.name + " shakes " + pursuer.name + " to friendly base.");
    game.moveCard(pursuerIndex, this.pursuers, game.friendlies[game.findFriendlyBase()].pursuers);
    game.moveCard(pursuerIndex, this.pursuerDamage, game.friendlies[game.findFriendlyBase()].pursuerDamage);
    this.insertPlaceholder(pursuerIndex);
    this.adjustPursuerDamage();
    game.friendlies[game.findFriendlyBase()].adjustPursuerDamage();
  } else {
    io.to(game.gameID).emit("msg", this.name + " can't shake 'em!")
  }
}

Player.prototype.missile = function(game, friendly, pursuerIndex) {
  // deal damage equal to 5 combat dice to target
  let damage = this.calcDamage(4) + this.damageRoll(this.missileDie);
  this.doDamage(game, friendly, pursuerIndex, damage);
}

Player.prototype.heatSeeker = function(game, friendly, pursuerIndex) {
  // deal 5 damage to target
  this.doDamage(game, friendly, pursuerIndex, 5);
}

Player.prototype.bomb = function(game, friendly, pursuerIndex, damage, collateral) {
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
  if (friendly.id === "enemyBase") {
    baseDamage = damage+(collateral*2);
    this.doDamage(game, game.enemyBase, pursuerIndex, baseDamage);
  } else {
    let adjacentLeft = pursuerIndex - 1;
    let adjacentRight = pursuerIndex + 1;
    while (adjacentLeft >= 0 && friendly.pursuers[adjacentLeft].cssClass === 'destroyed') {
      adjacentLeft -= 1;
    }
    while (adjacentRight < friendly.pursuers.length
            && friendly.pursuers[adjacentRight].cssClass === 'destroyed') {
      adjacentRight += 1;
    }
    if (adjacentRight < friendly.pursuers.length
        && friendly.pursuers[adjacentRight].cssClass != 'emptySpace') {
      this.doDamage(game, friendly, adjacentRight, collateral);
    } else {
      friendlyFire += collateral;
    }
    this.doDamage(game, friendly, pursuerIndex, damage);
    if (adjacentLeft > -1 &&
      friendly.pursuers[adjacentLeft].cssClass != 'emptySpace') {
        this.doDamage(game, friendly, adjacentLeft, collateral);
    } else {
      friendlyFire += collateral;
    }
    friendly.takeDamage(game, friendly.checkShields(game, friendlyFire));
  }
}

Player.prototype.repairDrone = function(game, friendly, index, repairPoints, meritReward) {
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
      this.increaseMerit(game, meritReward);
    }
    io.to(game.gameID).emit("msg", this.name + " repairs " + repairPoints + " damage on "
                + friendly.name + ". Current armor: "
                + friendly.currentArmor + "/" + friendly.maxArmor)
  } else {
    io.to(game.gameID).emit("msg", friendly.name + " is already at maximum armor.");
  }
}

Player.prototype.drawFire = function(game, friendly, index) {
  // choose an ally's pursuer and bring it to you
  io.to(game.gameID).emit("msg", friendly.pursuers[index].name + " moves from " + friendly.name
              + " to " + this.name + ".");
  this.increaseMerit(game, friendly.pursuers[index].merit);
  game.moveCard(index, friendly.pursuers, this.pursuers);
  game.moveCard(index, friendly.pursuerDamage, this.pursuerDamage);
  friendly.insertPlaceholder(index);
  this.adjustPursuerDamage();
  friendly.adjustPursuerDamage();
}

Player.prototype.feint = function(game, friendly, pursuerIndex) {
  // choose a tCard previously used this round and play it again
  if (this.lastCardUsed) {
    let card = this.lastCardUsed;
    let action = this.lastCardUsed.cssClass;
    io.to(game.gameID).emit("msg", this.name + " uses feint to play " + card.name)
    this[action](game, friendly, pursuerIndex);
  } else {
    console.error("No action to feint");
  }
}

Player.prototype.barrelRoll = function(game, friendly, pursuerIndex) {
  if (friendly === undefined) {
    friendly = this;
  }
  // move pursuer at pursuerIndex to friendly base
  io.to(game.gameID).emit("msg", this.name + " does a barrel roll! " + this.pursuers[pursuerIndex].name + " now pursues "
              + game.friendlies[game.findFriendlyBase()].name + ".");
  game.moveCard(pursuerIndex, this.pursuers, game.friendlies[game.findFriendlyBase()].pursuers);
  game.moveCard(pursuerIndex, this.pursuerDamage, game.friendlies[game.findFriendlyBase()].pursuerDamage);
  this.insertPlaceholder(pursuerIndex);
  this.adjustPursuerDamage();
  game.friendlies[game.findFriendlyBase()].adjustPursuerDamage();
}

Player.prototype.scatterShot = function(game, friendly, pursuerIndex) {
  // deal a small amount of damage to 3 adjacent targets
  this.bomb(game, friendly, pursuerIndex, 2, 1)
}

Player.prototype.immelman = function(game, friendly, index) {
  // bind click events to the player's pursuers
  // have them choose a pursuer
  this.missile(game, this, index);
}



/**************************
PLAYER ADVANCED TACTICAL FUNCTIONS
**************************/

Player.prototype.medalOfHonor = function(game) {
  this.effects.medalOfHonor = true;
  io.to(game.gameID).emit("msg", this.name + " will now receive +1 merit any time they are awarded merit.");
}

Player.prototype.daredevil = function(game) {
  // allow player to attack enemy base if they have one or no pursuers
  this.effects.daredevil = true;
  io.to(game.gameID).emit("msg", this.name + " can now attack the enemy base with one pursuer.");
}

Player.prototype.medic = function(game) {
  this.effects.medic = true;
  io.to(game.gameID).emit("msg", this.name + " can now repair 1 damage on a chosen ally each round.");
}

Player.prototype.sharpShooter = function(game) {
  this.effects.sharpShooter = true;
  io.to(game.gameID).emit("msg", this.name + " is now better at hurting things.");
}

Player.prototype.healthPack = function(game, friendly, index) {
  if (index === undefined) {
    index = 0;
  }
  this.repairDrone(game, friendly, index, 5, 0);
}

Player.prototype.intercept = function(game) {
  game.enemyBase.effects.intercepted = true;
  io.to(game.gameID).emit("msg", intercept.description);
}

Player.prototype.jammer = function(game) {
  game.enemyBase.effects.jammed = true;
  io.to(game.gameID).emit("msg", jammer.description);
}

Player.prototype.emp = function(game, friendly) {
  friendly.effects.emp = true;
  io.to(game.gameID).emit("msg", this.name + " blasts " + friendly.name + "'s pursuers with an EMP. "
              + friendly.name + " will not be damaged this round.");
}

Player.prototype.countermeasures = function(game) {
  this.effects.countermeasures = true;
  io.to(game.gameID).emit("msg", this.name + " prepares countermeasures...")
}

Player.prototype.divertShields = function(game) {
  this.effects.divertShields = 5;
  io.to(game.gameID).emit("msg", this.name + " powers up shields. Next 5 damage will be negated.")
}

Player.prototype.jump = function(game) {
  // shake all pursuers
  io.to(game.gameID).emit("msg", this.name + " shakes " + this.pursuers.length
              + " pursuers to the friendly base.");
  for (let i = 0; i = this.pursuers.length; i++) {
    game.enemyDeck.discard.push(this.pursuers.pop());
  }
}

Player.prototype.hardSix = function(game) {
  io.to(game.gameID).emit("msg", "Sometimes you gotta roll the hard six.");
  this.missile(game.enemyBase, undefined);
  this.takeDamage(game, this.calcDamage(4));
}

Player.prototype.snapshot = function(game, friendly, pursuerIndex) {
  io.to(game.gameID).emit("msg", this.name + " destroys " + friendly.pursuers[pursuerIndex].name
              + " pursuing " + friendly.name);
  game.moveCard(pursuerIndex, friendly.pursuers, game.enemyDeck.discard);
  this.insertPlaceholder(pursuerIndex);
}

Player.prototype.guidedMissile = function(game) {
  io.to(game.gameID).emit("msg", this.name + " fires a guided missile at " + game.enemyBase.name);
  game.enemyBase.takeDamage(game, 6);
}

Player.prototype.incinerate = function(game) {
  io.to(game.gameID).emit("msg", this.name + " prepares afterburner...");
  this.effects.incinerator = true;
}


/**************************
GENERIC FUNCTIONS TO USE TACTICAL CARDS
**************************/

Player.prototype.useAdvTactic = function(game, advTactic, friendly, pursuerIndex) {
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
    this[action](game, friendly, pursuerIndex);
    game.removeAdvTactic(advTactic);
  } else {
    io.to(game.gameID).emit("msg", this.name + " does not have enough merit.");
  }
}

Player.prototype.useTactic = function(game, cardIndex, friendly, pursuerIndex) {
  // takes the index of a card in hand and uses that card
  // optional argument 'friendly' defines a player target for the card
  // optional argument 'pursuerIndex' defines an enemy target in friendly.hand
  if (friendly === undefined) {
    friendly = this;
  }
  if (friendly.id === "FriendlyBase") {
    friendly = game.friendlies[game.findFriendlyBase()];
  }
  if (pursuerIndex === undefined) {
    pursuerIndex = 0;
  }
  let card = this.hand[cardIndex];
  let action = card.cssClass;
  if (action != "feint") {
    this.lastCardUsed = card;
    io.to(game.gameID).emit("msg", this.name + " uses " + card.name)
  }
  this[action](game, friendly, pursuerIndex);
  game.moveCard(cardIndex, this.hand, game.tacticalDeck.discard)
  game.nextTurn();
  return game;
}

Player.prototype.discard = function(game, cardIndex, action, friendly, pursuerIndex, advIndex) {
  if (friendly === undefined) {
    friendly = this;
  }
  if (friendly.id === "FriendlyBase") {
    friendly = game.friendlies[game.findFriendlyBase()];
  }
  if (pursuerIndex === undefined) {
    pursuerIndex = 0;
  }
  if (action === "useAdvTactic") {
    this.useAdvTactic(game, advIndex, friendly, pursuerIndex);
  } else {
    this[action](game, friendly, pursuerIndex);
  }
  game.moveCard(cardIndex, this.hand, game.tacticalDeck.discard);
  game.nextTurn();
  return game;
}

const Game = function(id, name, difficulty) {
  this.name = name;
  this.difficulty = difficulty;
  this.roundNumber = 0;
  this.currentTurn = 1;
  this.friendlies = [];
  this.enemyBase = new EnemyBase();
  this.tacticalDeck = new Deck('Tactical Deck');
  this.advTactics = new Deck('Advanced tactics');
  this.enemyBaseDeck = new Deck('Enemy Base Deck');
  this.enemyDeck = new Deck('Enemy Deck');
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

Game.prototype.findFriendlyBase = function() {
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    if (friendly.id === 'FriendlyBase') {
      return i;
    }
  }
}

Game.prototype.findPlayer = function(id) {
  for (let i=0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    if (id === friendly.id) {
      return friendly;
    } else if (id === this.enemyBase.id) {
      return this.enemyBase;
    }
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
    console.log(deck.name + ' shuffled.');
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
    if (friendly.id === 'FriendlyBase') {
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
          io.to(this.id).emit('msg', friendly.name + ' incinerates ' + friendly.pursuers[friendly.pursuers.length-1].name);
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

//build enemy base deck
Game.prototype.buildEnemyBaseDeck = function() {
  this.enemyBaseDeck = new Deck('Enemy Base Deck');
  this.addToDeck(this.enemyBaseDeck, fireLight, 3);
  this.addToDeck(this.enemyBaseDeck, fireHeavy, 2);
  this.addToDeck(this.enemyBaseDeck, deploy, 2);
  this.addToDeck(this.enemyBaseDeck, repair, 3);
  let deckSize = this.enemyBaseDeck.cards.length;
  let subDeckSize = Math.floor(deckSize/this.difficulty);
  let splitDecks = {};
  for (let i = 0; i < this.difficulty; i++) {
    let key = 'd' + i;
    if (this.enemyBaseDeck.cards.length > subDeckSize + 1) {
      splitDecks[key] = this.enemyBaseDeck.cards.splice(0, subDeckSize);
    } else {
      splitDecks[key] = this.enemyBaseDeck.cards;
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
  this.enemyBaseDeck.cards = deckAssembled;
}

Game.prototype.replaceEnemyBaseCard = function() {
  if (this.enemyBase.effects.jammed === true) {
    this.enemyBaseDeck.discard.push(this.currentEnemyBaseCard.pop());
    this.enemyBase.effects.jammed = false;
  } else {
    this.replaceCards(this.enemyBaseCardsPerTurn, this.enemyBaseDeck,
                      this.currentEnemyBaseCard);
    let ebCard = this.currentEnemyBaseCard[0];
    this.enemyBase[ebCard.cssClass](this);
  }
}

Game.prototype.update = function() {
  for (let i = 0; i < this.friendlies.length; i++) {
    let friendly = this.friendlies[i];
    friendly.updateSummary();
  }
  this.enemyBase.updateSummary(this);
}

Game.prototype.round = function() {
  this.roundNumber++;
  console.log('Round: ' + this.gameID + '.' + this.roundNumber);
  // add enemies and game.advTactics tactics into play
  if (this.roundNumber === 1) {
    this.replaceCards(this.startingEnemies, this.enemyDeck,
                      this.enemiesActive);
    this.replaceCards(this.marketSize, this.advTactics,
                      this.market);
  } else {
    let newEnemies = this.enemiesPerTurn;
    if (this.enemyBase.effects.intercepted === true) {
      newEnemies -= 1;
      this.enemyBase.effects.intercepted = false;
    }
    for (let i = 0; i < newEnemies; i++) {
      this.addEnemy();
    }
    if (this.enemyBase.effects.deploy === true) {
      this.addEnemy();
      this.enemyBase.effects.deploy = false;
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
  for (let i = 0; i < this.friendlies.length; i++) {
    let player = this.friendlies[i];
    if (player.id === 'FriendlyBase' || player.effects.dead) {
      continue;
    } else {
      player.resetCardsUsed();
      this.replaceCards(player.tacticalCardsPerTurn,
                        this.tacticalDeck, player.hand);
    }
  }
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
      damage += friendly.pursuers[x].power;
    }
    friendly.takeDamage(this, friendly.checkDamageNegation(this, damage));
  }
  this.replaceEnemyBaseCard();
}

Game.prototype.adjustTurn = function() {
  // skips friendly base and dead pilots in turn order
  if (this.currentTurn >= this.friendlies.length
      || (this.currentTurn === this.friendlies.length-1
      && this.friendlies[this.currentTurn].id === 'FriendlyBase')
      || (this.currentTurn === this.friendlies.length-1
      && this.friendlies[this.currentTurn].effects.dead)) {
    this.currentTurn = 0;
  }
}

Game.prototype.nextTurn = function() {
  this.update();
  if (!this.win && !this.lose) {
    let cardsLeft = 0;
    this.friendlies.forEach((friendly) => {
      if (friendly.id === 'FriendlyBase') {
        cardsLeft += 0;
      } else {
        cardsLeft += friendly.hand.length;
      }
    });
    if (cardsLeft === 0) {
      this.nextRound();
      this.currentTurn = 0;
    } else {
      this.currentTurn += 1;
    }
    this.adjustTurn();
    while (this.friendlies[this.currentTurn].id === 'FriendlyBase'
          || this.friendlies[this.currentTurn].effects.dead) {
      this.currentTurn += 1;
      this.adjustTurn();
    }
  }
}

Game.prototype.nextRound = function() {
  this.postRound();
  this.round();
  this.update();
}

Game.prototype.buildDecks = function() {
  // build tactical deck
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
let missile = new Tactical("Missile", "missile", "Damage a target for a 'fire' roll plus a missile die");
let drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly and bring it to you");
let feint = new Tactical("Feint", "feint", "Reuse the last tactical card you used this round");
let barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself. It now pursues the friendly base");
let scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 2 damage to a target, and 1 damage to each adjacent target (ff)");
let immelman = new Tactical("Immelman", "immelman", "Missile an enemy pursuing you");

// Advanced tactics
// let medalOfHonor = new AdvTactical("Medal of Honor", "medalOfHonor", "Every enemy destroyed is worth 1 extra merit", 10);
// let daredevil = new AdvTactical("Daredevil", "daredevil", "Allows you to attack the EB with 1 pursuer", 10);
// let medic = new AdvTactical("Medic", "medic", "Restore 1 armor to a friendly of your choice each round", 10);
// let sharpShooter = new AdvTactical("Sharp Shooter", "sharpshooter", "Improve player accuracy rolls/add an extra die", 10);
let bomb = new AdvTactical("Bomb", "bomb", "Deal 6 damage to a target, and 2 damage to each adjacent target (ff)", 8);
let heatSeeker = new AdvTactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy", 5);
let healthPack = new AdvTactical("Emergency repairs", "healthPack", "Remove 5 damage from a friendly (any)", 4);
let jammer = new AdvTactical("Jammer", "jammer", "Do not draw an enemy base card next round", 6);
let intercept = new AdvTactical("Intercept", "intercept", "Draw one less enemy into play next round", 6);
let emp = new AdvTactical("EMP", "emp", "Choose a friendly (other). Their pursuers cannot damage them this round", 5);
let countermeasures = new AdvTactical("Counter measures", "countermeasures", "Ignore damage this round equal to the result of a 'fire' roll", 2);
let divertShields = new AdvTactical("Divert Shields", "divertShields", "Keep this card. It absorbs the next 5 damage you take", 3);
let jump = new AdvTactical("Jump", "jump", "Discard all of your pursuers this round", 15);
let hardSix = new AdvTactical("Roll the hard six", "hardSix", "If pursued, missile the enemy base and take damage of a 'fire' roll", 6);
let snapshot = new AdvTactical("Snapshot", "snapshot", "Remove an enemy from play (no merit awarded)", 7);
let guidedMissile = new AdvTactical("Guided Missile", "guidedMissile", "Deal 6 damage to the enemy base, even if pursued", 10);
let incinerate = new AdvTactical("Incinerate", "incinerate", "Destroy the first enemy drawn to you next round", 7);


// define enemy types
let ace = new Enemy("Ace","ace",6,4,5,4);
let heavy = new Enemy("Heavy","heavy",5,3,3,3);
let medium = new Enemy("Medium","medium",4,2,4,2);
let light = new Enemy("Light","light",3,2,4,1);
let empty = new Enemy("Empty space","emptySpace",0,0,0,0);
let placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);

// define enemy base cards
let fireLight = new EnemyBaseCard("Fire light weapons", "fireLight", "Dealt 3 damage to Friendly Base");
let fireHeavy = new EnemyBaseCard("Fire heavy weapons", "fireHeavy", "Dealt 5 damage to Friendly Base");
let deploy = new EnemyBaseCard("Deploy", "deploy", "Launched an extra enemy fighter");
let repair = new EnemyBaseCard("Repairs", "repair", "Repaired 5 armor.");
let reinforce = new EnemyBaseCard("Reinforcements", "reinforce", "Increased launch rate by 1");

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
  if (req.session.userId) {
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

// game logic
io.on('connect', onConnection);

function getUser(userId, callback) {
  User.findById(userId, function(error, user) {
    if (error) {
      callback(err, null);
    } else if (user === null) {
      console.error('Error fetching game session');
    } else {
      callback(null, user);
    }
  });
}

function getGameSession(gameId, callback) {
  GameSession.findById(gameId, function(error, game) {
    if (error) {
      callback(err, null);
    } else if (game === null) {
      console.error('Error fetching game session');
    } else {
      callback(null, game);
    }
  });
}

function saveGame(game) {
  getGameSession(game.gameID, function(err, gameSession) {
    if (err) {
      console.error(err);
    } else {
      gameSession.meta.rounds = game.roundNumber;
      gameSession.meta.shuffles.tactical = game.tacticalDeck.shuffles;
      gameSession.meta.shuffles.enemy = game.enemyDeck.shuffles;
      gameSession.state = [game];
      if (game.win || game.lose) {
        let endTime = new Date();
        let ms = endTime - gameSession.meta.startTime;
        let min = Math.round(ms/1000/60);
        gameSession.gameName = gameSession._id;
        gameSession.meta.endTime = endTime;
        gameSession.meta.elapsedTime = min;
        if (game.win) {
          io.to(game.gameID).emit('end', 'Victory!');
          gameSession.meta.won = true;
          gameSession.save(function(err, updatedSession) {
            if (err) {
              console.error(err);
            } else {
              updateObjects(game.gameID, updatedSession);
              for (let i = 1; i < 5; i++) {
                let user = 'user' + i;
                if (updatedSession.users[user]) {
                  let query = { callsign: updatedSession.users[user] };
                  User.find(query, function(err, player) {
                    if (err) {
                      console.error(err);
                    } else {
                      let wins = player[0].meta.wins + 1;
                      function getRank(number, list, inc) {
                      	if (number <= list.length*inc && number % inc === 0) {
                      		return list[number/inc-1];
                        }
                      }
                      let ranks = ['Lieutenant', 'Captain', 'Major', 'Lt. Colonel', 'Colonel', 'Commander', 'Admiral'];
                      let query = player[0];
                      let rank = getRank(wins, ranks, 3) || player[0].meta.rank;
                      let update = { 'meta.wins': wins, 'meta.rank': rank };
                      if (wins <= 21 && wins % 3 === 0) {
                        console.log(player[0].callsign + " promoted to " + rank);
                      }
                      User.update(query, update, function(err, updatedUser) {
                        if (err) {
                          console.error(err);
                        } else {
                          console.log(updatedSession.users[user] + " updated");
                        }
                      });
                    }
                  });
                } else {
                  continue;
                }
              }
            }
          });
        } else {
          io.to(game.gameID).emit('end', 'Defeat!');
          gameSession.meta.lost = true;
          gameSession.save(function(err, updatedSession) {
            if (err) {
              console.error(err);
            } else {
              updateObjects(game.gameID, updatedSession);
              for (let i = 1; i < 5; i++) {
                let user = 'user' + i;
                if (updatedSession.users[user]) {
                  let query = { callsign: updatedSession.users[user] };
                  let update = { $inc: { 'meta.losses': 1 }};
                  User.update(query, update, function() {
                    console.log(updatedSession.users[user] + " updated");
                  });
                } else {
                  continue;
                }
              }
            }
          });
        }
      } else {
        gameSession.save(function(err, updatedSession) {
          if (err) {
            console.error(err);
          } else {
            updateObjects(game.gameID, updatedSession);
          }
        });
      }
    }
  });
}

function onConnection(socket) {
  let gameId = socket.request._query['room'];
  let userId = socket.request._query['user'];

  function join(player) {
    socket.join(gameId);
    getUser(userId, function(err, user) {
      if (err) {
        console.error(err);
      } else {
        player.name = user.callsign;
        console.log(user.callsign + ' joined ' + gameId + ' as ' + player.id);
        socket.emit('assign', { player: player } );
        socket.on('turn', turn);
        socket.on('chat', function(data) {
          io.to(data.room).emit('chatMessage', data.message);
          if (data.message.toLowerCase().includes('what do you hear')) {
            io.to(data.room).emit('msg', "Nothin' but the wind");
          }
          if (data.message.toLowerCase().includes('good hunting')) {
            io.to(data.room).emit('msg', "So say we all!");
          }
        });
        io.to(gameId).emit('msg', user.callsign + ' joined the game.');
        socket.on('disconnect', function() {
          console.log('user disconnected');
          getGameSession(gameId, function(err, gameSession) {
            if (err) {
              console.error(err);
            } else {
              if (!gameSession.meta.lost && !gameSession.meta.won) {
                io.to(gameId).emit('msg', user.callsign + ' left.');
                let setNewLeader = false;
                for (person in gameSession.users) {
                  if (gameSession.users[person] && gameSession.users[person].name === user.callsign) {
                    if (gameSession.users[person].leader) {
                      setNewLeader = true;
                      gameSession.users[person].leader = false;
                    }
                    gameSession.users[person].name = '';
                    gameSession.users[person].socketId = '';
                    gameSession.players -= 1;
                  }
                }
                if (setNewLeader) {
                  if (gameSession.users.user1.name.length > 0) {
                    gameSession.users.user1.leader = true;
                    io.to(gameSession.users.user1.socketId).emit('firstPlayer');
                  } else if (gameSession.users.user2.name.length > 0) {
                    gameSession.users.user2.leader = true;
                    io.to(gameSession.users.user2.socketId).emit('firstPlayer');
                  } else if (gameSession.users.user3.name.length > 0) {
                    gameSession.users.user3.leader = true;
                    io.to(gameSession.users.user3.socketId).emit('firstPlayer');
                  } else if (gameSession.users.user4.name.length > 0) {
                    gameSession.users.user4.leader = true;
                    io.to(gameSession.users.user4.socketId).emit('firstPlayer');
                  }
                }
                if (gameSession.players === 0) {
                  gameSession.gameName = gameSession._id;
                  gameSession.meta.aborted = true;
                  console.log('Game ' + gameSession._id + ' aborted');
                } else {
                  if (gameSession.state.length === 0) {
                    if (gameSession.meta.locked) {
                      gameSession.meta.locked = false;
                    } else if (gameSession.players === 1) {
                      io.to(gameId).emit('closeGame');
                      io.to(gameId).emit('msg', 'Waiting for second player...')
                    }
                  } else {
                    // logic for leaving during active game
                    // currently destroys leaving player's pilot
                    // eventually replace this logic with re-entry option
                    console.log(user.callsign + ' left during active game');
                    loadGame(gameSession, undefined, function(game) {
                      for (let i=0; i < game.friendlies.length; i++) {
                        let friendly = game.friendlies[i];
                        if (friendly.name === user.callsign) {
                          friendly.destroyed(game, 'MIA');
                          break;
                        }
                      }
                      game.nextTurn();
                      saveGame(game);
                    });
                  }
                }
                gameSession.save(function (err, updatedSession) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('user removed from ' + updatedSession._id);
                  }
                });
              }
            }
          });
          socket.leave(gameId);
        });
        getGameSession(gameId, function(err, gameSession) {
          if (err) {
            console.error(err);
          } else {
            if (gameSession.players === 1) {
              gameSession.users.user1.leader = true;
            }
            for (person in gameSession.users) {
              if (gameSession.users[person] && gameSession.users[person].name === user.callsign) {
                gameSession.users[person].socketId = socket.id;
              }
            }
            gameSession.save();
          }
        })
      }
    });
  }

  function addPlayer(gameId, userId) {
    getGameSession(gameId, function(err, gameSession) {
      if (err) {
        console.error(err);
      } else {
        getUser(userId, function(err, user) {
          if (err) {
            console.error(err);
          } else {
            if (gameSession.users.user1.name === user.callsign) {
              let Player1 = new Player('Player1');
              join(Player1);
            } else if (gameSession.users.user2.name === user.callsign) {
              let Player2 = new Player('Player2');
              join(Player2);
            } else if (gameSession.users.user3.name === user.callsign) {
              let Player3 = new Player('Player3');
              join(Player3);
            } else if (gameSession.users.user4.name === user.callsign) {
              let Player4 = new Player('Player4');
              join(Player4);
            }
          }
        });
      }
    });
  }

  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    } else {
      if (gameSession.players === 4) {
        addPlayer(gameId, userId);
        io.to(gameId).emit('msg', 'Game full');
        gameSession.meta.locked = true;
        gameSession.save();
      } else if (gameSession.players === 3) {
        addPlayer(gameId, userId);
      } else if (gameSession.players === 2) {
        addPlayer(gameId, userId);
        io.to(gameId).emit('msg', 'Game ready');
        io.to(gameId).emit('openGame');
      } else {
        let Player1 = new Player('Player1');
        join(Player1);
        socket.emit('msg', 'Waiting for second player...');
        socket.emit('firstPlayer');
        socket.on('startGame', function(data) {
          let gameId = data.room;
          getGameSession(gameId, function(err, gameSession) {
            if (err) {
              console.error(err);
            } else {
              if (gameSession.players >= 2) {
                let update = {
                  'meta.locked': true,
                  'meta.startTime': new Date(),
                  'meta.endTime': new Date()
                };
                GameSession.update(gameSession, update, function() {
                  io.to(gameId).emit('start');
                  let game = new Game(gameSession._id, gameSession.gameName, gameSession.difficulty);
                  let FriendlyBase = new Friendly("FriendlyBase", gameSession.gameName, 30);
                  let Player1;
                  let Player2;
                  let Player3;
                  let Player4;
                  game.friendlies = [FriendlyBase];
                  if (gameSession.users.user1) {
                    Player1 = new Player('Player1', gameSession.users.user1.name);
                    game.friendlies.push(Player1);
                  }
                  if (gameSession.users.user2) {
                    Player2 = new Player('Player2', gameSession.users.user2.name);
                    game.friendlies.push(Player2);
                  }
                  if (gameSession.users.user3) {
                    Player3 = new Player('Player3', gameSession.users.user3.name);
                    game.friendlies.push(Player3);
                  }
                  if (gameSession.users.user4) {
                    Player4 = new Player('Player4', gameSession.users.user4.name);
                    game.friendlies.push(Player4);
                  }
                  game.buildDecks();
                  game.round();
                  game.update();
                  gameSession.state.push(game);
                  gameSession.save(function(err, updatedSession) {
                    if (err) {
                      console.error(err)
                    } else {
                      updateObjects(gameId, updatedSession);
                    }
                  });
                });
              } else {
                console.error('Error launching game.');
              }
            }
          });
        });
      }
    }
  });
}

function updateObjects(gameId, gameSession) {
  let gameData = {
    game: gameSession.state[0],
  }
  io.to(gameId).emit('update', gameData);
}

function loadGame(gameSession, specs, callback) {
  let game = new Game(gameSession._id, gameSession.gameName, gameSession.difficulty)
  let FriendlyBase = new Friendly('FriendlyBase', gameSession.gameName, 30);
  let Player1 = new Player('Player1');
  let Player2 = new Player('Player2');
  let Player3 = new Player('Player3');
  let Player4 = new Player('Player4');
  let gameState = gameSession.state[0];
  let loadPlayer = function(player, friendly) {
    player.name = friendly.name;
    player.currentArmor = friendly.currentArmor;
    player.lastCardUsed = friendly.lastCardUsed;
    player.hand = friendly.hand;
    player.pursuers = friendly.pursuers;
    player.pursuerDamage = friendly.pursuerDamage;
    player.merit = friendly.merit;
    player.effects = friendly.effects;
    game.friendlies.push(player);
  }
  for (let i = 0; i < gameState.friendlies.length; i++) {
    let friendly = gameState.friendlies[i];
    if (friendly.id === 'FriendlyBase') {
      FriendlyBase.pursuers = friendly.pursuers;
      FriendlyBase.pursuerDamage = friendly.pursuerDamage;
      FriendlyBase.effects = friendly.effects;
      FriendlyBase.currentArmor = friendly.currentArmor;
      game.friendlies.push(FriendlyBase);
    } else if (friendly.id === 'Player1') {
      loadPlayer(Player1, friendly);
    } else if (friendly.id === 'Player2') {
      loadPlayer(Player2, friendly);
    } else if (friendly.id === 'Player3') {
      loadPlayer(Player3, friendly);
    } else if (friendly.id === 'Player4') {
      loadPlayer(Player4, friendly);
    }
  }
  game.roundNumber = gameState.roundNumber;
  game.currentTurn = gameState.currentTurn;
  game.tacticalDeck = gameState.tacticalDeck;
  game.advTactics = gameState.advTactics;
  game.enemyBaseDeck = gameState.enemyBaseDeck;
  game.enemyDeck = gameState.enemyDeck;
  game.market = gameState.market;
  game.enemiesActive = gameState.enemiesActive;
  game.enemiesPerTurn = gameState.enemiesPerTurn;
  game.currentEnemyBaseCard = gameState.currentEnemyBaseCard;
  game.win = gameState.win;
  game.lose = gameState.lose;
  game.enemiesPerTurn = gameState.enemiesPerTurn;
  game.enemyBase.currentArmor = gameState.enemyBase.currentArmor;
  game.enemyBase.effects = gameState.enemyBase.effects;
  callback(game, specs);
}

function turn(data) {
  let gameId = data.room;
  let specs = data.turnInfo;
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    } else {
      loadGame(gameSession, specs, turnAction);
    }
  });
}

function turnAction(game, specs) {
  let getPlayer = function(id) {
    for (let i=0; i < game.friendlies.length; i++) {
      let friendly = game.friendlies[i];
      if (id === friendly.id) {
        return friendly;
      } else if (id === game.enemyBase.id) {
        return game.enemyBase;
      }
    }
  }

  let friendly = undefined;
  let player = getPlayer(specs.player.id);
  if (specs.friendly !== undefined) {
    friendly = getPlayer(specs.friendly.id);
  }

  if (game.currentTurn === game.friendlies.indexOf(player)) { // should protect against possible tampering on front end
    if (specs.button === 'use') {
      game = player.useTactic(game, specs.cardIndex, friendly, specs.pursuerIndex);
    } else {
      game = player.discard(game, specs.cardIndex, specs.button, friendly,
                                                                specs.pursuerIndex,
                                                                specs.purchaseIndex);
    }

    saveGame(game);
  }
}

//# sourceMappingURL=app.js.map
