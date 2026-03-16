const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware")
const { sendMessage, getChats,createGroup,addMember ,removeMember } = require("../controllers/chatController");

router.post("/send", auth, sendMessage);
router.get("/", auth, getChats);
router.post("/group",auth,createGroup);
router.put("/group/add", auth, addMember);
router.put("/group/remove", auth, removeMember);

module.exports = router;