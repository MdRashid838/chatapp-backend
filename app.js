require("dotenv").config();
const express = require("express");
const cors = require("cors")
const app = express();

const connectdb = require("./src/config/db")

app.use(cors());
app.use(express.json());


connectdb();


const authRoutes = require("./src/routes/authRouter");
const userRoutes = require("./src/routes/userRouter");
const chatRoutes = require("./src/routes/chatRouter");
const messageRoutes = require("./src/routes/messageRouter");

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