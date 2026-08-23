// const User = require("../models/User");

// exports.followUser = async (req, res) => {
//   try {

//     const currentUserId = req.userId;
//     const targetUserId = req.params.id;

//     if (currentUserId === targetUserId) {
//       return res.status(400).json({ message: "You cannot follow yourself" });
//     }

//     const currentUser = await User.findById(currentUserId);
//     const targetUser = await User.findById(targetUserId);

//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (currentUser.following.includes(targetUserId)) {
//       return res.status(400).json({ message: "Already following" });
//     }

//     currentUser.following.push(targetUserId);
//     targetUser.followers.push(currentUserId);

//     await currentUser.save();
//     await targetUser.save();

//     res.json({ message: "User followed successfully" });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.unfollowUser = async (req, res) => {
//   try {

//     const currentUserId = req.userId;
//     const targetUserId = req.params.id;

//     const currentUser = await User.findById(currentUserId);
//     const targetUser = await User.findById(targetUserId);

//     currentUser.following = currentUser.following.filter(
//       (id) => id.toString() !== targetUserId
//     );

//     targetUser.followers = targetUser.followers.filter(
//       (id) => id.toString() !== currentUserId
//     );

//     await currentUser.save();
//     await targetUser.save();

//     res.json({ message: "User unfollowed successfully" });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// exports.getUserProfile = async (req, res) => {
//   try {

//     const user = await User.findById(req.params.id)
//       .select("-password")
//       .populate("followers", "username")
//       .populate("following", "username");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// 1. Get User Profile with Followers/Following counts
// exports.getUserProfile = async (req, res) => {
//   try {
//     const currentUserId = req.userId;
//     const targetUserId = req.params.id || currentUserId;

//     const user = await User.findById(targetUserId).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const followersList = user.followers || [];
//     const followingList = user.following || [];

//     const isFollowing = followersList.some(
//       (f) => f.toString() === currentUserId.toString()
//     );

//     const isSelf = user._id.toString() === currentUserId.toString();

//     res.json({
//       _id: user._id,
//       name: user.name,
//       username: user.username,
//       avatar: user.avatar || "",
//       bio: user.bio || "",
//       followersCount: followersList.length,
//       followingCount: followingList.length,
//       isFollowing,
//       isSelf,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const User = require("../models/User");

// 1. Khud ki Profile fetch karne ke liye
exports.getOwnProfile = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const user = await User.findById(currentUserId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || "",
      bio: user.bio || "",
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0,
      isSelf: true, // Khud ki profile flag
      isFollowing: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Kisi aur user ki Profile fetch karne ke liye
exports.getUserProfile = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.id;

    const user = await User.findById(targetUserId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = user.followers || [];
    const following = user.following || [];
    const isSelf = user._id.toString() === currentUserId.toString();
    const isFollowing = followers.some(
      (f) => (typeof f === "object" ? f._id : f).toString() === currentUserId.toString()
    );

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || "",
      bio: user.bio || "",
      followersCount: followers.length,
      followingCount: following.length,
      isSelf,
      isFollowing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Follow User Controller
exports.followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Already following" });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ 
      message: "User followed successfully",
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Unfollow User Controller
exports.unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ 
      message: "User unfollowed successfully",
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// user.controller.js / userRoutes.js
exports.searchUsers = async (req, res) => {
  try {
    const search = req.query.q || "";
    const currentUserId = req.user?._id; // Auth middleware se logged-in user id

    if (!search.trim()) {
      return res.status(200).json([]);
    }

    // Global Regex Search (Case-insensitive 'i')
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
        // Khud ki ID ko search result se bahar rakho
        { _id: { $ne: currentUserId } },
      ],
    }).select("-password"); // Password field hide karo

    res.status(200).json(users);
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};