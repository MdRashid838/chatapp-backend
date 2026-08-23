const { createClient } = require("redis");

const pubClient = createClient({
  url: process.env.REDIS_URL,
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => {
  console.error("Redis Pub Client Error:", err);
});

subClient.on("error", (err) => {
  console.error("Redis Sub Client Error:", err);
});

const connectRedis = async () => {
  try {
    await pubClient.connect();
    console.log("Redis Pub Client Connected");

    await subClient.connect();
    console.log("Redis Sub Client Connected");

    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis Connection Failed:", error);
  }
};

connectRedis();

module.exports = {
  pubClient,
  subClient,
};