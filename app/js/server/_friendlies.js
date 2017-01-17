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
  this.repairDrone(friendly, index, 5, 0);
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
  io.to(game.gameID).emit("msg", this.name + " uses " + card.name)
  this[action](game, friendly, pursuerIndex);
  if (action != "feint") {
    this.lastCardUsed = card;
  }
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
