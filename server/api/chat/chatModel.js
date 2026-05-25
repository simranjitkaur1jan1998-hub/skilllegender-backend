const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", required: true },
  message: { type: String, required: true },
  isSeen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("chat", chatSchema);
