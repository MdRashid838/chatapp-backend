const Chat = require("../models/Chat");
const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {

    const { chatId, text } = req.body;

    const message = await Message.create({
      chatId,
      sender: req.userId,
      text
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });

    res.json(message);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChats = async (req, res) => {
  try {

    const chats = await Chat.find({
      participants: req.userId
    })
      .populate("participants", "username avatar")
      .populate("lastMessage");

    res.json(chats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};