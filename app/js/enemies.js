const EnemyBase = function() {
  this.name = "Enemy Base";
  this.maxArmor = 30;
  this.currentArmor = 30;
  this.enemyBaseDeck = [];
  this.enemyBaseDiscard = [];
  this.enemyBaseCardsPerTurn = 1;
  this.currentEnemyBaseCard;
  this.enemyDeck = [];
  this.enemyDiscard = [];
  this.enemiesActive = [];
  // this.startingEnemies = friendlies.length * 2
  this.enemyCardsInTurn;
  this.fireLight = FriendlyBase.name + "takes 3 damage.";
  this.fireHeavy = FriendlyBase.name + "takes 5 damage.";
  this.repair = this.name + "repairs 3 damage.";
  this.deploy = "Draw an extra enemy card into play in the next round";
  this.reinforce = "Increase the amount enemies that enter the fray each turn by 1";
  this.summary = function() {
          let summary = "<h3>" + this.name + "</h3>"
          + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
          return summary;
          }
}

EnemyBase.prototype.addEnemy = function() {
  checkDeck(this.enemyDeck, this.enemyDiscard);
  this.enemiesActive.push(this.enemyDeck.pop());
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
  } else {
    this.card = "<li class='enemy " + this.cssClass + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>ARM: " + this.armor + "</p>"
            + "<p>PWR: " + this.power + "</p>"
            + "<p>TGT: " + this.targeting + "</p>"
            + "<p>MRT: " + this.merit + "</p>"
            + "</li>";
  }
}

Enemy.prototype.takeDamage = function(damage) {
  this.currentArmor -= damage;
  console.log(
    this.name + " takes " + damage + " damage. Current armor: "
    + this.currentArmor + "/" + this.armor)
}

Enemy.prototype.resetArmor = function() {
  this.currentArmor = this.armor;
}

const ace = new Enemy("Ace","ace",6,4,5,4);
const heavy = new Enemy("Heavy","heavy",5,3,3,3);
const medium = new Enemy("Medium","medium",4,2,4,2);
const light = new Enemy("Light","light",3,2,4,1);
const empty = new Enemy("Empty space","emptySpace",0,0,0,0);
const placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);
const enemyBase = new EnemyBase();
