let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

let UserSchema = new mongoose.Schema({
  callsign: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  updates: {
    type: Boolean,
    required: false
  },
  meta: {
    wins: {type: Number, default: 0},
    losses: {type: Number, default: 0},
    rank: {type: String, default: "Ensign"}
  }
});

UserSchema.statics.authenticate = function(callsign, password, callback) {
  User.findOne({ callsign: callsign })
    .exec(function (error, user) {
      if (error) {
        return callback(error);
      } else if ( !user ) {
        let err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function(error, result) {
        if (result) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

UserSchema.pre('save', function(next) {
  let user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

let User = mongoose.model('User', UserSchema);
module.exports = User;
