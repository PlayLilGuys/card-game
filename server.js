// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Create app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store player ready states
let playersReady = {};

// Serve all files in the "public" folder
app.use(express.static("public"));

// When a player connects
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);
  
  // Initialize player as not ready
  playersReady[socket.id] = false;
  
  // Send current ready list to new player
  socket.emit("allPlayersReady", playersReady);
  
  // Broadcast updated player count to everyone
  io.emit("allPlayersReady", playersReady);

  // Handle ready state changes
  socket.on("toggleReady", (data) => {
    console.log(`Player ${socket.id} ready state:`, data.ready);
    playersReady[socket.id] = data.ready;
    
    // Broadcast to everyone including sender
    io.emit("playerReady", { playerId: socket.id, ready: data.ready });
    io.emit("allPlayersReady", playersReady);
  });

  // Handle card plays
  socket.on("playCard", (data) => {
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
    console.log(`Player ${socket.id} rolled:`, data.roll);
    socket.broadcast.emit("diceRolled", {
      playerId: socket.id,
      roll: data.roll,
      totalMagic: data.totalMagic
    });
  });

  // Handle turn ends
  socket.on("endTurn", (data) => {
    console.log(`Player ${socket.id} ended turn`);
    socket.broadcast.emit("turnEnded", {
      playerId: socket.id,
      newCurrentPlayer: data.newCurrentPlayer,
      currentTurn: data.currentTurn
    });
  });

  // When a player disconnects
  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
    delete playersReady[socket.id];
    io.emit("allPlayersReady", playersReady);
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
