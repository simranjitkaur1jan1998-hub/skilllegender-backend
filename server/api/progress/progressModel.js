const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },

  sessionId: { type: String, default: "" },
  mentorId: { type: String, default: "" },
  learnerId: { type: String, default: "" },

  percentage: { type: Number, default: 0 }, // progress %

  remarks: { type: String, default: "" },

  isBlocked: { type: Boolean, default: false },

  status: { type: Boolean, default: true },

  addedById: { type: String, default: "" },
  updatedById: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },

  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("progress", progressSchema);