var Friendly = function(name, maxArmor) {
  this.name = name;
  this.maxArmor = maxArmor;
  this.pursuers = [];
  this.pursuerDamage = [];
  this.currentArmor = maxArmor;
  this.summary = function() {
            var summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
            return summary;
            };
}

var Player = function(name) {
  this.name = name;
  this.maxArmor = 10;
  this.currentArmor = this.maxArmor;
  this.hand = [];
  this.pursuers = [];
  this.pursuerDamage = [];
  this.merit = 0;
  this.combatDie = [0,0,0,1,1,2];
  this.improvedDie = [0,0,1,1,1,2];
  this.amtImproved = 0;
  this.summary = function() {
    var summary = "<div class='playerSummary'>"
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

Player.prototype.damageRoll = function(list) {
  var randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

// calculate damage // only returning 0
Player.prototype.calcDamage = function(dice) {
  var totalRolls = dice;
  var improvedRolls = self.amtImproved;
  var normalRolls = totalRolls - improvedRolls;
  var damage = 0;
  while (normalRolls > 0) {
      damage += self.damageRoll(self.combatDie);
      normalRolls--;
    }
  while (improvedRolls > 0) {
      damage += self.damageRoll(self.improvedDie);
      improvedRolls--;
    }
    return damage;
}

// give and take damage
Player.prototype.takeDamage = function(number){
  this.currentArmor -= number;
}

Player.prototype.doDamage = function(){

}

// choose ally and choose enemy
Player.prototype.chooseAlly = function(){

}
Player.prototype.chooseEnemy = function(){

}

// tactical card actions
Player.prototype.fire = function(){

}

Player.prototype.missile = function(){

}

Player.prototype.heatseeker = function(){

}

Player.prototype.bomb = function(){

}

Player.prototype.repairdrone = function(){

}

Player.prototype.assist = function(){

}

var FriendlyBase = new Friendly("Friendly Base", 30);
var Player1 = new Player()
var Player2 = new Player()
var Player3 = new Player()
var Player4 = new Player()
