const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {

    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "username profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMediaMessage = async (req,res)=>{
  try{

    const { chatId } = req.body;

    const message = await Message.create({
      chatId,
      sender: req.userId,
      media: req.file.path
    });

    res.json(message)

  }catch(err){
    res.status(500).json({message:err.message})
  }
}