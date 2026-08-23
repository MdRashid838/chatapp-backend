const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { getIO } = require("../sockets/socketInstance");
const mongoose = require("mongoose");

// 1. Send Text Message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.userId || req.user?._id;
    const { chatId, text } = req.body;

    if (!chatId || !text || !text.trim()) {
      return res.status(400).json({ message: "chatId and text are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId format" });
    }

    // Schema ke fields: chatId, sender, text
    const newMessage = await Message.create({
      chatId: chatId,
      sender: senderId,
      text: text.trim(),
      status: "sent",
    });

    // Chat ka lastMessage update karein
    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

    // Populate sender details (name, username, avatar)
    const fullMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name username avatar profilePic"
    );

    // Realtime Socket delivery to chat room
    try {
      const io = getIO() || req.app.get("io");
      if (io) {
        io.to(chatId.toString()).emit("receiveMessage", fullMessage);
      }
    } catch (socketErr) {
      console.warn("Socket broadcast warning:", socketErr.message);
    }

    return res.status(201).json(fullMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// 2. Get All Messages for a Chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const messages = await Message.find({ chatId })
      .populate("sender", "name username avatar profilePic")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 3. Send Media Message
exports.sendMediaMessage = async (req, res) => {
  try {
    const senderId = req.userId || req.user?._id;
    const { chatId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const message = await Message.create({
      chatId,
      sender: senderId,
      mediaUrl: req.file.path,
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const fullMessage = await Message.findById(message._id).populate(
      "sender",
      "name username avatar profilePic"
    );

    const io = getIO() || req.app.get("io");
    if (io) {
      io.to(chatId.toString()).emit("receiveMessage", fullMessage);
    }

    return res.status(201).json(fullMessage);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};