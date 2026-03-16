require("dotenv").config();
require("./src/jobs/storyCleanup");
const express = require("express");
const cors = require("cors")
const app = express();
const http = require("http")
const { Server } = require("socket.io");

const connectdb = require("./src/config/db")

app.use(cors());
app.use(express.json());


const {createAdapter} = require("@socket.io/redis-adapter");
const {pubClient , subClient} = require("./src/config/redis");

io.adapter(createAdapter(pubClient, subClient));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const socketHandler = require("./src/sockets/socket");

socketHandler(io);


connectdb();


const authRoutes = require("./src/routes/authRouter");
const userRoutes = require("./src/routes/userRouter");
const chatRoutes = require("./src/routes/chatRouter");
const messageRoutes = require("./src/routes/messageRouter");
const storyRoutes = require("./src/routes/storyRouter");

app.use("/api/story", storyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/",(req,resp) => {
    resp.send("ChatApp Live..")
})

app.listen(5000, ()=>{
    console.log("Server is running....")
})