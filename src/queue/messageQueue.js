const { Queue } = require("bullmq");

const messageQueue = new Queue("messageQueue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

messageQueue.on("error", (error) => {
  console.error("Message Queue Error:", error);
});

module.exports = messageQueue;