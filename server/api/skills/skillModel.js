const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },
  name: { type: String, default: '' },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  addedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
});

module.exports = mongoose.model("skill", skillSchema);