const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },

  requestId: { type: String, default: "" },

  amount: { type: Number, default: 0 },

  paymentMethod: { type: String, default: "" }, // UPI, card, netbanking

  transactionId: { type: String, default: "" },

  paymentStatus: { type: String, default: "" }, // pending, success, failed

  status: { type: Boolean, default: true },

  addedById: { type: String, default: "" },
  updatedById: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },

  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("payment", paymentSchema);
