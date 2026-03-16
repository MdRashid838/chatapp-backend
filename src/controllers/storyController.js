const Story = require("../models/Story");

exports.createStory = async (req, res) => {
  try {

    const story = await Story.create({
      user: req.userId,
      media: req.file.path
    });

    res.status(201).json(story);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStories = async (req, res) => {
  try {

    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    }).populate("user", "username profilePic");

    res.json(stories);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewStory = async (req, res) => {
  try {

    const { storyId } = req.body;

    const story = await Story.findByIdAndUpdate(
      storyId,
      { $addToSet: { viewers: req.userId } },
      { new: true }
    );

    res.json(story);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};