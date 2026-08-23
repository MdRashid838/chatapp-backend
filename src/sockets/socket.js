const Message = require("../models/Message");

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // =========================
    // USER ONLINE
    // =========================
    socket.on("userOnline", async (userId) => {
      try {
        if (!userId) return;
        onlineUsers.set(userId.toString(), socket.id);

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

        // Pending un-delivered messages
        const pendingMessages = await Message.find({
          deliveredTo: { $ne: userId },
        });

        pendingMessages.forEach((msg) => {
          socket.emit("receiveMessage", msg);
        });
      } catch (error) {
        console.error("User online error:", error.message);
      }
    });

    // =========================
    // JOIN CHAT ROOM
    // =========================
    socket.on("joinChat", (chatId) => {
      if (!chatId) return;
      const room = chatId.toString();
      socket.join(room);
      console.log(`User ${socket.id} joined chat room: ${room}`);
    });

    // =========================
    // SEND MESSAGE REALTIME
    // =========================
    socket.on("sendMessage", (data) => {
      if (!data) return;

      // Extract chatId safely (chahe payload { chatId, message } ho ya direct message object)
      const targetChatId =
        data.chatId ||
        data.chat?._id ||
        data.chat ||
        (typeof data.chat === "string" ? data.chat : null);

      const messagePayload = data.message || data;

      if (!targetChatId) {
        console.warn("sendMessage received without valid chatId:", data);
        return;
      }

      // Room ke sabhi participants (including receiver) ko real-time emit
      io.to(targetChatId.toString()).emit("receiveMessage", messagePayload);
    });

    // =========================
    // TYPING
    // =========================
    socket.on("typing", ({ chatId, userId }) => {
      if (!chatId) return;
      socket.to(chatId.toString()).emit("typing", userId);
    });

    // =========================
    // STOP TYPING
    // =========================
    socket.on("stopTyping", ({ chatId, userId }) => {
      if (!chatId) return;
      socket.to(chatId.toString()).emit("stopTyping", userId);
    });

    // =========================
    // MESSAGE DELIVERED
    // =========================
    socket.on("messageDelivered", async (data) => {
      try {
        const { messageId, userId, chatId } = data;
        if (!messageId || !userId || !chatId) return;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deliveredTo: userId },
          status: "delivered",
        });

        io.to(chatId.toString()).emit("messageDeliveredUpdate", {
          messageId,
          userId,
        });
      } catch (error) {
        console.error("Message delivered error:", error.message);
      }
    });

    // =========================
    // MESSAGE SEEN
    // =========================
    socket.on("messageSeen", async (data) => {
      try {
        const { messageId, userId, chatId } = data;
        if (!messageId || !userId || !chatId) return;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { seenBy: userId },
          status: "seen",
        });

        io.to(chatId.toString()).emit("messageSeenUpdate", {
          messageId,
          userId,
        });
      } catch (error) {
        console.error("Message seen error:", error.message);
      }
    });

    // =========================
    // NOTIFICATIONS
    // =========================
    socket.on("sendNotification", ({ receiverId, notification }) => {
      if (!receiverId) return;
      const socketId = onlineUsers.get(receiverId.toString());
      if (socketId) {
        io.to(socketId).emit("notification", notification);
      }
    });

    // =========================
    // STORY SEEN & REACTION
    // =========================
    socket.on("storySeen", ({ storyOwnerId, viewerId, storyId }) => {
      if (!storyOwnerId) return;
      const socketId = onlineUsers.get(storyOwnerId.toString());
      if (socketId) {
        io.to(socketId).emit("storySeenUpdate", { viewerId, storyId });
      }
    });

    socket.on("storyReaction", ({ storyOwnerId, reaction, storyId }) => {
      if (!storyOwnerId) return;
      const socketId = onlineUsers.get(storyOwnerId.toString());
      if (socketId) {
        io.to(socketId).emit("storyReactionUpdate", { reaction, storyId });
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;