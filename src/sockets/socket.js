const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // user online
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // join chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log("User joined chat:", chatId);
    });

    // send message
    socket.on("sendMessage", (data) => {
      const { chatId, message } = data;

      io.to(chatId).emit("receiveMessage", message);
    });

    // typing indicator
    socket.on("typing", (data) => {
      const { chatId, userId } = data;

      socket.to(chatId).emit("typing", userId);
    });

    socket.on("stopTyping", (data) => {
      const { chatId, userId } = data;

      socket.to(chatId).emit("stopTyping", userId);
    });

    // message seen
    socket.on("messageSeen", (data) => {
      const { chatId, messageId, userId } = data;

      io.to(chatId).emit("messageSeen", {
        messageId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));

      console.log("User disconnected:", socket.id);
    });

    // Send Notification
    socket.on("sendNotification", (data) => {
      const { receiverId, notification } = data;

      const socketId = onlineUsers.get(receiverId);

      if (socketId) {
        io.to(socketId).emit("notification", notification);
      }
    });

    // join Group chat
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    // Send Group massage
    socket.on("sendMessage", ({ chatId, message }) => {
      io.to(chatId).emit("receiveMessage", message);
    });

    // STORY SEEN REALTIME
    socket.on("storySeen", (data) => {
      const { storyOwnerId, viewerId, storyId } = data;

      const socketId = onlineUsers.get(storyOwnerId);

      if (socketId) {
        io.to(socketId).emit("storySeenUpdate", {
          viewerId,
          storyId,
        });
      }
    });

    // STORY REACTION REALTIME
    socket.on("storyReaction", (data) => {
      const { storyOwnerId, reaction, storyId } = data;

      const socketId = onlineUsers.get(storyOwnerId);

      if (socketId) {
        io.to(socketId).emit("storyReactionUpdate", {
          reaction,
          storyId,
        });
      }
    });
  });
};

module.exports = socketHandler;
