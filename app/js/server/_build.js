// Tactical cards
let repairDrone = new Tactical("Repair drone", "repairDrone", "Remove 3 damage from a friendly (any)");
let missile = new Tactical("Missile", "missile", "Damage a target for a 'fire' roll plus a missile die");
let drawFire = new Tactical("Draw Fire", "drawFire", "Remove a pursuer from a friendly and bring it to you");
let feint = new Tactical("Feint", "feint", "Reuse the last tactical card you used this round");
let barrelRoll = new Tactical("Barrel Roll", "barrelRoll", "Remove a pursuer from yourself. It now pursues the friendly base");
let scatterShot = new Tactical("Scattershot", "scatterShot", "Deal 2 damage to a target, and 1 damage to each adjacent target (ff)");
let immelman = new Tactical("Immelman", "immelman", "Missile an enemy pursuing you");

// Advanced tactics
// let medalOfHonor = new AdvTactical("Medal of Honor", "medalOfHonor", "Every enemy destroyed is worth 1 extra merit", 10);
// let daredevil = new AdvTactical("Daredevil", "daredevil", "Allows you to attack the EB with 1 pursuer", 10);
// let medic = new AdvTactical("Medic", "medic", "Restore 1 armor to a friendly of your choice each round", 10);
// let sharpShooter = new AdvTactical("Sharp Shooter", "sharpshooter", "Improve player accuracy rolls/add an extra die", 10);
let bomb = new AdvTactical("Bomb", "bomb", "Deal 6 damage to a target, and 2 damage to each adjacent target (or friendly)", 8);
let heatSeeker = new AdvTactical("Heat Seeker", "heatSeeker", "Deal 5 damage to a chosen enemy", 5);
let healthPack = new AdvTactical("Emergency repairs", "healthPack", "Remove 5 damage from a friendly (any)", 4);
let jammer = new AdvTactical("Jammer", "jammer", "Do not draw an enemy base card next round", 6);
let intercept = new AdvTactical("Intercept", "intercept", "Draw one less enemy into play next round", 6);
let emp = new AdvTactical("EMP", "emp", "Choose a friendly (other). Their pursuers cannot damage them this round", 5);
let countermeasures = new AdvTactical("Counter measures", "countermeasures", "Ignore damage this round equal to the result of a 'fire' roll", 2);
let divertShields = new AdvTactical("Divert Shields", "divertShields", "Keep this card. It absorbs the next 5 damage you take", 3);
let jump = new AdvTactical("Jump", "jump", "Discard all of your pursuers this round", 15);
let hardSix = new AdvTactical("Roll the hard six", "hardSix", "If pursued, missile the enemy base and take damage of a 'fire' roll", 6);
let snapshot = new AdvTactical("Snapshot", "snapshot", "Remove an enemy from play (no merit awarded)", 7);
let guidedMissile = new AdvTactical("Guided Missile", "guidedMissile", "Deal 6 damage to the enemy base, even if pursued", 10);
let incinerate = new AdvTactical("Incinerate", "incinerate", "Destroy the first enemy drawn to you next round", 7);


// define enemy types
let ace = new Enemy("Ace","ace",6,4,5,4);
let heavy = new Enemy("Heavy","heavy",5,3,3,3);
let medium = new Enemy("Medium","medium",4,2,4,2);
let light = new Enemy("Light","light",3,2,4,1);
let empty = new Enemy("Empty space","emptySpace",0,0,0,0);
let placeHolder = new Enemy("Destroyed","destroyed",0,0,0,0);

// define enemy base cards
let fireLight = new EnemyBaseCard("Fire light weapons", "fireLight", "Dealt 3 damage to Friendly Base");
let fireHeavy = new EnemyBaseCard("Fire heavy weapons", "fireHeavy", "Dealt 5 damage to Friendly Base");
let deploy = new EnemyBaseCard("Deploy", "deploy", "Launched an extra enemy fighter");
let repair = new EnemyBaseCard("Repairs", "repair", "Repaired 5 armor.");
let reinforce = new EnemyBaseCard("Reinforcements", "reinforce", "Increased launch rate by 1");
