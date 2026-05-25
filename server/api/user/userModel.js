const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  password: { type: String, default: "" },
  userType: { type: Number, default: "" },
  learnerMentorId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", default: null },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: null },
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  addedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
});

module.exports = new mongoose.model("user", userSchema);
