const Message = require("../models/Message");
const messageQueue = require("../queue/messageQueue");

const { encryptMessage } = require("../utils/encryption");

// exports.sendTextMessage = async (req, res) => {
//   try {

//     const { chatId, text } = req.body;

//     await messageQueue.add("newMessage", {
//   chatId,
//   sender: req.userId,
//   text: encryptMessage(text)
// });

//     res.json({
//       message: "Message queued successfully"
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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

exports.sendTextMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    console.log("========== SEND MESSAGE ==========");
    console.log("chatId:", chatId);
    console.log("text:", text);
    console.log("userId:", req.userId);

    if (!chatId) {
      return res.status(400).json({
        message: "chatId is required",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }

    const encryptedText = encryptMessage(text);

    console.log("Encryption successful");

    const job = await messageQueue.add("newMessage", {
      chatId,
      sender: req.userId,
      text: encryptedText,
    });

    console.log("JOB CREATED:", job.id);
    console.log("================================");

    res.status(200).json({
      message: "Message queued successfully",
      jobId: job.id,
    });

  } catch (error) {
    console.error("========== SEND MESSAGE ERROR ==========");
    console.error(error);
    console.error("========================================");

    res.status(500).json({
      message: error.message,
    });
  }
};