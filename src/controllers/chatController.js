const Chat = require("../models/Chat");
const Message = require("../models/Message");

// backend/src/controllers/chatController.js
const User = require("../models/User");
const mongoose = require("mongoose");

// 1. Access or Create One-on-One Chat
exports.accessOrCreateChat = async (req, res) => {
  try {
    const currentUserId = req.userId || req.user?._id;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "userId parameter missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Schema ke mutabiq 'participants' use karein
    let isChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, targetUserId] },
    })
      .populate("participants", "-password")
      .populate("lastMessage");

    if (isChat) {
      return res.status(200).json(isChat);
    }

    // Nayi Chat create karein
    const newChat = await Chat.create({
      participants: [currentUserId, targetUserId],
      isGroup: false,
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate("participants", "-password")
      .populate("lastMessage");

    return res.status(201).json(fullChat);
  } catch (error) {
    console.error("Access chat error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 2. User ke saare chats Sidebar ke liye
exports.getUserChats = async (req, res) => {
  try {
    const currentUserId = req.userId || req.user?._id;

    const chats = await Chat.find({
      participants: { $in: [currentUserId] },
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Get user chats error:", error);
    return res.status(500).json({ message: "Failed to fetch chats", error: error.message });
  }
};

exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Current user ke followers aur following list fetch karo
    const currentUser = await User.findById(currentUserId)
      .populate("followers", "_id name username avatar")
      .populate("following", "_id name username avatar");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Followers aur Following ko combine karke duplicate IDs remove karo
    const allConnected = [...(currentUser.followers || []), ...(currentUser.following || [])];
    const uniqueUserMap = new Map();

    allConnected.forEach((u) => {
      if (u && u._id && u._id.toString() !== currentUserId.toString()) {
        uniqueUserMap.set(u._id.toString(), {
          _id: u._id,
          name: u.name,
          username: u.username,
          avatar: u.avatar || "",
        });
      }
    });

    const userList = Array.from(uniqueUserMap.values());

    res.status(200).json(userList);
  } catch (error) {
    console.error("Fetch chat users error:", error);
    res.status(500).json({ message: "Failed to load chat users", error: error.message });
  }
};

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