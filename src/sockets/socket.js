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
        onlineUsers.set(userId, socket.id);

        io.emit(
          "onlineUsers",
          Array.from(onlineUsers.keys())
        );

        // Pending messages
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
    // JOIN CHAT / GROUP
    // =========================
    socket.on("joinChat", (chatId) => {
      if (!chatId) return;

      socket.join(chatId);

      console.log(
        `User ${socket.id} joined chat: ${chatId}`
      );
    });

    // =========================
    // SEND MESSAGE REALTIME
    // =========================
    socket.on("sendMessage", ({ chatId, message }) => {
      if (!chatId || !message) return;

      io.to(chatId).emit(
        "receiveMessage",
        message
      );
    });

    // =========================
    // TYPING
    // =========================
    socket.on("typing", ({ chatId, userId }) => {
      if (!chatId) return;

      socket.to(chatId).emit(
        "typing",
        userId
      );
    });

    // =========================
    // STOP TYPING
    // =========================
    socket.on("stopTyping", ({ chatId, userId }) => {
      if (!chatId) return;

      socket.to(chatId).emit(
        "stopTyping",
        userId
      );
    });

    // =========================
    // MESSAGE DELIVERED
    // =========================
    socket.on("messageDelivered", async (data) => {
      try {
        const {
          messageId,
          userId,
          chatId,
        } = data;

        if (!messageId || !userId || !chatId) {
          return;
        }

        await Message.findByIdAndUpdate(
          messageId,
          {
            $addToSet: {
              deliveredTo: userId,
            },
            status: "delivered",
          }
        );

        io.to(chatId).emit(
          "messageDeliveredUpdate",
          {
            messageId,
            userId,
          }
        );

      } catch (error) {
        console.error(
          "Message delivered error:",
          error.message
        );
      }
    });

    // =========================
    // MESSAGE SEEN
    // =========================
    socket.on("messageSeen", async (data) => {
      try {
        const {
          messageId,
          userId,
          chatId,
        } = data;

        if (!messageId || !userId || !chatId) {
          return;
        }

        await Message.findByIdAndUpdate(
          messageId,
          {
            $addToSet: {
              seenBy: userId,
            },
            status: "seen",
          }
        );

        io.to(chatId).emit(
          "messageSeenUpdate",
          {
            messageId,
            userId,
          }
        );

      } catch (error) {
        console.error(
          "Message seen error:",
          error.message
        );
      }
    });

    // =========================
    // NOTIFICATION
    // =========================
    socket.on(
      "sendNotification",
      ({ receiverId, notification }) => {

        const socketId =
          onlineUsers.get(receiverId);

        if (socketId) {
          io.to(socketId).emit(
            "notification",
            notification
          );
        }
      }
    );

    // =========================
    // STORY SEEN
    // =========================
    socket.on("storySeen", ({
      storyOwnerId,
      viewerId,
      storyId,
    }) => {

      const socketId =
        onlineUsers.get(storyOwnerId);

      if (socketId) {
        io.to(socketId).emit(
          "storySeenUpdate",
          {
            viewerId,
            storyId,
          }
        );
      }
    });

    // =========================
    // STORY REACTION
    // =========================
    socket.on("storyReaction", ({
      storyOwnerId,
      reaction,
      storyId,
    }) => {

      const socketId =
        onlineUsers.get(storyOwnerId);

      if (socketId) {
        io.to(socketId).emit(
          "storyReactionUpdate",
          {
            reaction,
            storyId,
          }
        );
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {

      for (const [
        userId,
        socketId,
      ] of onlineUsers.entries()) {

        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      }

      io.emit(
        "onlineUsers",
        Array.from(onlineUsers.keys())
      );

      console.log(
        "User disconnected:",
        socket.id
      );
    });
  });
};

module.exports = socketHandler;