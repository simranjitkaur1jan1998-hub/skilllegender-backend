const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", default: null },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "session", default: null },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", default: null },
  date: { type: Date, default: Date.now },
  timeSlot: { type: String, default: "" },
  meetingLink: { type: String, default: "" },
  paymentStatus: { type: String, default: "" }, // pending, paid, failed
  status: { type: String, default: "pending" }, // pending, accepted, rejected, completed
  addedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isReviewed: { type: Boolean, default: false },
});

module.exports = new mongoose.model("request", requestSchema);

