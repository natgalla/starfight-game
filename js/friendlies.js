const Friendly = function(name, maxArmor) {
  this.name = name;
  this.maxArmor = maxArmor;
  this.pursuers = [];
  this.pursuerDamage = [];
  this.currentArmor = maxArmor;
  this.summary = function() {
            let summary = "<h3>" + this.name + "</h3>"
            + "<p>Armor: " + this.currentArmor + "/" + this.maxArmor + "</p>";
            return summary;
            };
}

const Player = function(name) {
  this.name = name;
  this.maxArmor = 10;
  this.tacticalCardsPerTurn = 3;
  this.currentArmor = this.maxArmor;
  this.hand = [];
  this.pursuers = [];
  this.pursuerDamage = [];
  this.merit = 0;
  this.combatDie = [0,0,0,1,1,2];
  this.improvedDie = [0,0,1,1,1,2];
  this.amtImproved = 0;
  this.summary = function() {
                let summary = "<div class='playerSummary " + this.name + "'>"
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

Player.prototype.insertPlaceholder = location => {
  //removes an enemy card from the fray and inserts a "destroyed" place holder
  let removed = this.pursuers.splice(location);
  enemyBase.enemyDiscard.push(removed[0]);
  this.pursuers.splice(location, 0, placeHolder);
  this.pursuers.join();
}

Player.prototype.damageRoll = list => { list[Math.floor(Math.random() * 6)]; }

// calculate damage // only returning 0
Player.prototype.calcDamage = dice => {
  let totalRolls = dice;
  let improvedRolls = self.amtImproved;
  let normalRolls = totalRolls - improvedRolls;
  let damage = 0;
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
Player.prototype.takeDamage = number => { this.currentArmor -= number; }

Player.prototype.doDamage = function() {

}

// choose ally and choose enemy
Player.prototype.chooseAlly = function() {

}
Player.prototype.chooseEnemy = function() {

}

// tactical card actions
Player.prototype.fire = function() {

}

Player.prototype.missile = function() {

}

Player.prototype.heatseeker = function() {

}

Player.prototype.bomb = function() {

}

Player.prototype.repairdrone = function() {

}

Player.prototype.assist = function() {

}

const FriendlyBase = new Friendly("Friendly Base", 30);
const Player1 = new Player();
const Player2 = new Player();
const Player3 = new Player();
const Player4 = new Player();
