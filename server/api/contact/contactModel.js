const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  autoId: { type: Number, default: 0 },

  name: { type: String, default: "" },
  email: { type: String, default: "" },
  subject: { type: String, default: "" },
  inquiry: { type: String, default: "" },
  message: { type: String, default: "" },

  status: { type: Boolean, default: true },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model("contact", contactSchema);
