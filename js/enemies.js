var EnemyBase = function() {
  this.name = "Enemy Base";
  this.maxArmor = 30;
  this.currentArmor = 30;
  this.deck = [];
  this.summary = function() {
          var summary = "<h3>" + this.name + "</h3>"
          + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
          return summary;
          }
}

var Enemy = function(name, cssClass, armor, power, targeting, merit) {
  this.name = name;
  this.cssClass = cssClass
  this.armor = armor;
  this.power = power;
  this.targeting = targeting;
  this.merit = merit;
  this.card = "<li class='enemy " + this.name + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>ARM: " + this.armor + "</p>"
            + "<p>PWR: " + this.power + "</p>"
            + "<p>TGT: " + this.targeting + "</p>"
            + "<p>MRT: " + this.merit + "</p>"
            + "</li>";
}

var ace = new Enemy("Ace","ace",6,4,5,4);
var heavy = new Enemy("Heavy","heavy",5,3,3,3);
var medium = new Enemy("Medium","medium",4,2,4,2);
var light = new Enemy("Light","medium",3,2,4,1);
var empty = new Enemy("Empty space","emptySpace",0,0,0,0);
var placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);
var enemyBase = new EnemyBase();
