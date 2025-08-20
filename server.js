// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Create app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store player ready states and shared game state
let playersReady = {};
let gameStarted = false;
let sharedCardPool = [];
let sharedGameState = null;
let currentPlayer = 1;
let currentTurn = 1;

// Initialize shared card pool
const customCards = [
    {
        id: 'NN-1',
        type: 'monster',
        name: 'Card NN-1',
        cost: 2,
        attack: 8,
        health: 6,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-1.webp',
        smack: {
            cost: 1,
            name: 'Spell Search',
            description: 'Search deck for spells and add to hand',
            effect: 'search_spells'
        }
    },
    {
        id: 'NN-2',
        type: 'monster',
        name: 'Card NN-2',
        cost: 1,
        attack: 4,
        health: 5,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-2.webp',
        smack: {
            cost: 1,
            name: 'Magic Boost',
            description: '+2 magic on next turn',
            effect: 'magic_boost'
        }
    },
    {
        id: 'NN-3',
        type: 'monster',
        name: 'Card NN-3',
        cost: 3,
        attack: 5,
        health: 10,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-3.webp',
        smack: {
            cost: 0,
            name: 'Empty Lane Power',
            description: 'Gain +1 attack for each of your empty monster lanes',
            effect: 'empty_lane_power'
        }
    },
    {
        id: 'NN-4',
        type: 'monster',
        name: 'Card NN-4',
        cost: 1,
        attack: 3,
        health: 3,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-4.webp',
        smack: {
            cost: 2,
            name: 'Team Heal',
            description: 'Give all of your monsters +3 health',
            effect: 'team_heal'
        }
    },
    {
        id: 'NN-5',
        type: 'monster',
        name: 'Card NN-5',
        cost: 1,
        attack: 3,
        health: 3,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-5.webp',
        smack: {
            cost: 1,
            name: 'Building Search',
            description: 'Search deck for a building and add to hand',
            effect: 'search_building'
        }
    },
    {
        id: 'BB-1',
        type: 'building',
        name: 'Power Boost Building',
        cost: 1,
        effect: 'Gives +3 Attack and +3 Health to monsters in this lane',
        attackBonus: 3,
        healthBonus: 3,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/BB-1.webp'
    },
    {
        id: 'BB-2',
        type: 'building',
        name: 'Health Boost Building',
        cost: 1,
        effect: 'Gives +5 Health to monsters in this lane',
        attackBonus: 0,
        healthBonus: 5,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/BB-2.webp'
    },
    {
        id: 'NN-6',
        type: 'monster',
        cost: 2,
        attack: 6,
        health: 2,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-6.webp',
        smack: {
            cost: 1,
            name: 'Area Damage',
            description: 'Deal 2 damage to all enemy monsters',
            effect: 'area_damage'
        }
    },
    {
        id: 'NN-7',
        type: 'monster',
        cost: 1,
        attack: 5,
        health: 3,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-7.webp',
        smack: {
            cost: 0,
            name: 'Monster Swap',
            description: 'Switch places with another of your monsters',
            effect: 'monster_swap'
        }
    },
    {
        id: 'NN-8',
        type: 'monster',
        cost: 2,
        attack: 6,
        health: 10,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-8.webp',
        smack: {
            cost: 2,
            name: 'Wizard Heal',
            description: 'Heal your wizard for 5',
            effect: 'heal_wizard'
        }
    },
    {
        id: 'NN-9',
        type: 'monster',
        cost: 1,
        attack: 6,
        health: 8,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-9.webp',
        smack: {
            cost: 2,
            name: 'Hand Refresh',
            description: 'Shuffle your hand into deck and draw 3 cards',
            effect: 'refresh_hand'
        }
    },
    {
        id: 'NN-10',
        type: 'monster',
        name: 'Card NN-10',
        cost: 2,
        attack: 13,
        health: 6,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-10.webp',
        smack: {
            cost: 3,
            name: 'Force Discard',
            description: 'Opponent discards up to 2 cards',
            effect: 'force_discard_2'
        }
    },
    {
        id: 'NN-11',
        type: 'monster',
        name: 'Card NN-11',
        cost: 1,
        attack: 2,
        health: 4,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-11.webp',
        smack: {
            cost: 1,
            name: 'Shield Up',
            description: 'Cannot take damage next turn',
            effect: 'shield_next_turn'
        }
    },
    {
        id: 'NN-12',
        type: 'monster',
        name: 'Card NN-12',
        cost: 1,
        attack: 1,
        health: 12,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-12.webp',
        smack: {
            cost: 1,
            name: 'Draw 2',
            description: 'Draw 2 cards',
            effect: 'draw_2_cards'
        }
    },
    {
        id: 'BB-4',
        type: 'building',
        name: 'Damage Reduction Building',
        cost: 1,
        effect: 'Monsters in this lane take 2 less damage',
        damageReduction: 2,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/BB-4.webp'
    },
    {
        id: 'NN-13',
        type: 'monster',
        name: 'Card NN-13',
        cost: 2,
        attack: 3,
        health: 9,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-13.webp',
        smack: {
            cost: 1,
            name: 'Direct Hit',
            description: 'Deal 2 damage directly to player 2 wizard',
            effect: 'direct_hit_p2'
        }
    },
    {
        id: 'NN-14',
        type: 'monster',
        name: 'Card NN-14',
        cost: 1,
        attack: 2,
        health: 3,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/NN-14.webp',
        smack: {
            cost: 2,
            name: 'Team Power Up',
            description: 'Give +1 attack and +1 health to each of your monsters',
            effect: 'team_power_up'
        }
    },
    {
        id: 'BB-5',
        type: 'building',
        name: 'Power Up Building',
        cost: 2,
        effect: 'Gives the monster in this lane +1 attack at the start of each turn',
        attackBonus: 0,
        healthBonus: 0,
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/BB-5.webp'
    },
    {
        id: 'SS-2',
        type: 'spell',
        name: 'Return Spell',
        cost: 1,
        effect: 'Move enemy monster back to their hand',
        spellEffect: 'return_enemy_monster',
        image: 'https://playlilguys.com/wp-content/uploads/2025/07/SS-2.webp'
    }
];

function initializeGame() {
    // Reset shared card pool with unique IDs
    sharedCardPool = [];
    let cardIdCounter = 1;
    customCards.forEach(card => {
        sharedCardPool.push({...card, uniqueId: cardIdCounter++});
    });
    
    // Initialize shared game state
    sharedGameState = {
        player1: {
            health: 25,
            magic: 0,
            hand: [],
            deckSize: 19, // Will be updated after dealing cards
            usedSmacks: [],
            nextTurnMagicBonus: 0,
            board: {
                1: { monster: null, building: null },
                2: { monster: null, building: null },
                3: { monster: null, building: null },
                4: { monster: null, building: null }
            }
        },
        player2: {
            health: 25,
            magic: 0,
            hand: [],
            deckSize: 19, // Will be updated after dealing cards
            usedSmacks: [],
            nextTurnMagicBonus: 0,
            board: {
                1: { monster: null, building: null },
                2: { monster: null, building: null },
                3: { monster: null, building: null },
                4: { monster: null, building: null }
            }
        }
    };
    
    // Deal initial hands
    for (let i = 0; i < 5; i++) {
        if (sharedCardPool.length > 0) {
            const card1 = sharedCardPool.splice(Math.floor(Math.random() * sharedCardPool.length), 1)[0];
            sharedGameState.player1.hand.push(card1);
        }
        if (sharedCardPool.length > 0) {
            const card2 = sharedCardPool.splice(Math.floor(Math.random() * sharedCardPool.length), 1)[0];
            sharedGameState.player2.hand.push(card2);
        }
    }
    
    // Set deck sizes to remaining cards in shared pool
    sharedGameState.player1.deckSize = sharedCardPool.length;
    sharedGameState.player2.deckSize = sharedCardPool.length;
}

// Serve all files in the "public" folder
app.use(express.static("public"));

// When a player connects
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);
  
  // Check if game is full (max 2 players)
  if (Object.keys(playersReady).length >= 2 && !playersReady[socket.id]) {
    console.log("Game is full, disconnecting player:", socket.id);
    socket.emit("gameFull");
    socket.disconnect();
    return;
  }
  
  // Initialize player as not ready
  playersReady[socket.id] = false;
  
  // Send current ready list to new player
  socket.emit("allPlayersReady", playersReady);
  
  // Broadcast updated player count to everyone
  io.emit("allPlayersReady", playersReady);
  
  // If game is already started, send current game state
  if (gameStarted && sharedGameState) {
    socket.emit("gameStateUpdate", sharedGameState);
  }

  // Handle ready state changes
  socket.on("toggleReady", (data) => {
    console.log(`Player ${socket.id} ready state:`, data.ready);
    playersReady[socket.id] = data.ready;
    
    // Broadcast to everyone
    io.emit("playerReady", { playerId: socket.id, ready: data.ready });
    io.emit("allPlayersReady", playersReady);
    
    // Check if we should start the game (only allow exactly 2 players)
    const readyPlayers = Object.values(playersReady).filter(ready => ready);
    const totalPlayers = Object.keys(playersReady).length;
    
    if (readyPlayers.length === 2 && totalPlayers === 2 && !gameStarted) {
      gameStarted = true;
      currentPlayer = 1; // Reset turn state
      currentTurn = 1;
      initializeGame();
      
      // Send game state with turn info
      const gameStartData = {
        ...sharedGameState,
        currentPlayer: currentPlayer,
        currentTurn: currentTurn
      };
      
      io.emit("gameStarted", gameStartData);
      console.log("Game started with 2 players!");
    }
  });

  // Handle card plays
  socket.on("playCard", (data) => {
    if (!gameStarted) return;
    
    console.log(`Player ${socket.id} played card:`, data.card.name, "in lane", data.lane);
    socket.broadcast.emit("cardPlayed", {
      playerId: socket.id,
      card: data.card,
      lane: data.lane,
      type: data.type,
      gameState: data.gameState
    });
  });

  // Handle dice rolls
  socket.on("rollDice", (data) => {
    if (!gameStarted) return;
    
    console.log(`Player ${socket.id} rolled:`, data.roll);
    socket.broadcast.emit("diceRolled", {
      playerId: socket.id,
      roll: data.roll,
      totalMagic: data.totalMagic
    });
  });

  // Handle turn ends
  socket.on("endTurn", (data) => {
    if (!gameStarted) return;
    
    console.log(`Player ${socket.id} ended turn`);
    
    // Update server-side turn state
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    if (currentPlayer === 1) {
      currentTurn++;
    }
    
    // Reset magic for previous player
    const prevPlayer = currentPlayer === 1 ? 2 : 1;
    sharedGameState[`player${prevPlayer}`].magic = 0;
    
    // Broadcast turn change to all players
    io.emit("turnEnded", {
      playerId: socket.id,
      newCurrentPlayer: currentPlayer,
      currentTurn: currentTurn,
      gameState: sharedGameState
    });
    
    console.log(`Turn ended. Now it's Player ${currentPlayer}'s turn. Turn ${currentTurn}`);
  });

  // When a player disconnects
  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
    
    // Remove from ready list
    delete playersReady[socket.id];
    
    // Reset game if not enough players
    if (Object.keys(playersReady).length < 2) {
      gameStarted = false;
      sharedGameState = null;
      console.log("Game reset due to insufficient players");
    }
    
    // Broadcast updated list to remaining players
    io.emit("allPlayersReady", playersReady);
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
