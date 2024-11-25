const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Chat app backend");
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  // Assign a random username to each client
  const emojis = ["😀", "😂", "😍", "😎", "😜", "🤔", "🙄", "😇", "🤩", "🥳"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  const username = `User${Math.floor(Math.random() * 1000) + randomEmoji}`;
  socket.emit("welcome", { username });

  // Listen for incoming messages
  socket.on("message", (msg) => {
    const messageWithSender = { sender: username, text: msg };
    console.log("Message received:", messageWithSender);

    // Broadcast the message to all clients
    io.emit("message", messageWithSender);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = 5000; // Remove dotenv dependency
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
