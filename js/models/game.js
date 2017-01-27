let mongoose = require('mongoose');

let GameSchema = new mongoose.Schema({
  gameName: {
    type: String,
  },
  users: {
    user1: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
      ability: {type: String, default: ""}
    },
    user2: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
      ability: {type: String, default: ""}
    },
    user3: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
      ability: {type: String, default: ""}
    },
    user4: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
      ability: {type: String, default: ""}
    }
  },
  players: { type: Number, default: 1 },
  state: { type: Array, default: [] },
  difficulty: { type: Number, default: 3 },
  meta: {
    createTime: { type: Date, default: Date.now },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: Date.now },
    elapsedTime: { type: Number, default: 0 },
    locked: { type: Boolean, default: false },
    rounds: { type: Number, default: 0 },
    players: { type: Number, default: 0 },
    difficulty: { type: Number, default: 3 },
    shuffles: {
      tactical: { type: Number, default: 0 },
      enemy: { type: Number, default: 0 },
    },
    hp: {
      FriendlyBase: { type: Number, default: 0 },
      Player1: { type: Number, default: 0 },
      Player2: { type: Number, default: 0 },
      Player3: { type: Number, default: 0 },
      Player4: { type: Number, default: 0 },
      enemyBase: { type: Number, default: 0 },
    },
    won: {type: Boolean, default: false},
    lost: {type: Boolean, default: false},
    aborted: {type: Boolean, default: false},
    advTacticsPurchased: {type: Array, default: []},
  }
});

GameSchema.pre('save', function(next) {
  let game = this;
  mongoose.models['Game'].findOne({gameName: game.gameName}, function(err, results) {
    if(err) {
      return next(err);
    } else if(game.isNew && results) {
      let err = new Error('This game name is currently unavailable. Please choose a different name.');
      err.status = 400;
      return next(err);
    } else {
      return next();
    }
  })
});

let Game = mongoose.model('Game', GameSchema);
module.exports = Game;
