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
    io.to(game.gameID).emit("msg", this.name + " destroyed!");
    game.win = true;
  }
  this.updateSummary(game);
}


/************************
ENEMY BASE CARD FUNCTIONS
*************************/

EnemyBase.prototype.reinforce = function(game) {
  io.to(game.gameID).emit("msg", this.name + " will launch one extra enemy card into play each round.");
  game.enemiesPerTurn += 1;
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
  game.friendlies[game.findFriendlyBase()].takeDamage(5);
}

EnemyBase.prototype.fireLight = function(game) {
  io.to(game.gameID).emit("msg", this.name + " fires light weapons.");
  game.friendlies[game.findFriendlyBase()].takeDamage(3);
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
