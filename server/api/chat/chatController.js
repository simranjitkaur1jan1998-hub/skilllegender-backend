const chatModel = require("./chatModel");
const learnerMentorModel = require("../learnerMentor/learnerMentorModel");

// SEND MESSAGE
const send = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.send({ success: false, message: "Sender, receiver and message are required" });
    }

    let newMessage = new chatModel({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    // Emit socket event for real-time delivery
    if (global.io) {
      global.io.to(receiverId).emit("newMessage", newMessage);
    }

    res.send({
      success: true,
      status: 201,
      message: "Message sent",
      data: newMessage,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// GET MESSAGES BETWEEN TWO USERS
const getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.body;

    const messages = await chatModel.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
      isDeleted: false,
    }).sort({ createdAt: 1 });

    // Mark messages as seen
    await chatModel.updateMany(
      { senderId: user2, receiverId: user1, isSeen: false },
      { $set: { isSeen: true } }
    );

    res.send({
      success: true,
      status: 200,
      data: messages,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// GET CHAT LIST (People the user has conversed with)
const getChatList = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.send({ success: false, message: "User ID is required" });
    }

    // Find all messages involving the user
    const chats = await chatModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      isDeleted: false,
    }).sort({ createdAt: -1 });

    // Extract unique user IDs
    const userIds = new Set();
    chats.forEach(chat => {
      if (chat.senderId.toString() !== userId) userIds.add(chat.senderId.toString());
      if (chat.receiverId.toString() !== userId) userIds.add(chat.receiverId.toString());
    });

    // Fetch user details
    const users = await learnerMentorModel.find({
      _id: { $in: Array.from(userIds) }
    }, 'name email profile userType');

    res.send({
      success: true,
      status: 200,
      data: users,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

module.exports = {
  send,
  getConversation,
  getChatList,
};
