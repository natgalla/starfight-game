var Tactical = function(name, cssClass, description) {
  this.name = name;
  this.cssClass = cssClass;
  this.description = description;
  this.card = "<li class='tactical " + this.cssClass + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "</li>";
}

var missile = new Tactical("Missile", "missile", "Choose a target and roll 5 combat dice")
var repairDrone = new Tactical("Repair drone", "repairDrone", "Choose a friendly and restore 3 hp")
var assist = new Tactical("Assist", "assist", "Draw a tactical card, then give a card in your hand to another player")
var drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly and bring it to you")
var heatSeeker = new Tactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy")
var bomb = new Tactical("Bomb", "bomb", "Deal 6 damage to a single target, and 2 damage to the target on either side of it.")
var feint = new Tactical("Feint", "feint", "Reuse a tactical card you already used this round")
var barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself and place it in the middle of the fray")
var scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 1 damage to 2 adjacent enemies")
var immelman = new Tactical("Immelmann", "immelman", "Missile on your own pursuer")
var jammer = new Tactical("Jammer", "jammer", "Nullify damage to the friendly base from an enemy base card")
