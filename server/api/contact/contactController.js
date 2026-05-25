const contactModel = require("./contactModel");

// ADD CONTACT
const add = async (req, res) => {
  try {
    const { name, email, subject, inquiry, message } = req.body;

    if (!name || !email || !message) {
      return res.send({ success: false, message: "Name, email and message are required" });
    }

    let total = await contactModel.countDocuments();
    let newContact = new contactModel();
    newContact.autoId = total + 1;
    newContact.name = name;
    newContact.email = email;
    newContact.subject = subject || "";
    newContact.inquiry = inquiry || "";
    newContact.message = message;

    await newContact.save();

    res.send({
      success: true,
      status: 201,
      message: "Message sent successfully! We'll get back to you soon.",
      data: newContact,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// GET ALL CONTACTS (Admin)
const all = async (req, res) => {
  try {
    const data = await contactModel
      .find({ isDeleted: false })
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      status: 200,
      data: data,
      total: data.length,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// MARK AS READ
const markRead = async (req, res) => {
  try {
    const { id } = req.body;
    await contactModel.findByIdAndUpdate(id, { isRead: true, updatedAt: Date.now() });
    res.send({ success: true, message: "Marked as read" });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

// DELETE CONTACT
const remove = async (req, res) => {
  try {
    const { id } = req.body;
    await contactModel.findByIdAndUpdate(id, { isDeleted: true, updatedAt: Date.now() });
    res.send({ success: true, message: "Contact deleted" });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

module.exports = { add, all, markRead, remove };
