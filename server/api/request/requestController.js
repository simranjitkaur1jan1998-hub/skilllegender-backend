const requestModel = require("./requestModel");
const Joi = require("joi");
const mongoose = require("mongoose");

// ADD REQUEST
const add = async (req, res) => {
  const schema = Joi.object({
    sessionId: Joi.string().required(),
    mentorId: Joi.string().required(),
    learnerId: Joi.string().required(),
    date: Joi.date().required(),
    timeSlot: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.send({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  try {
    let total = await requestModel.countDocuments();
    let newRequest = new requestModel();
    newRequest.autoId = total + 1;
    newRequest.sessionId = value.sessionId;
    newRequest.mentorId = value.mentorId;
    newRequest.learnerId = value.learnerId;
    newRequest.date = value.date;
    newRequest.timeSlot = value.timeSlot;

    await newRequest.save();

    res.send({
      success: true,
      status: 201,
      message: "Request sent successfully",
      data: newRequest,
    });
  } catch (err) {
    console.error("Add Request Error:", err);
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// ALL REQUESTS
const all = async (req, res) => {
  try {
    let filter = { isDeleted: false };
    if (req.body.learnerId) filter.learnerId = req.body.learnerId;
    if (req.body.mentorId) filter.mentorId = req.body.mentorId;

    let limit = parseInt(req.body.limit) || 10;
    let skip = parseInt(req.body.startPoint) || 0;

    const total = await requestModel.countDocuments(filter);
    const requests = await requestModel.find(filter)
      .populate("sessionId")
      .populate("mentorId")
      .populate("learnerId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const reviewModel = require("../reviews/reviewModel");
    const data = await Promise.all(requests.map(async (req) => {
      if (req.isReviewed) {
        const review = await reviewModel.findOne({ requestId: req._id }).lean();
        req.reviewData = review;
      }
      return req;
    }));

    res.send({
      success: true,
      status: 200,
      data: data,
      total: total,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// UPDATE STATUS
const updateStatus = async (req, res) => {
  try {
    const { _id, status, meetingLink } = req.body;
    if (!_id || !status) {
      return res.send({ success: false, message: "ID and status are required" });
    }

    let updateData = { status };
    if (meetingLink) updateData.meetingLink = meetingLink;

    const updated = await requestModel.findByIdAndUpdate(_id, updateData, { new: true });

    res.send({
      success: true,
      status: 200,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// ALL PAYMENTS
const allPayments = async (req, res) => {
  try {
    let limit = parseInt(req.body.limit) || 10;
    let skip = parseInt(req.body.startPoint) || 0;
    let filter = { paymentStatus: "paid", isDeleted: false };

    const total = await requestModel.countDocuments(filter);
    const payments = await requestModel.find(filter)
      .populate("sessionId")
      .populate("mentorId")
      .populate("learnerId")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.send({
      success: true,
      status: 200,
      data: payments,
      total: total,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

module.exports = {
  add,
  all,
  updateStatus,
  allPayments,
};
