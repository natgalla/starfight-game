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
    },
    user2: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
    },
    user3: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
    },
    user4: {
      name: {type: String, default: ""},
      leader: {type: Boolean, default: false },
      socketId: {type: String, default: ""},
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
    shuffles: {
      tactical: { type: Number, default: 0 },
      enemy: { type: Number, default: 0 }
    },
    won: {type: Boolean, default: false},
    lost: {type: Boolean, default: false},
    aborted: {type: Boolean, default: false}
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
