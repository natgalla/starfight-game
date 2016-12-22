// Tactical cards
let repairDrone = new Tactical("Repair drone", "repairDrone", "Remove 3 damage from a friendly (any)");
let missile = new Tactical("Missile", "missile", "Choose a target and roll 5 combat dice");
let drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly (other) and bring it to you");
let feint = new Tactical("Feint", "feint", "Reuse the last tactical card you used this round");
let barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself. It now pursues the friendly base");
let scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 2 damage to a single target, and 1 damage to the target on either side of it");
let immelman = new Tactical("Immelman", "immelman", "Missile an enemy pursuing you");

// Advanced tactics
// let medalOfHonor = new AdvTactical("Medal of Honor", "medalOfHonor", "Every enemy destroyed is worth 1 extra merit", 10);
// let daredevil = new AdvTactical("Daredevil", "daredevel", "Allows you to attack the EB with 1 pursuer", 10);
// let medic = new AdvTactical("Medic", "medic", "Restore 1 armor to a friendly of your choice each round", 10);
// let sharpShooter = new AdvTactical("Sharp Shooter", "sharpshooter", "Improve player accuracy rolls/add an extra die", 10);
let bomb = new AdvTactical("Bomb", "bomb", "Deal 6 damage to a single target, and 2 damage to the target on either side of it", 8);
let heatSeeker = new AdvTactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy", 5);
let healthPack = new AdvTactical("Health Pack", "healthPack", "Remove 5 damage from a friendly (all)", 4);
let jammer = new AdvTactical("Jammer", "jammer", "Do not draw an enemy base card next round", 6);
let intercept = new AdvTactical("Intercept", "intercept", "Draw one less enemy into play next round", 6);
let emp = new AdvTactical("EMP", "emp", "Choose a friendly (other). Their pursuers cannot damage them this round", 5);
let countermeasures = new AdvTactical("CNTRmeasures", "countermeasures", "Ignore x damage where x is the result of a standard combat roll", 2);
let divertShields = new AdvTactical("Divert Shields", "divertShields", "Keep this card. It absorbs the next 5 damage you take", 3);
let jump = new AdvTactical("Jump", "jump", "Shake all your pursuers this round to discard", 15);
let hardSix = new AdvTactical("Roll the hard six", "hardSix", "If pursued, missile the enemy base and take damage of a standard combat roll", 6);
let snapshot = new AdvTactical("Snapshot", "snapshot", "Remove an enemy from play (no merit awarded)", 7);
let guidedMissile = new AdvTactical("Guided Missile", "guidedMissile", "Deal 6 damage to the enemy base regardless of pursuers", 10);
let incinerate = new AdvTactical("Incinerate", "incinerate", "Destroy the first enemy drawn to you next round", 7);


// define enemy types
let ace = new Enemy("Ace","ace",6,4,5,4);
let heavy = new Enemy("Heavy","heavy",5,3,3,3);
let medium = new Enemy("Medium","medium",4,2,4,2);
let light = new Enemy("Light","light",3,2,4,1);
let empty = new Enemy("Empty space","emptySpace",0,0,0,0);
let placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);

// define enemy base cards
let fireLight = new EnemyBaseCard("Fire light weapons", "fireLight", "Friendly base takes 3 damage");
let fireHeavy = new EnemyBaseCard("Fire heavy weapons", "fireHeavy", "Friendly base takes 5 damage");
let deploy = new EnemyBaseCard("Deploy", "deploy", "Draw an extra enemy card into play in the next round");
let repair = new EnemyBaseCard("Repairs", "repair", "Enemy base repairs 5 armor.");
let reinforce = new EnemyBaseCard("Reinforcements", "reinforce", "Increase the amount enemies that enter the fray each turn by 1");

let enemyBase = new EnemyBase();

// define friendlies
let FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
let Player1;
let Player2;
let Player3;
let Player4;

let game = new Game();

let reset = function() {
  FriendlyBase = new Friendly("FriendlyBase", "Friendly Base", 30);
  Player1 = null;
  Player2 = null;
  Player3 = null;
  Player4 = null;

  game = new Game();
}

let startGame = function(game) {
  // build tactical deck
  game.addToDeck(game.tacticalDeck, missile, 6);
  game.addToDeck(game.tacticalDeck, scatterShot, 4);
  game.addToDeck(game.tacticalDeck, drawFire, 3);
  game.addToDeck(game.tacticalDeck, feint, 4);
  game.addToDeck(game.tacticalDeck, barrelRoll, 2);
  game.addToDeck(game.tacticalDeck, immelman, 3);
  game.addToDeck(game.tacticalDeck, repairDrone, 2);

  game.tacticalDeck.size = game.tacticalDeck.cards.length;

  game.shuffle(game.tacticalDeck);

  // build advanced tactical deck
  game.addToDeck(FriendlyBase.advTactics, healthPack, 5);
  game.addToDeck(FriendlyBase.advTactics, heatSeeker, 6);
  game.addToDeck(FriendlyBase.advTactics, bomb, 3);
  game.addToDeck(FriendlyBase.advTactics, snapshot, 3);
  game.addToDeck(FriendlyBase.advTactics, guidedMissile, 3);
  game.addToDeck(FriendlyBase.advTactics, incinerate, 3);
  game.addToDeck(FriendlyBase.advTactics, jammer, 6);
  game.addToDeck(FriendlyBase.advTactics, intercept, 3);
  game.addToDeck(FriendlyBase.advTactics, emp, 2);
  game.addToDeck(FriendlyBase.advTactics, countermeasures, 3);
  game.addToDeck(FriendlyBase.advTactics, divertShields, 2);
  game.addToDeck(FriendlyBase.advTactics, jump, 1);
  game.addToDeck(FriendlyBase.advTactics, hardSix, 4);

  FriendlyBase.advTactics.size = FriendlyBase.advTactics.cards.length;

  game.shuffle(FriendlyBase.advTactics);

  // build enemy deck
  game.addToDeck(enemyBase.enemyDeck, ace, 4);
  game.addToDeck(enemyBase.enemyDeck, heavy, 9);
  game.addToDeck(enemyBase.enemyDeck, medium, 12);
  game.addToDeck(enemyBase.enemyDeck, light, 15);
  game.addToDeck(enemyBase.enemyDeck, empty, game.setEmpties(8, 4, 0));

  enemyBase.enemyDeck.size = enemyBase.enemyDeck.cards.length;

  game.shuffle(enemyBase.enemyDeck);

  // build enemy base deck
  game.buildEnemyBaseDeck();

  enemyBase.enemyBaseDeck.size = enemyBase.enemyBaseDeck.cards.length;

  // set rules dependent on amount of players
  enemyBase.startingEnemies = game.friendlies.length * 2;
  enemyBase.enemiesPerTurn = game.friendlies.length;

  // start first round
  game.round();
}
