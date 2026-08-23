const express = require("express");
const router = express.Router();

const { getMessages, sendMediaMessage, sendTextMessage } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/:chatId", authMiddleware, getMessages);


console.log("authMiddleware:", typeof authMiddleware);
console.log("upload:", typeof upload);
console.log("upload.single:", typeof upload.single);
console.log("sendMediaMessage:", typeof sendMediaMessage);
router.post(
 "/media",
 authMiddleware,
 upload.single("file"),
 sendMediaMessage
)
router.post("/", authMiddleware, sendTextMessage);

module.exports = router;