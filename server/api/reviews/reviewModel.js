const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },

  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "request", default: null },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", default: null },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "learnerMentor", default: null },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "session", default: null },

  rating: { type: Number, default: 0 }, // 1–5

  comment: { type: String, default: "" },

  status: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },

  addedById: { type: String, default: "" },
  updatedById: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },

  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("review", reviewSchema);