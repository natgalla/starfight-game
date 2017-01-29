function getUser(userId, callback) {
  User.findById(userId, function(error, user) {
    if (error) {
      callback(err, null);
    } else if (user === null) {
      console.error('Error fetching game session');
    } else {
      callback(null, user);
    }
  });
}

function getGameSession(gameId, callback) {
  GameSession.findById(gameId, function(error, game) {
    if (error) {
      callback(err, null);
    } else if (game === null) {
      console.error('Error fetching game session');
    } else {
      callback(null, game);
    }
  });
}

function saveGame(game) {
  getGameSession(game.gameID, function(err, gameSession) {
    if (err) {
      console.error(err);
    } else if (gameSession === null) {
      console.error("Error fetching game session on save");
    } else {
      let endTime = new Date();
      let ms = endTime - gameSession.meta.startTime;
      let min = Math.round(ms/1000/60);
      gameSession.meta.rounds = game.roundNumber;
      gameSession.meta.shuffles.tactical = game.tacticalDeck.shuffles;
      gameSession.meta.shuffles.enemy = game.enemyDeck.shuffles;
      gameSession.meta.advTacticsPurchased = game.advTacticsPurchased;
      gameSession.meta.endTime = endTime;
      gameSession.meta.elapsedTime = min;
      gameSession.meta.hp.enemyBase = game.enemyBase.currentArmor;
      for (let i=0; i < game.friendlies.length; i++) {
        let friendly = game.friendlies[i];
        gameSession.meta.hp[friendly.id] = friendly.currentArmor;
      }
      if (game.win || game.lose) {
        gameSession.gameName = gameSession._id;
        if (game.win) {
          io.to(game.gameID).emit('end', 'Victory!');
          gameSession.meta.won = true;
          gameSession.save(function(err, updatedSession) {
            if (err) {
              console.error(err);
            } else {
              updateObjects(game.gameID, updatedSession);
              updatedSession.players = undefined;
              updatedSession.difficulty = undefined;
              updatedSession.state = undefined;
              updatedSession.save();
              for (let i = 1; i < 5; i++) {
                let user = 'user' + i;
                if (updatedSession.users[user] && updatedSession.users[user].name !== '') {
                  let query = { callsign: updatedSession.users[user].name };
                  User.find(query, function(err, player) {
                    if (err) {
                      console.error(err);
                    } else {
                      let wins = player[0].meta.wins + 1;
                      function getRank(number, list, inc) {
                      	if (number <= list.length*inc && number % inc === 0) {
                      		return list[number/inc-1];
                        }
                      }
                      let ranks = ['Lieutenant', 'Captain', 'Major', 'Lt. Colonel', 'Colonel', 'Commander', 'Admiral'];
                      let query = player[0];
                      let rank = getRank(wins, ranks, 3) || player[0].meta.rank;
                      let update = { 'meta.wins': wins, 'meta.rank': rank };
                      if (wins <= 21 && wins % 3 === 0) {
                        console.log(player[0].callsign + " promoted to " + rank);
                      }
                      User.update(query, update, function() {
                        console.log(updatedSession.users[user].name + " updated");
                      });
                    }
                  });
                } else {
                  continue;
                }
              }
            }
          });
        } else {
          io.to(game.gameID).emit('end', 'Defeat!');
          gameSession.meta.lost = true;
          gameSession.save(function(err, updatedSession) {
            if (err) {
              console.error(err);
            } else {
              updateObjects(game.gameID, updatedSession);
              updatedSession.players = undefined;
              updatedSession.difficulty = undefined;
              updatedSession.state = undefined;
              updatedSession.save();
              for (let i = 1; i < 5; i++) {
                let user = 'user' + i;
                if (updatedSession.users[user] && updatedSession.users[user].name !== '') {
                  let query = { callsign: updatedSession.users[user].name };
                  let update = { $inc: { 'meta.losses': 1 }};
                  User.update(query, update, function() {
                    console.log(updatedSession.users[user].name + " updated");
                  });
                } else {
                  continue;
                }
              }
            }
          });
        }
      } else {
        gameSession.state = [game];
        gameSession.save(function(err, updatedSession) {
          if (err) {
            console.error(err);
          } else {
            updateObjects(game.gameID, updatedSession);
          }
        });
      }
    }
  });
}

function onConnection(socket) {
  let gameId = socket.request._query['room'];
  let userId = socket.request._query['user'];

  function join(player) {
    socket.join(gameId);
    getGameSession(gameId, function(err, gameSession) {
      if (err) {
        console.error(err);
      } else {
        getUser(userId, function(err, user) {
          if (err) {
            console.error(err);
          } else {
            for (person in gameSession.users) {
              if (gameSession.users[person] && gameSession.users[person].name === user.callsign) {
                let ability = gameSession.users[person].ability;
                player[ability]();
              }
            }
            player.name = user.callsign;
            console.log(user.callsign + ' joined ' + gameId + ' as ' + player.id);
            socket.emit('assign', { player: player } );
            socket.on('turn', turn);
            socket.on('chat', function(data) {
              io.to(data.room).emit('chatMessage', data.message);
              if (data.message.toLowerCase().includes('what do you hear')) {
                io.to(data.room).emit('msg', "Nothin' but the wind");
              }
              if (data.message.toLowerCase().includes('good hunting')) {
                io.to(data.room).emit('msg', "So say we all!");
              }
            });
            io.to(gameId).emit('msg', user.callsign + ' joined the game.');
            socket.on('disconnect', function() {
              console.log('User disconnected');
              getGameSession(gameId, function(err, gameSession) {
                if (err) {
                  console.error(err);
                } else {
                  if (!gameSession.meta.lost && !gameSession.meta.won) {
                    io.to(gameId).emit('msg', user.callsign + ' left.');
                    let setNewLeader = false;
                    for (person in gameSession.users) {
                      if (gameSession.users[person] && gameSession.users[person].name === user.callsign) {
                        if (gameSession.users[person].leader) {
                          setNewLeader = true;
                          gameSession.users[person].leader = false;
                        }
                        gameSession.users[person].name = '';
                        gameSession.users[person].socketId = '';
                        gameSession.players -= 1;
                      }
                    }
                    if (setNewLeader) {
                      if (gameSession.users.user1.name.length > 0) {
                        gameSession.users.user1.leader = true;
                        io.to(gameSession.users.user1.socketId).emit('firstPlayer');
                      } else if (gameSession.users.user2.name.length > 0) {
                        gameSession.users.user2.leader = true;
                        io.to(gameSession.users.user2.socketId).emit('firstPlayer');
                      } else if (gameSession.users.user3.name.length > 0) {
                        gameSession.users.user3.leader = true;
                        io.to(gameSession.users.user3.socketId).emit('firstPlayer');
                      } else if (gameSession.users.user4.name.length > 0) {
                        gameSession.users.user4.leader = true;
                        io.to(gameSession.users.user4.socketId).emit('firstPlayer');
                      }
                    }
                    if (gameSession.players === 0) {
                      gameSession.meta.aborted = true;
                      gameSession.gameName = gameSession._id;
                      console.log('Game ' + gameSession._id + ' aborted');
                      if (gameSession.state.length > 0) {
                        let endTime = new Date();
                        let ms = endTime - gameSession.meta.startTime;
                        let min = Math.round(ms/1000/60);
                        gameSession.meta.endTime = endTime;
                        gameSession.meta.elapsedTime = min;
                      }
                      gameSession.state = undefined;
                      gameSession.players = undefined;
                      gameSession.difficulty = undefined;
                    } else {
                      if (gameSession.state.length === 0) {
                        if (gameSession.meta.locked) {
                          gameSession.meta.locked = false;
                        } else if (gameSession.players === 1) {
                          io.to(gameId).emit('closeGame');
                          io.to(gameId).emit('msg', 'Waiting for second player...')
                        }
                      } else {
                        // logic for leaving during active game
                        // currently destroys leaving player's pilot
                        // eventually replace this logic with re-entry option
                        console.log(user.callsign + ' left during active game');
                        loadGame(gameSession, undefined, function(game) {
                          for (let i=0; i < game.friendlies.length; i++) {
                            let friendly = game.friendlies[i];
                            if (friendly.name === user.callsign) {
                              friendly.destroyed(game, 'MIA');
                              break;
                            }
                          }
                          game.nextTurn();
                          saveGame(game);
                        });
                      }
                    }
                    gameSession.save(function (err, updatedSession) {
                      if (err) {
                        console.error(err);
                      } else {
                        console.log('User removed from ' + updatedSession._id);
                      }
                    });
                  }
                }
              });
              socket.leave(gameId);
            });
            getGameSession(gameId, function(err, gameSession) {
              if (err) {
                console.error(err);
              } else {
                if (gameSession.players === 1) {
                  gameSession.users.user1.leader = true;
                }
                for (person in gameSession.users) {
                  if (gameSession.users[person] && gameSession.users[person].name === user.callsign) {
                    gameSession.users[person].socketId = socket.id;
                  }
                }
                gameSession.save();
              }
            })
          }
        });
      }
    });
  }

  function addPlayer(gameId, userId) {
    getGameSession(gameId, function(err, gameSession) {
      if (err) {
        console.error(err);
      } else {
        getUser(userId, function(err, user) {
          if (err) {
            console.error(err);
          } else {
            if (gameSession.users.user1.name === user.callsign) {
              let Player1 = new Player('Player1');
              join(Player1);
            } else if (gameSession.users.user2.name === user.callsign) {
              let Player2 = new Player('Player2');
              join(Player2);
            } else if (gameSession.users.user3.name === user.callsign) {
              let Player3 = new Player('Player3');
              join(Player3);
            } else if (gameSession.users.user4.name === user.callsign) {
              let Player4 = new Player('Player4');
              join(Player4);
            }
          }
        });
      }
    });
  }

  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    } else {
      if (gameSession.players === 4) {
        addPlayer(gameId, userId);
        io.to(gameId).emit('msg', 'Game full');
        gameSession.meta.locked = true;
        gameSession.save();
      } else if (gameSession.players === 3) {
        addPlayer(gameId, userId);
      } else if (gameSession.players === 2) {
        addPlayer(gameId, userId);
        io.to(gameId).emit('msg', 'Game ready');
        io.to(gameId).emit('openGame');
      } else {
        let Player1 = new Player('Player1');
        join(Player1);
        socket.emit('msg', 'Waiting for second player...');
        socket.emit('firstPlayer');
        socket.on('startGame', function(data) {
          let gameId = data.room;
          getGameSession(gameId, function(err, gameSession) {
            if (err) {
              console.error(err);
            } else {
              if (gameSession.players >= 2) {
                let update = {
                  'meta.locked': true,
                  'meta.startTime': new Date(),
                  'meta.endTime': new Date()
                };
                GameSession.update(gameSession, update, function() {
                  io.to(gameId).emit('start');
                  let game = new Game(gameSession._id, gameSession.gameName, gameSession.difficulty);
                  let FriendlyBase = new Friendly("FriendlyBase", gameSession.gameName, 30);
                  let Player1;
                  let Player2;
                  let Player3;
                  let Player4;
                  game.friendlies = [FriendlyBase];
                  gameSession.meta.hp.FriendlyBase = FriendlyBase.currentArmor;
                  gameSession.meta.players = gameSession.players;
                  gameSession.meta.difficulty = gameSession.difficulty;
                  if (gameSession.users.user1 && gameSession.users.user1.name !== "") {
                    Player1 = new Player('Player1', gameSession.users.user1.name);
                    Player1[gameSession.users.user1.ability]();
                    game.friendlies.push(Player1);
                    gameSession.meta.hp.Player1 = Player1.currentArmor;
                  } else {
                    gameSession.users.user1 = undefined;
                    gameSession.meta.hp.Player1 = undefined;
                  }
                  if (gameSession.users.user2 && gameSession.users.user2.name !== "") {
                    Player2 = new Player('Player2', gameSession.users.user2.name);
                    Player2[gameSession.users.user2.ability]();
                    game.friendlies.push(Player2);
                    gameSession.meta.hp.Player2 = Player2.currentArmor;
                  } else {
                    gameSession.users.user2 = undefined;
                    gameSession.meta.hp.Player2 = undefined;
                  }
                  if (gameSession.users.user3 && gameSession.users.user3.name !== "") {
                    Player3 = new Player('Player3', gameSession.users.user3.name);
                    Player3[gameSession.users.user3.ability]();
                    game.friendlies.push(Player3);
                    gameSession.meta.hp.Player3 = Player3.currentArmor;
                  } else {
                    gameSession.users.user3 = undefined;
                    gameSession.meta.hp.Player3 = undefined;
                  }
                  if (gameSession.users.user4 && gameSession.users.user4.name !== "") {
                    Player4 = new Player('Player4', gameSession.users.user4.name);
                    Player4[gameSession.users.user4.ability]();
                    game.friendlies.push(Player4);
                    gameSession.meta.hp.Player4 = Player4.currentArmor;
                  } else {
                    gameSession.users.user4 = undefined;
                    gameSession.meta.hp.Player4 = undefined;
                  }
                  game.buildDecks();
                  game.round();
                  game.update();
                  gameSession.state.push(game);
                  gameSession.save(function(err, updatedSession) {
                    if (err) {
                      console.error(err)
                    } else {
                      updateObjects(gameId, updatedSession);
                    }
                  });
                });
              } else {
                console.error('Error launching game.');
              }
            }
          });
        });
      }
    }
  });
}

function updateObjects(gameId, gameSession) {
  let gameData = {
    game: gameSession.state[0],
  }
  io.to(gameId).emit('update', gameData);
}

function loadGame(gameSession, specs, callback) {
  let game = new Game(gameSession._id, gameSession.gameName, gameSession.difficulty)
  let FriendlyBase = new Friendly('FriendlyBase', gameSession.gameName, 30);
  let Player1 = new Player('Player1');
  let Player2 = new Player('Player2');
  let Player3 = new Player('Player3');
  let Player4 = new Player('Player4');
  let gameState = gameSession.state[0];
  let loadPlayer = function(player, friendly) {
    player.name = friendly.name;
    player.maxArmor = friendly.maxArmor;
    player.currentArmor = friendly.currentArmor;
    player.lastCardUsed = friendly.lastCardUsed;
    player.hand = friendly.hand;
    player.pursuers = friendly.pursuers;
    player.pursuerDamage = friendly.pursuerDamage;
    player.merit = friendly.merit;
    player.effects = friendly.effects;
    player.tacticalCardsPerTurn = friendly.tacticalCardsPerTurn;
    game.friendlies.push(player);
  }
  for (let i = 0; i < gameState.friendlies.length; i++) {
    let friendly = gameState.friendlies[i];
    if (friendly.id === 'FriendlyBase') {
      FriendlyBase.pursuers = friendly.pursuers;
      FriendlyBase.pursuerDamage = friendly.pursuerDamage;
      FriendlyBase.effects = friendly.effects;
      FriendlyBase.currentArmor = friendly.currentArmor;
      game.friendlies.push(FriendlyBase);
    } else if (friendly.id === 'Player1') {
      loadPlayer(Player1, friendly);
    } else if (friendly.id === 'Player2') {
      loadPlayer(Player2, friendly);
    } else if (friendly.id === 'Player3') {
      loadPlayer(Player3, friendly);
    } else if (friendly.id === 'Player4') {
      loadPlayer(Player4, friendly);
    }
  }
  game.roundNumber = gameState.roundNumber;
  game.currentTurn = gameState.currentTurn;
  game.tacticalDeck = gameState.tacticalDeck;
  game.advTactics = gameState.advTactics;
  game.advTacticsPurchased = gameState.advTacticsPurchased;
  game.enemyBaseDeck = gameState.enemyBaseDeck;
  game.enemyDeck = gameState.enemyDeck;
  game.market = gameState.market;
  game.enemiesActive = gameState.enemiesActive;
  game.enemiesPerTurn = gameState.enemiesPerTurn;
  game.currentEnemyBaseCard = gameState.currentEnemyBaseCard;
  game.win = gameState.win;
  game.lose = gameState.lose;
  game.enemiesPerTurn = gameState.enemiesPerTurn;
  game.enemyBase.currentArmor = gameState.enemyBase.currentArmor;
  game.enemyBase.effects = gameState.enemyBase.effects;
  callback(game, specs);
}

function turn(data) {
  let gameId = data.room;
  let specs = data.turnInfo;
  getGameSession(gameId, function(err, gameSession) {
    if (err) {
      console.error(err);
    } else if (gameSession === null) {
      console.error("Error: Turn attempted outside of active game session: " + gameId);
    } else {
      loadGame(gameSession, specs, turnAction);
    }
  });
}

function turnAction(game, specs) {
  let getPlayer = function(id) {
    for (let i=0; i < game.friendlies.length; i++) {
      let friendly = game.friendlies[i];
      if (id === friendly.id) {
        return friendly;
      } else if (id === game.enemyBase.id) {
        return game.enemyBase;
      }
    }
  }

  let friendly = undefined;
  let player = getPlayer(specs.player.id);
  if (specs.friendly !== undefined) {
    friendly = getPlayer(specs.friendly.id);
  }

  if (game.currentTurn === game.friendlies.indexOf(player)) {
    if (specs.button === 'use') {
      game = player.useTactic(game, specs.cardIndex, friendly, specs.pursuerIndex);
    } else {
      game = player.discard(game, specs.cardIndex, specs.button, friendly,
                                                                specs.pursuerIndex,
                                                                specs.purchaseIndex);
    }
    saveGame(game);
  } else {
    io.to(game.gameID).emit('msg', 'Cheating attempt detected');
  }
}
