const express = require("express");
const router = express.Router();

// Auth middleware
const auth = require("../middleware/authMiddleware");

// Controllers
const {
  getOwnProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  searchUsers,
} = require("../controllers/userController");

// 1. Logged-in user ki profile (PEHLE aayega)
router.get("/profile", auth, getOwnProfile);

// 2. Dusre user ki profile ID ke through (BAAD me aayega)
router.get("/profile/:id", auth, getUserProfile);

// 3. Follow, Unfollow & Search
router.post("/follow/:id", auth, followUser);
router.post("/unfollow/:id", auth, unfollowUser);
router.get("/search", auth, searchUsers);

module.exports = router;