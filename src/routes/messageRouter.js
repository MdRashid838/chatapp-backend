const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  sendMediaMessage,
} = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// 1. Get messages of a chat
router.get("/:chatId", authMiddleware, getMessages);

// 2. Send text message (Use sendMessage here)
router.post("/", authMiddleware, sendMessage);

// 3. Send media message
router.post(
  "/media",
  authMiddleware,
  upload.single("file"),
  sendMediaMessage
);

module.exports = router;