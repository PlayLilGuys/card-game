// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Create app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve all files in the "public" folder
app.use(express.static("public"));

// When a player connects
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // Example: listen for a "playCard" event
  socket.on("playCard", (card) => {
    console.log(`Player ${socket.id} played:`, card);

    // Send the played card to everyone else in the room
    socket.broadcast.emit("cardPlayed", {
      playerId: socket.id,
      card: card
    });
  });

  // When a player disconnects
  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
