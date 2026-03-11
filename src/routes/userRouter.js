const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");


const {
  followUser,
  unfollowUser,
  getUserProfile
} = require("../controllers/userController");

router.post("/follow/:id", auth, followUser);
router.post("/unfollow/:id", auth, unfollowUser);
router.get("/profile/:id", auth, getUserProfile);

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected profile data",
    userId: req.userId
  });
});

module.exports = router;