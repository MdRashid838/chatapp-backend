const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {

    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "username profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};