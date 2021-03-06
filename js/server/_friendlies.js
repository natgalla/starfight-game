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
      io.to(game.gameID).emit("msg", this.name + " has been destroyed.");
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
  this.adjustPursuerDamage();
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
  this.missileDie = [0,0,1,1,2,2];
  this.effects = {
    ability: "",
    dead: false,
    medalOfHonor: false,
    medic: false,
    daredevil: false,
    deadeye: false,
    heavyArmor: false,
    negotiator: false,
    resourseful: false,
    strategist: false,
    lightningReflexes: false,
    commsExpert: false,
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
  }
  if (this.effects.status === "KIA" || this.effects.status === "MIA") {
    this.summary += "<p class='pursued'>" + this.effects.status + "</p>";
  } else {
    this.summary += "<p class='free'>" + this.effects.ability + "</p>";
  }
}

Player.prototype.damageRoll = function(list) {
  // return a random value from a list
  return list[Math.floor(Math.random() * list.length)];
}

Player.prototype.increaseMerit = function(game, amount) {
  this.merit += amount;
  io.to(game.gameID).emit("msg", this.name + " receives " + amount + " merit.");
}

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
    io.to(game.gameID).emit("msg", "All pilots destroyed.");
    game.lose = true;
  } else {
    game.distributeEnemies(pursuers);
  }
}

Player.prototype.takeDamage = function(game, damage) {
  if (damage > 0) {
    this.currentArmor -= damage;
    if (this.currentArmor <= 0) {
      this.currentArmor = 0;
      io.to(game.gameID).emit("msg", this.name + " takes " + damage + " damage. " + this.name + " has been destroyed.");
    } else {
      io.to(game.gameID).emit("msg", this.name + " takes " + damage + " damage. Current armor: "
                  + this.currentArmor + "/" + this.maxArmor);
    }
  }
}

Player.prototype.checkKill = function(game, friendly, index) {
  if (friendly.pursuerDamage[index] >= friendly.pursuers[index].armor) {
    io.to(game.gameID).emit("msg", friendly.pursuers[index].name + " pursuing " + friendly.name
                + " destroyed.")
    let merit = friendly.pursuers[index].merit;
    if (this.effects.medalOfHonor === true) {
      merit += 1;
    }
    this.increaseMerit(game, merit);
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
    if (friendly.pursuers[index] && (friendly.pursuers[index].cssClass === "emptySpace"
      || friendly.pursuers[index].cssClass === "destroyed")) {
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
  let damage = 0;
  if (this.effects.deadeye) {
    damage = this.calcDamage(5);
  } else {
    damage = this.calcDamage(4);
  }
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
    game.friendlies[game.findFriendlyBase()].adjustPursuerDamage();
  } else {
    io.to(game.gameID).emit("msg", this.name + " can't shake 'em!")
  }
}

Player.prototype.missile = function(game, friendly, pursuerIndex) {
  let damage = 0;
  if (this.effects.deadeye) {
    damage = this.calcDamage(5) + this.damageRoll(this.missileDie);
  } else {
    damage = this.calcDamage(4) + this.damageRoll(this.missileDie);
  }
  this.doDamage(game, friendly, pursuerIndex, damage);
}

Player.prototype.heatSeeker = function(game, friendly, pursuerIndex) {
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

Player.prototype.repairDrone = function(game, friendly, index, repairPoints, meritReward, medic) {
  if (index === undefined) {
    index = 0;
  }
  if (repairPoints === undefined) {
    repairPoints = 3;
  }
  if (meritReward === undefined) {
    meritReward = 2;
  }
  if (medic === undefined) {
    medic = false;
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
                + friendly.currentArmor + "/" + friendly.maxArmor);
    if (medic) {
      this.effects.medicActive = false;
      return game;
    }
  } else {
    io.to(game.gameID).emit("msg", friendly.name + " is already at maximum armor.");
  }
}

Player.prototype.drawFire = function(game, friendly, index) {
  io.to(game.gameID).emit("msg", friendly.pursuers[index].name + " moves from " + friendly.name
              + " to " + this.name + ".");
  this.increaseMerit(game, friendly.pursuers[index].merit);
  game.moveCard(index, friendly.pursuers, this.pursuers);
  game.moveCard(index, friendly.pursuerDamage, this.pursuerDamage);
  friendly.insertPlaceholder(index);
  this.adjustPursuerDamage();
}

Player.prototype.feint = function(game, friendly, pursuerIndex) {
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
  io.to(game.gameID).emit("msg", this.name + " does a barrel roll! " + this.pursuers[pursuerIndex].name + " now pursues "
              + game.friendlies[game.findFriendlyBase()].name + ".");
  game.moveCard(pursuerIndex, this.pursuers, game.friendlies[game.findFriendlyBase()].pursuers);
  game.moveCard(pursuerIndex, this.pursuerDamage, game.friendlies[game.findFriendlyBase()].pursuerDamage);
  this.insertPlaceholder(pursuerIndex);
  game.friendlies[game.findFriendlyBase()].adjustPursuerDamage();
}

Player.prototype.scatterShot = function(game, friendly, pursuerIndex) {
  this.bomb(game, friendly, pursuerIndex, 2, 1)
}

Player.prototype.immelman = function(game, friendly, index) {
  this.missile(game, this, index);
}



/**************************
PLAYER ADVANCED TACTICAL FUNCTIONS
**************************/

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
  io.to(game.gameID).emit("msg", this.name + " shakes " + this.pursuers.length
              + " pursuers.");
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

Player.prototype.medalOfHonor = function() {
  this.effects.ability = "Medal of Honor";
  this.effects.medalOfHonor = true;
}

Player.prototype.deadeye = function() {
  this.effects.ability = "Deadeye";
  this.effects.deadeye = true;
}

Player.prototype.negotiator = function() {
  this.effects.ability = "Negotiator";
  this.effects.negotiator = true;
}

Player.prototype.daredevil = function() {
  this.effects.ability = "Daredevil";
  this.effects.daredevil = true;
}

Player.prototype.heavyArmor = function() {
  this.effects.ability = "Heavy Armor";
  this.effects.heavyArmor = true;
  this.maxArmor = 15;
  this.currentArmor = 15;
}

Player.prototype.strategist = function() {
  this.effects.ability = "Strategist";
  this.effects.strategist = true;
  this.tacticalCardsPerTurn = 4;
}

Player.prototype.medic = function() {
  this.effects.ability = "Medic";
  this.effects.medic = true;
  this.effects.medicActive = true;
}

Player.prototype.resourceful = function() {
  this.effects.ability = "Resourceful";
  this.effects.resourceful = true;
  this.effects.resourcefulActive = true;
}

Player.prototype.commsExpert = function() {
  this.effects.ability = "Comms Expert";
  this.effects.commsExpert = true;
}

/**************************
GENERIC FUNCTIONS TO USE TACTICAL CARDS
**************************/

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

Player.prototype.discard = function(game, cardIndex, action, friendly, pursuerIndex, advIndex, commsExpert) {
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
    let choice = game.market[advIndex];
    this.lastCardUsed = choice;
    let advAction = choice.cssClass;
    game.advTacticsPurchased.push(advAction);
    if (commsExpert) {
      this[advAction](game, friendly, pursuerIndex);
      game.removeAdvTactic(advIndex);
      io.to(game.gameID).emit("msg", this.name + " uses " + choice.name);
      this.effects.commsExpert = false;
    } else {
      let cost = choice.cost;
      if (this.effects.negotiator) {
        cost -= 1;
      }
      if (this.merit >= cost) {
        this.merit -= cost;
        this[advAction](game, friendly, pursuerIndex);
        game.removeAdvTactic(advIndex);
        io.to(game.gameID).emit("msg", this.name + " uses " + choice.name);
      } else {
        io.to(game.gameID).emit("msg", this.name + " does not have enough merit.");
      }
    }
  } else {
    this[action](game, friendly, pursuerIndex);
  }
  game.moveCard(cardIndex, this.hand, game.tacticalDeck.discard);
  game.nextTurn();
  return game;
}
