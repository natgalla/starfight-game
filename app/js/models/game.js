let mongoose = require('mongoose');

let GameSchema = new mongoose.Schema({
  gameName: {
    type: String,
  },
  users: { // should this be an array?
    user1: String,
    user2: String,
    user3: String,
    user4: String
  },
  players: { type: Number, default: 1 },
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
