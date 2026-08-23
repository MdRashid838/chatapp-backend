require("dotenv").config();

require("./src/jobs/storyCleanup");

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");

const connectdb = require("./src/config/db");
const { setIO } = require("./src/sockets/socketInstance");
const { pubClient, subClient } = require("./src/config/redis");

const authRoutes = require("./src/routes/authRouter");
const userRoutes = require("./src/routes/userRouter");
const chatRoutes = require("./src/routes/chatRouter");
const messageRoutes = require("./src/routes/messageRouter");
const storyRoutes = require("./src/routes/storyRouter");

const app = express();

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
// server.js
const io = new Server(server, {
  cors: {
    origin: "*", 
    // Ya apna specific frontend render URL: "https://your-frontend.onrender.com"
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// Redis Adapter
io.adapter(createAdapter(pubClient, subClient));

// Store IO instance
setIO(io);

// Socket handlers
const socketHandler = require("./src/sockets/socket");
socketHandler(io);

// MongoDB
connectdb();

// Routes
app.use("/api/story", storyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("ChatApp Live..");
});

// IMPORTANT: use server.listen(), NOT app.listen()
server.listen(5000, () => {
  console.log("Server is running on port 5000....");
});