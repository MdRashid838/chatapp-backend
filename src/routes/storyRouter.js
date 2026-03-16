const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createStory,
  getStories,
  viewStory
} = require("../controllers/storyController");

router.post("/", authMiddleware, upload.single("file"), createStory);
router.get("/", authMiddleware, getStories);
router.post("/view", authMiddleware, viewStory);

module.exports = router;