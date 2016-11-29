const Tactical = function(name, cssClass, description) {
  this.name = name;
  this.cssClass = cssClass;
  this.description = description;
  this.card = "<li class='tactical " + this.cssClass + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "</li>";
}

const missile = new Tactical("Missile", "missile", "Choose a target and roll 5 combat dice")
const repairDrone = new Tactical("Repair drone", "repairDrone", "Choose a friendly and restore 3 hp")
const assist = new Tactical("Assist", "assist", "Draw a tactical card, then give a card in your hand to another player")
const drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly and bring it to you")
const heatSeeker = new Tactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy")
const bomb = new Tactical("Bomb", "bomb", "Deal 6 damage to a single target, and 2 damage to the target on either side of it.")
const feint = new Tactical("Feint", "feint", "Reuse a tactical card you already used this round")
const barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself and place it in the middle of the fray")
const scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 1 damage to 2 adjacent enemies")
const immelman = new Tactical("Immelmann", "immelman", "Missile on your own pursuer")
const jammer = new Tactical("Jammer", "jammer", "Nullify damage to the friendly base from an enemy base card")

const tacticalDeck = [];
const tacticalDiscard = [];
