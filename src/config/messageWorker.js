const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const Message = require("../models/Message");
require("dotenv").config();

const { getIO } = require("../sockets/socketInstance");

const worker = new Worker(
  "messageQueue",

  async (job) => {
    try {
      const { chatId, sender, text } = job.data;

      console.log("📩 Processing message job:", job.id);
      console.log("Chat ID:", chatId);
      console.log("Sender:", sender);

      // Save message to MongoDB
      const newMessage = await Message.create({
        chatId,
        sender,
        text,
        status: "sent",
      });

      console.log("✅ Message saved:", newMessage._id);

      // Send realtime message through Socket.IO
      const io = getIO();

      if (io) {
        io.to(chatId.toString()).emit(
          "receiveMessage",
          newMessage
        );

        console.log("📡 Message emitted to chat:", chatId);
      }

      return newMessage;

    } catch (error) {
      console.error("❌ Worker message error:", error);
      throw error;
    }
  },

  {
    connection: {
      url: process.env.REDIS_URL,
    },
  }
);

// Job completed
worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id);
});

// Job failed
worker.on("failed", (job, error) => {
  console.error(
    "❌ Job failed:",
    job?.id,
    error.message
  );
});

// Worker error
worker.on("error", (error) => {
  console.error("❌ Worker error:", error);
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Worker MongoDB Connected...");
  })
  .catch((error) => {
    console.error(
      "❌ Worker MongoDB connection failed:",
      error.message
    );
  });