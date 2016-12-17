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

//temporarily declared as var for safari
// Tactical cards
var missile = new Tactical("Missile", "missile", "Choose a target and roll 5 combat dice");
var assist = new Tactical("Assist", "assist", "Draw a tactical card, then give a card in your hand to another player");
var drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly and bring it to you");
var feint = new Tactical("Feint", "feint", "Reuse the last tactical card you used this round");
var barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself and place it in the middle of the fray");
var scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 1 damage to 3 adjacent targets");
var immelman = new Tactical("Immelmann", "immelman", "Choose an enemy pursuing you and roll 5 combat dice");
var demo = new Tactical("Demo", "demo", "Example");

// Advanced tactics
// var medalOfHonor = new AdvTactical("Medal of Honor", "medalOfHonor", "Every enemy destroyed is worth 1 extra merit", 10);
// var daredevil = new AdvTactical("Daredevil", "daredevel", "Allows you to attack the EB with 1 pursuer", 10);
// var medic = new AdvTactical("Medic", "medic", "Restore 1 armor to a friendly of your choice each round", 10);
// var sharpShooter = new AdvTactical("Sharp Shooter", "sharpshooter", "Improve player accuracy rolls/add an extra die", 10);
var repairDrone = new AdvTactical("Repair drone", "repairDrone", "Choose a friendly and restore 3 hp", 3);
var bomb = new AdvTactical("Bomb", "bomb", "Deal 6 damage to a single target, and 2 damage to the target on either side of it.", 8);
var heatSeeker = new AdvTactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy", 5);
var healthPack = new AdvTactical("Health Pack", "healthPack", "Restore 5 hp to a target of your choice, then remove this card from the game.", 5);
var jammer = new AdvTactical("Jammer", "jammer", "Ignore the effect of the next EB card", 6);
var intercept = new AdvTactical("Intercept", "intercept", "Draw one less enemy into play next round", 5);
var emp = new AdvTactical("EMP", "emp", "Choose a friendly. Their pursuers cannot damage them this round", 5);
var countermeasures = new AdvTactical("Countermeasures", "countermeasures", "Ignore x damage where x is the result of a standard combat roll.", 2);
var divertShields = new AdvTactical("Divert Shields", "divertShields", "Keep this card. It absorbes the next 5 damage you take.", 3);
var jump = new AdvTactical("Jump", "jump", "Shake all your pursuers this round", 15);
var hardSix = new AdvTactical("Roll the hard six", "hardSix", "You may missile the enemy base with any amount of pursuers, but you take damage of a standard combat roll.", 3);
var snapshot = new AdvTactical("Snapshot", "snapshot", "Remove an enemy from play (no merit awarded)", 7);
var guidedMissile = new AdvTactical("Guided Missile", "guidedMissile", "Deal 6 damage to the enemy base regardless of pursuers.", 10);
var incinerate = new AdvTactical("Incinerate", "incinerate", "Destroy the first enemy drawn to you next round.", 7);

// IF MIGRATED TO SERVER SIDE
// module.exports.Tactical = Tactical;
