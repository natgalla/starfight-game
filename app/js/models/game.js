let mongoose = require('mongoose');

let GameSchema = new mongoose.Schema({
  gameName: {
    type: String,
    required: true,
    unique: true
  },
  users: {
    user1: { type: String },
    user2: { type: String },
    user3: { type: String },
    user4: { type: String }
  },
  players: { type: Number, default: 1 },
  difficulty: { type: Number, default: 3 },
  meta: {
    locked: { type: Boolean, default: false },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    elapsedTime: { type: Number },
    won: {type: Boolean, default: false},
    lost: {type: Boolean, default: false}
  }
});

let Game = mongoose.model('Game', GameSchema);
module.exports = Game;
