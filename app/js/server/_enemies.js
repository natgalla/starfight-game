const EnemyBase = function() {
  this.id = "enemyBase";
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
    io.sockets.emit("msg", this.name + " destroyed! Players win.");
    game.win = true;
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
  io.sockets.emit("msg", this.name + " will launch one extra enemy card into play each round.");
  this.enemiesPerTurn += 1;
}

EnemyBase.prototype.repair = function() {
  this.currentArmor += 5;
  if (this.currentArmor > this.maxArmor) {
    this.currentArmor = this.maxArmor;
  }
  io.sockets.emit("msg", this.name + " Repairs 5 damage. Current armor: "
              + this.currentArmor + "/" + this.maxArmor);
}

EnemyBase.prototype.fireHeavy = function() {
  io.sockets.emit("msg", this.name + " fires heavy weapons.");
  FriendlyBase.takeDamage(5);
}

EnemyBase.prototype.fireLight = function() {
  io.sockets.emit("msg", this.name + " fires light weapons.");
  FriendlyBase.takeDamage(3);
}

EnemyBase.prototype.deploy = function() {
  io.sockets.emit("msg", this.name + " launches an extra fighter.");
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
