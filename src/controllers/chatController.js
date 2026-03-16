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

// exports.createGroup = async(req,res)=>{

//   const { members, groupName } = req.body

//   const chat = await Chat.create({
//     members,
//     groupName,
//     isGroup:true
//   })

//   res.json(chat)
// };

// Create Group
exports.createGroup = async (req, res) => {
  try {

    const { members, groupName } = req.body;

    if (!members || members.length < 2) {
      return res.status(400).json({ message: "Group needs at least 3 members" });
    }

    const chat = await Chat.create({
      members: [...members, req.userId],
      groupName,
      isGroup: true,
      groupAdmin: req.userId
    });

    res.status(201).json(chat);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Group Member
exports.addMember = async (req, res) => {
  try {

    const { chatId, userId } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    res.json(chat);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove Group Member
exports.removeMember = async (req, res) => {

  const { chatId, userId } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { members: userId } },
    { new: true }
  );

  res.json(chat);
};