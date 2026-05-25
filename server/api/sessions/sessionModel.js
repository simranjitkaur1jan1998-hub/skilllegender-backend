const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  autoId: { type: Number, default: null },
  name: { type: String, default: "" },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: "skill", default: null },
  description: { type: String, default: "" },
  sessionType: { type: String, default: "" },
  price: { type: Number, default: 0 },
  image: { type: String, default: "" },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", default: null },
  duration: { type: String, default: '' },
  youtubeLinks: { type: [String], default: [] },
  linkOption: { type: String, enum: ['youtube', 'meeting'], required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: null },
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  addedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
});

module.exports = new mongoose.model("session", sessionSchema);
