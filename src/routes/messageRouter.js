const express = require("express");
const router = express.Router();

const { getMessages, sendMediaMessage } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/:chatId", authMiddleware, getMessages);
router.post(
 "/media",
 authMiddleware,
 upload.single("file"),
 sendMediaMessage
)

module.exports = router;