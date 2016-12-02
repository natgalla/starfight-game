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
  this.enemiesPerTurn = 3;
  this.fireLight = FriendlyBase.name + "takes 3 damage.";
  this.fireHeavy = FriendlyBase.name + "takes 5 damage.";
  this.repair = this.name + "repairs 3 damage.";
  this.deploy = "Draw an extra enemy card into play in the next round";
  this.reinforce = "Increase the amount enemies that enter the fray each turn by 1";
  this.summary = "<h3>" + this.name + "</h3>"
          + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
}

EnemyBase.prototype.updateSummary = function() {
  this.summary = "<h3>" + this.name + "</h3>"
                  + "<p>Armor: " + this.currentArmor + "/"
                  + this.maxArmor + "</p>";
}

EnemyBase.prototype.takeDamage = function(damage) {
  this.currentArmor -= damage;
  if (this.currentArmor < 0) {
    this.currentArmor = 0;
  }
  if (this.currentArmor === 0) {
    console.log(this.name + " destroyed! Players win.");
  }
}

EnemyBase.prototype.addEnemy = function() {
  game.checkDeck(this.enemyDeck);
  this.enemiesActive.push(this.enemyDeck.cards.pop());
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

Enemy.prototype.updateCard = function() {
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
}

Enemy.prototype.resetArmor = function() {
  this.currentArmor = this.armor;
}

const EnemyBaseCard = function(name, description) {
  this.name = name;
  this.description = description;
}

// define enemy types
const ace = new Enemy("Ace","ace",6,4,5,4);
const heavy = new Enemy("Heavy","heavy",5,3,3,3);
const medium = new Enemy("Medium","medium",4,2,4,2);
const light = new Enemy("Light","light",3,2,4,1);
const empty = new Enemy("Empty space","emptySpace",0,0,0,0);
const placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);
const enemyBase = new EnemyBase();

// define enemy base cards
const fireLight = new EnemyBaseCard("Fire light weapons", "Friendly base takes 3 damage");
fireLight.action = function() {
  console.log(this.description);
  FriendlyBase.takeDamage(3);
}
const fireHeavy = new EnemyBaseCard("Fire heavy weapons", "Friendly base takes 5 damage");
fireHeavy.action = function() {
  console.log(this.description);
  FriendlyBase.takeDamage(5);
}
const deploy = new EnemyBaseCard("Deploy", "Draw an extra enemy card into play in the next round");
deploy.action = function() {
  console.log(this.description);
}
const repair = new EnemyBaseCard("Repairs", "Enemy base repairs 5 hp.");
deploy.action = function() {
  enemyBase.currentArmor += 3;
  if (enemyBase.currentArmor > enemyBase.maxArmor) {
    enemyBase.currentArmor = enemyBase.maxArmor;
  }
  console.log(this.description + " Current armor: "
              + enemyBase.currentArmor + "/" + enemyBase.maxArmor);
}
const reinforce = new EnemyBaseCard("Reinforcements", "Increase the amount enemies that enter the fray each turn by 1");
reinforce.action = function() {
  console.log(this.description);
  enemyBase.enemiesPerTurn += 1;
}


// IF MIGRATED TO SERVER SIDE
// module.exports.EnemyBase = EnemyBase;
// module.exports.Enemy = Enemy;
