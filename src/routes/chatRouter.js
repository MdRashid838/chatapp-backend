const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware")
const { sendMessage, getChats } = require("../controllers/chatController");

router.post("/send", auth, sendMessage);
router.get("/", auth, getChats);

module.exports = router;