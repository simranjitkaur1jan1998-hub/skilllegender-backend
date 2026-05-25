const mongoose = require("mongoose");

const learnerMentorSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: Number, default: 0 },
  profession: { type: String, default: "" },
  experience: { type: String, default: "" },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "skill" }],
  profile: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  rating: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  addedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null }
});

module.exports = mongoose.model("learnerMentor", learnerMentorSchema);